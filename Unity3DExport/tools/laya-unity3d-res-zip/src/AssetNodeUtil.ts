import AssetNode from "./AssetNode";
import EditorUtility from "./EditorUtility";
import Path from "path";
import AssetDatabase from "./AssetDatabase";
import JSZip, { JSZipFileOptions } from "jszip";
import fs from "fs";
import ConfigSetting from "./ConfigSetting";
import Laya3D from "./Laya3D";

export default class AssetNodeUtil
{
    
    public static  isLog:boolean = false;
    public static progressNumOnce:number  = 30;
    public static progressNumOnceLit:number  = 10;

    

    /** 生成所有节点 */
    public static GenerateAllNode(resList: Array<string> , filterDirList:string[] , filterExts:Array<string> , imageExts:Array<string> , isSpriteTag:boolean  = false, assetbundleExt:string  = ".assetbundle"):Map<string, AssetNode> 
    {

        var nodeDict = new Map<string, AssetNode>();
        var spriteTagPackageDict = new Map<string, AssetNode>();
        var spriteTagPackageList:AssetNode[] = [];



        // 生成所有节点
        var dependencies:string[] = AssetDatabase.GetDependencies(resList);
        var count = dependencies.length;


        for(var i = 0; i < count; i ++)
        {
            if(i % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("生成所有节点",  i + "/" + count, 1 * i / count);
            var path = dependencies[i];
            var isFilterDir = false;
            // filter dir
            for(var filterDir of filterDirList)
            {
                if(path.indexOf(filterDir) != -1)
                {
                    isFilterDir = true;
                    break;
                }
            }

            if(isFilterDir) continue;


            var ext = Path.extname(path).toLowerCase();
            if (filterExts.indexOf(ext) != -1) continue;






            var node:AssetNode  = new AssetNode();
            node.path = path;
            nodeDict.set(node.path, node);
        }

        if(this.isLog) AssetNode.PrintNodeDict(nodeDict, "nodeDict");
        if(this.isLog) AssetNode.PrintNodeTree(spriteTagPackageList, "图集");
        EditorUtility.ClearProgressBar();
        return nodeDict;
    }


    /** 生成每个节点依赖的节点 */
    public static GenerateNodeDependencies(nodeDict: Map<string, AssetNode> )
    {
        var count = nodeDict.size;
        var index = 0;

        // 生成每个节点依赖的节点
        nodeDict.forEach((v, k)=>{
            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("生成每个节点依赖的节点",  index + "/" + count, 1 * (index++) / count);

            var node:AssetNode  = v;

            var dependencies:string[]   = AssetDatabase.GetDependencies(node.path);

            for (var i = 0; i < dependencies.length; i++)
            {
                var path:string = dependencies[i];
                if (path == node.path)
                    continue;

                var depNode = nodeDict.get(path);
                if(depNode)
                {
                    node.AddDependencie(depNode);
                }
            }
        })
        
        EditorUtility.ClearProgressBar();
        if(this.isLog) AssetNode.PrintNodeDict(nodeDict, "生成每个节点依赖的节点 nodeDict");
    }




    /** 生成要强制设置Root的节点 */
    public static GenerateForcedRoots(nodeDict: Map<string, AssetNode> ):string[]
    {

        var count = nodeDict.size;
        var index = 0;


        var forceRootList: string[]  = [];
        nodeDict.forEach((v, k)=>{
            
            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("生成要强制设置Root的节点",  index + "/" + count, 1 * (index++) / count);
            var path = v.path;
            
            forceRootList.push(path);
        });

        EditorUtility.ClearProgressBar();
        return forceRootList;
    }


    /** 强制设置某些节点为Root节点，删掉被依赖 */
    public static ForcedSetRoots2(forceRootList:AssetNode[] )
    {
        for(var node of forceRootList)
        {
            node.ForcedSetRoot();
        }

    }


    /** 强制设置某些节点为Root节点，删掉被依赖 */
    public static ForcedSetRoots(nodeDict:Map<string, AssetNode> , forceRootList:string[] )
    {

        var count = forceRootList.length;
        var index = 0;

        for(var path of forceRootList)
        {

            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("强制设置某些节点为Root节点，删掉被依赖",  index + "/" + count, 1 * (index++) / count);

            if (nodeDict.has(path))
            {
                var node: AssetNode  = <AssetNode>nodeDict.get(path);
                node.ForcedSetRoot();
            }
        }

        if(this.isLog) AssetNode.PrintNodeDict(nodeDict, "强制设置某些节点为Root节点，删掉被依赖");

        EditorUtility.ClearProgressBar();
    }


    /** 寻找入度为0的节点 */
    public static FindRoots(nodeDict: Map<string, AssetNode> ):AssetNode[]
    {

        var count = nodeDict.size;
        var index = 0;

        // 寻找入度为0的节点
        var roots: AssetNode[] = [];
        nodeDict.forEach((v, k)=>{

            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("寻找入度为0的节点",  index + "/" + count, 1 * (index++) / count);

            var  node = v;
            if(node.isRoot)
            {
                roots.push(node);
            }
        });
        if(this.isLog) AssetNode.PrintNodeTree(roots, "寻找入度为0的节点");

        EditorUtility.ClearProgressBar();
        return roots;
    }

    /** 移除父节点的依赖和自己依赖相同的节点 */
    public static RemoveParentShare(roots: AssetNode[] )
    {
        var count = roots.length;
        var index = 0;
        // 移除父节点的依赖和自己依赖相同的节点
        for(var node  of roots)
        {
            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("寻找入度为0的节点",  index + "/" + count, 1 * (index++) / count);
            node.RemoveParentShare();
        }

        if(this.isLog) AssetNode.PrintNodeTree(roots, "移除父节点的依赖和自己依赖相同的节点");
        EditorUtility.ClearProgressBar();
    }



    /** 入度为1的节点自动打包到上一级节点 */
    public static MergeParentCountOnce(roots:AssetNode[] )
    {
        var count = roots.length;
        var index = 0;
        // 入度为1的节点自动打包到上一级节点
        for(var node of roots)
        {
            if(index % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("入度为1的节点自动打包到上一级节点",  index + "/" + count, 1 * (index++) / count);
            node.MergeParentCountOnce();
        }

        if(this.isLog) AssetNode.PrintNodeTree(roots, "入度为1的节点自动打包到上一级节点");
        EditorUtility.ClearProgressBar();
    }








    /** 过滤不需要打包的节点 */
    public static FilterDotNeedNode(needDict: Map<string, AssetNode> , needRoots: AssetNode[] )
    {
        var count = needRoots.length;
        for(var i = 0; i < needRoots.length; i ++)
        {
            if(i % this.progressNumOnce == 0) EditorUtility.DisplayProgressBar("过滤不需要打包的节点",  i + "/" + count, 1 * i / count);
            needRoots[i].FilterDotNeedNode(needDict);
        }

        if(this.isLog) AssetNode.PrintNodeTree(needRoots, "过滤不需要打包的节点");
        EditorUtility.ClearProgressBar();
    }


    /** 生成需要设置AssetBundleName的节点 */
    public static  GenerateAssetBundleNodes(roots:AssetNode[], resourceRoot: string )
    {
        for(var i = 0; i < roots.length; i ++)
        {
            roots[i].GenerateAssetBundleNodesRoot(resourceRoot);
            roots[i].SetZip(roots[i]);
        }
    }

    


    
    /** 生成Zip */
    public static  GenerateZipMap(nodeMap:Map<string, AssetNode>)
    {
        let zipMap: Map<string, AssetNode[]> = new Map<string, AssetNode[]>();
        nodeMap.forEach((node, nodePath)=>{
            
            let zipNameList:string[] = [];

            node.zipNameMap.forEach((zipNodeRoot, zipName)=>{

                if(node.type == AssetNode.TYPE_ZIP)
                    return;

                let list:AssetNode[];
                if(zipMap.has(zipName))
                {
                    list = <AssetNode[]>zipMap.get(zipName);
                }
                else
                {
                    list = [];
                    zipMap.set(zipName, list);
                }
                

                list.push(node);
                zipNameList.push(zipName);
            });

            if(node.zipNameMap.size > 1)
            {
                console.warn(`资源被打入了多个Zip： ${nodePath};  ${zipNameList.join(',')}`);
            }
            
            
        });

        return zipMap;
    }



    static GetZipInfo(zipMap: Map<string, AssetNode[]>):string
    {
        
        let str = "zipCount=" + zipMap.size + "\n\n";
        zipMap.forEach((list, zipName)=>{
            let  info = zipName + "， 数量=" + list.length + "\n";
            for(var item of list)
            {
                info += "   " + item.path + "\n";
            }
            info += "=====================\n\n";
            str += info;
        });
        return str;
    }

    /** 构建Zip */
    static BuildZip(zipMap: Map<string, AssetNode[]>)
    {
        if(! fs.existsSync(ConfigSetting.outDir))
        {
            fs.mkdirSync(ConfigSetting.outDir, {recursive : true});
        }
        
        var resourceRoot:string = ConfigSetting.rootDir + "/";
        zipMap.forEach((list, zipName)=>{
            var zip = new JSZip()
            for(var item of list)
            {
                var encoding = 'utf-8';
                switch(item.type)
                {
                    case Laya3D.HIERARCHY:
                    case Laya3D.MATERIAL:
                            encoding = 'utf-8';
                        break;
                    case Laya3D.TEXTURE2D:
                    case Laya3D.TEXTURECUBE:
                            encoding = 'base64';
                        break;
                    default:
                            encoding = 'binary';
                        break;
                }

                
                var fileData:any = fs.readFileSync(item.path, {encoding:encoding});
                var zipFilePath = item.path.replace(resourceRoot, "");
                var options:JSZipFileOptions | any;
                switch(item.type)
                {
                    case Laya3D.HIERARCHY:
                    case Laya3D.MATERIAL:
                            options = undefined;
                        break;
                    case Laya3D.TEXTURE2D:
                    case Laya3D.TEXTURECUBE:
                            options = {base64:true};
                        break;
                    default:
                            options = {binary:true};
                        break;
                }
                zip.file(zipFilePath, fileData, options);
            }

            zip.generateAsync({ 
                type: "nodebuffer", 
                // compression: "DEFLATE",
                comment: "http://blog.ihaiu.com  ihaiu.laya-unity3d-res-zip  ",
                // compressionOptions: { level: 9 }
             })
            .then((content) =>{
                
                var zipPath = ConfigSetting.outDir + "/" + zipName + ".zip";
                fs.writeFileSync(zipPath, content);
            });
        })
    }

}