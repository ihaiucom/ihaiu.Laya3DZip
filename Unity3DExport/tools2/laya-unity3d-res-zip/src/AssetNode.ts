import PathUtil from "./PathUtil";

import path from "path";

function arrayRemoveItem(arr:any[], item:any) {
    var i = arr.indexOf(item);
    if (i != -1) {
        arr.splice(i, 1);
        return true;
    }
    return false;
}

export default class AssetNode
{
    static TYPE_ZIP = "ZIP";
    static UID = 10001;

    public uid:number = 0;
    public path:string = "" ;
    public type:string = "" ;

    public assetBundleName: string = "";

    
    public parents:AssetNode[] = [];
    public childs:AssetNode[] =  [];
    public assets:AssetNode[] =  [];

    public zipNameMap: Map<string, AssetNode> = new Map<string, AssetNode>();
    constructor()
    {
        this.uid = AssetNode.UID ++;
    }

    /** 获取依赖列表 */
    GetDependencieUidList(assetUids:number[], recursive:boolean = false)
    {
        if(this.type != AssetNode.TYPE_ZIP)
        {
            if(!assetUids.includes(this.uid))
            {
                assetUids.push(this.uid);
            }
        }

        for(let item of this.assets)
        {
            if(!assetUids.includes(item.uid))
            {
                assetUids.push(item.uid);
                if(recursive)
                {
                    item.GetDependencieUidList(assetUids, recursive);
                }
            }
        }

        
        for(let item of this.childs)
        {
            if(!assetUids.includes(item.uid))
            {
                assetUids.push(item.uid);
                if(recursive)
                {
                    item.GetDependencieUidList(assetUids, recursive);
                }
            }
        }
    }


    
    public AddAsset(node:AssetNode )
    {
        if (!this.assets.includes(node))
        {
            this.assets.push(node);
            node.parents.push(this);
        }
    }

    public AddDependencie(node:AssetNode )
    {
        if (!this.childs.includes(node))
        {
            this.childs.push(node);
            node.parents.push(this);
        }
    }

    
    public RemoveDependencie(node: AssetNode )
    {
        if (this.childs.includes(node))
        {
            arrayRemoveItem(this.childs, node);
        }

        if (node.parents.includes(this))
        {
            arrayRemoveItem(node.parents, this);
        }
    }

    
    public ClearDependencie()
    {
        
        for(var i = this.childs.length - 1; i >= 0; i -- )
        {
            var child:AssetNode  = this.childs[i];
            this.RemoveDependencie(child);
        }

        
        for(var i = this.parents.length - 1; i >= 0; i -- )
        {
            var parent:AssetNode  = this.parents[i];
            parent.RemoveDependencie(this);
        }
        

    }

    

    public ForcedSetRoot()
    {
        for(var i = this.parents.length - 1; i >= 0; i -- )
        {
            var parent:AssetNode  = this.parents[i];
            parent.RemoveDependencie(this);
        }
    }

    public get assetCount()
    {
        return this.assets.length;
    }

    public get childCount()
    {
        return this.childs.length;
    }

    public get parentCount()
    {
        return this.parents.length;
    }

    public get isRoot():boolean
    {
        return this.parentCount == 0;
    }

    public toString()
    {
        return `${this.path}   \t[parentCount=${this.parentCount},    childCount=${this.childCount},\t\tassetCount=${this.assetCount}]`;
    }


    


    /** 移除父节点的依赖和自己依赖相同的节点 */
    public RemoveParentShare()
    {
        var list:AssetNode[] = this.childs.slice(0);
        for(var cnode of list)
        {
            for(var pnode  of this.parents)
            {
                if (pnode.childs.includes(cnode))
                {
                    pnode.RemoveDependencie(cnode);
                }
            }

            cnode.RemoveParentShare();
        }
    }

    
    /** 包含的资源 合并到 父亲节点 */
    public MergeAssetToParent(pnode: AssetNode )
    {
        for(var node of this.assets)
        {
            pnode.assets.push(node);
            arrayRemoveItem(node.parents, this)
            if (!node.parents.includes(pnode))
            {
                node.parents.push(pnode);
            }
        }
    }

    

    /** 入度为1的节点自动打包到上一级节点 */
    public MergeParentCountOnce()
    {
        for(var i = this.childs.length - 1;  i >= 0; i --)
        {
            var cnode = this.childs[i];
            cnode.MergeParentCountOnce();

            if (cnode.parentCount == 1)
            {
                // 子节点 变为 包含资源
                this.assets.push(cnode);
                arrayRemoveItem(this.childs, cnode);

                // 包含的资源 合并到 父亲节点
                cnode.MergeAssetToParent(this);
            }
        }
    }

    
    /** 获取Root列表 */
    public GetRoots(dict:Map<string, AssetNode> )
    {
        if (this.isRoot)
        {
            if (!dict.has(this.path))
            {
                dict.set(this.path, this);
            }
        }
        else
        {
            for(var i = 0; i < this.parents.length; i ++)
            {
                this.parents[i].GetRoots(dict);
            }
        }
    }

    
    /** 过滤不需要打包的节点 */
    public FilterDotNeedNode(needDict: Map<string, AssetNode>)
    {
        for(var i = this.childs.length - 1; i >= 0; i--)
        {
            var child:AssetNode = this.childs[i];
            child.FilterDotNeedNode(needDict);
        }

        if (!needDict.has(this.path))
        {
            for (var i = this.parents.length - 1; i >= 0; i--)
            {
                var parent:AssetNode  = this.parents[i];
                parent.RemoveDependencie(this);
            }
        }
        else
        {
            var needParentDict:Map<string, AssetNode>  = new Map<string, AssetNode>();

            this.GetNeedParentNodeList(needDict, needParentDict);

            needParentDict.forEach((v, k)=>{
                v.AddDependencie(this);
            })


            for (var i = this.parents.length - 1; i >= 0; i--)
            {
                var parent:AssetNode  = this.parents[i];
                if(!needParentDict.has(parent.path))
                {
                    parent.RemoveDependencie(this);
                }
            }
        }
    }

    public GetNeedParentNodeList(needDict: Map<string, AssetNode> , needParentDict: Map<string, AssetNode> )
    {
        for (var i = this.parents.length - 1; i >= 0; i--)
        {
            var parent:AssetNode  = this.parents[i];
            if (needDict.has(parent.path))
            {
                if (!needParentDict.has(parent.path))
                {
                    needParentDict.set(parent.path, parent);
                }
            }
            else
            {
                parent.GetNeedParentNodeList(needDict, needParentDict);
            }
        }
    }





    
    public GenerateAssetBundleNodesRoot(resourceRoot:string )
    {  
        this.assetBundleName = AssetNode.GetZipName(this.path, resourceRoot);
    }

    static GetZipName(mypath:string, resourceRoot:string)
    {
        var zipName =  mypath.replace(resourceRoot + "/", "").replace(/\//g, '___');
        zipName = zipName.split('.')[0];
        return zipName;
    }

    
    public SetZip(root:AssetNode)
    {
        if(!this.zipNameMap.has(root.assetBundleName))
        {
            this.zipNameMap.set(root.assetBundleName, root);
        }

        for(var node of this.assets)
        {
            node.SetZip(root);
        }

        for(var node of this.childs)
        {
            node.SetZip(root);
        }
        
    }


    public GenerateAssetBundleNodes(bundleDict:Map<string, AssetNode> )
    {
        if (!bundleDict.has(this.path))
        {
            bundleDict.set(this.path, this);
        }

        for(var node of this.childs)
        {
            node.GenerateAssetBundleNodes(bundleDict);
        }
    }




    public  GetTreeInfo(layout:number  = 0, cprestr:string  = "-- ", aprestr:string  = "   "):string
    {
        var cpre = "";
        var apre = "";
        for(var i = 0; i < layout; i ++)
        {
            cpre += cprestr;
            apre += aprestr;
        }

        var str = "";
        if (layout == 0)
        {
            str += cpre + this + "\n";
        }

        layout++;
        cpre += cprestr;
        apre += aprestr;

        for(var i = 0; i < this.assets.length; i ++)
        {
            str += apre + this.assets[i] + "\n";
            str += this.assets[i].GetTreeInfo(layout, cprestr);
        }

        for(var i = 0; i < this.childs.length; i ++)
        {
            str += cpre + this.childs[i] + "\n";
            str += this.childs[i].GetTreeInfo(layout, cprestr);
        }

        return str;
    }

    public PrintTreeInfo()
    {
        console.log(this.GetTreeInfo(0, "-- "));
    }




    public static GetNodeTree(roots:Array<AssetNode> , destr:string ="")
    {

        // 打印信息树
        var str = "[" + destr + "]\n";
        for(var i = 0; i < roots.length; i ++)
        {
            var node = roots[i];
            str += node.GetTreeInfo(0, "-- ");
            str += "========================\n\n";
        }

        return str;
    }


    public static PrintNodeTree(roots:Array<AssetNode> , destr:string ="")
    {

        // 打印信息树
        var str = "[" + destr + "]\n";
        for(var i = 0; i < roots.length; i ++)
        {
            var node = roots[i];
            str += node.GetTreeInfo(0, "-- ");
            str += "========================\n\n";
        }


        console.log(str);
    }


    public static PrintNodeDict(dict:Map<string, AssetNode> , destr:string ="")
    {
        // 打印信息树
        var str = "[" + destr + "]\n";
        dict.forEach((v, k)=>
        {
            str += v.toString() + "\n";
        })
        
        console.log(str);
    }



}