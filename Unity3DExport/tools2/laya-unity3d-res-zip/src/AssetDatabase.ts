import PathUtil from "./PathUtil";
import ConfigSetting from "./ConfigSetting";
import AssetNode from "./AssetNode";
import Laya3D from "./Laya3D";
import URL from "./URL";
import fs from "fs";
import path from "path";

export default class AssetDatabase
{
    static map:Map<string, AssetNode> = new Map<string, AssetNode>();
    static prefabList:AssetNode[] = [];
    static prefabBeMergeMap:Map<string, AssetNode> = new Map<string, AssetNode>();
    static LoadAllPrefab()
    {
        var list = PathUtil.ReadFileList(ConfigSetting.rootDir, ".lh");
        for(var filePath of list)
        {
            var node = new AssetNode();
            node.path = filePath;
            node.type = Laya3D.HIERARCHY;
            this.map.set(node.path, node);
            this.prefabList.push(node);
            this.ReadPrefabDependentFiles(filePath, node);
        }
    }

    
    static ReadPrefabDependentFiles(lhFilePath:string, parentNode: AssetNode)
    {
        
        lhFilePath = lhFilePath.replace(/\\/g, '/');
        var text = fs.readFileSync(lhFilePath, {encoding:'utf-8'});
        text = text.trim();
        if(text == "")
            return;
        var lhData = JSON.parse(text);

        var url: string = lhFilePath;
        var urlVersion: string = "";
        var hierarchyBasePath: string = URL.getPath(url);
        var firstLevUrls: any[] = [];
        var secondLevUrls: any[] = [];
        var thirdLevUrls: any[] = [];
        var forthLevUrls: any[] = [];
        var subUrls: any[] = [];
        Laya3D._getSprite3DHierarchyInnerUrls(lhData.data, firstLevUrls, secondLevUrls, thirdLevUrls, forthLevUrls, subUrls, urlVersion, hierarchyBasePath);
      
        
        var materials:Map<string, AssetNode> = new Map<string, AssetNode>();
        
        this.AddUrlItemList(firstLevUrls, parentNode, materials);
        this.AddUrlItemList(secondLevUrls, parentNode, materials);
        this.AddUrlItemList(thirdLevUrls, parentNode, materials);
        this.AddUrlItemList(forthLevUrls, parentNode, materials);

        for(var subUrl of subUrls)
        {
            if(this.map.has(subUrl))
            {
                var nodeChild:AssetNode = <AssetNode>this.map.get(subUrl);
                parentNode.AddDependencie(nodeChild);
                continue;
            }

            var node = new AssetNode();
            node.path = subUrl;
            node.type = this.GetType(subUrl);
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);
            
            if(node.type == Laya3D.MATERIAL)
            {
                if(!materials.has(node.path))
                {
                    materials.set(node.path, node);
                }
            }
        }

        // 加载材质球
        materials.forEach((v, k)=>{
            this.ReadMaterialDependentFiles(v.path, v);
        });
    }

    static ReadMaterialDependentFiles(materialPath:string, parentNode:AssetNode)
    {
        materialPath = materialPath.replace(/\\/g, '/');
        var text = fs.readFileSync(materialPath, {encoding:'utf-8'});
        text = text.trim();
        if(text == "")
            return;
        var data = JSON.parse(text);

        
        var forthLevUrls: any[] = [];
        var subUrls: any[] = [];
        Laya3D._onMaterilLmatLoaded(materialPath, data, forthLevUrls, subUrls);
        
        for(var subUrl of subUrls)
        {
            if(this.map.has(subUrl))
            {
                var nodeChild:AssetNode = <AssetNode>this.map.get(subUrl);
                parentNode.AddDependencie(nodeChild);
                continue;
            }
            var node = new AssetNode();
            node.path = subUrl;
            node.type = Laya3D.TEXTURE2D;
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);
        }

    }

    private static AddUrlItemList(list:{url:string, type:string}[], parentNode:AssetNode, materials:Map<string, AssetNode>)
    {
        for(var item of list)
        {
            if(this.map.has(item.url))
            {
                var nodeChild:AssetNode = <AssetNode>this.map.get(item.url);
                parentNode.AddDependencie(nodeChild);
                continue;
            }
            var node = new AssetNode();
            node.path = item.url;
            node.type = this.GetType(item.url, item.type);
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);

            if(node.type == Laya3D.MATERIAL)
            {
                if(!materials.has(node.path))
                {
                    materials.set(node.path, node);
                }
            }
        }
    }

    static GetType(url:string, type:string = ""):string
    {
        var ext = path.extname(url);
        switch(ext)
        {
            case ".lh":
                return Laya3D.HIERARCHY;
            case ".lmat":
                return Laya3D.MATERIAL;
            case ".lm":
                return Laya3D.MESH;
            case ".lani":
                return Laya3D.ANIMATIONCLIP;
        }
        return type;
    }

    static GetDependencies(path:string | string[]):string[]
    {
        return [];
    }


    /** 打包策略--强制将Unity内置资源打包到一起， 并且清理依赖 */
    static MergeZipUnityBuiltin()
    {
        var node = new AssetNode();
        node.path = "UnityBuiltin";
        node.type = AssetNode.TYPE_ZIP;
        this.map.set(node.path, node);

        var beMergeNodeMap:Map<string, AssetNode> = this.prefabBeMergeMap;
        var list = PathUtil.ReadFileList(ConfigSetting.rootDir + "/Library", null);
        for(var filePath of list)
        {
            var item :AssetNode =<AssetNode> this.map.get(filePath);
            if(item)
            {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }


        var list = PathUtil.ReadFileList(ConfigSetting.rootDir + "/Resources", null);
        for(var filePath of list)
        {
            var item :AssetNode =<AssetNode> this.map.get(filePath);
            if(item)
            {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }
    }

    /** 打包策略--特效预设合并 */
    static MergeZipEffectPrefab()
    {
        var effectZipMap:Map<string, AssetNode[]> = new Map<string, AssetNode[]>();
        var beMergeNodeMap:Map<string, AssetNode> = this.prefabBeMergeMap;
        for(var item of this.prefabList)
        {
            var name = path.basename(item.path);
            if(name.startsWith("Effect_"))
            {
                if(name.indexOf("__") != -1)
                {
                    var zipName = name.split("__")[0];

                    var zipFiles:AssetNode[];
                    if(effectZipMap.has(zipName))
                    {
                        zipFiles = <AssetNode[]> effectZipMap.get(zipName);
                    }
                    else
                    {
                        zipFiles = [];
                        effectZipMap.set(zipName, zipFiles);
                    }

                    zipFiles.push(item);
                }
            }
        }

        effectZipMap.forEach((list, zipName)=>{
            if(list.length > 0)
            { 
                var node = new AssetNode();
                node.path = zipName;
                node.type = AssetNode.TYPE_ZIP;
                for(var item of list)
                {
                    beMergeNodeMap.set(item.path, item);
                    node.AddAsset(item)
                }
                this.map.set(node.path, node);
            }
        });
    }

    /** 打包策略--配置的目录，打包Zip */
    static MergeZipByDirConfig()
    {
        for(var dir of ConfigSetting.mergeZipDir)
        {
            this.MergeZipByDir(path.join(ConfigSetting.rootDir, dir), ConfigSetting.rootDir);
        }
        
        for(var dir of ConfigSetting.mergeZipDirFolder)
        {
            this.MergeZipByDirList(path.join(ConfigSetting.rootDir, dir), ConfigSetting.rootDir);
        }
    }

    /** 打包策略--该目录下的目录单独打一个包 */
    static MergeZipByDirList(dirPath:string, resourceRoot: string)
    {
        var list = PathUtil.ReadDirList(dirPath);
        for(var path of list)
        {
            this.MergeZipByDir(path, resourceRoot);
        }
    }


    /** 打包策略--该目录下的资源单独打一个包 */
    static MergeZipByDir(dirPath:string,  resourceRoot: string)
    {

        var zipName = dirPath.replace(resourceRoot + "/", "");
        zipName = zipName.replace(/\//g, '___');
        var node = new AssetNode();
        node.path = zipName;
        node.type = AssetNode.TYPE_ZIP;

        var fileList:string[] = [];
        PathUtil.RecursiveFile(dirPath, fileList);

        
        var beMergeNodeMap:Map<string, AssetNode> = this.prefabBeMergeMap;

        for(var filePath of fileList)
        {
            var item :AssetNode =<AssetNode> this.map.get(filePath);
            if(item)
            {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }
        


        if(node.childCount > 0 || node.assetCount > 0)
        {
            this.map.set(node.path, node);
        }


    }

    
    /** 打包策略--检测被多个Zip引用的， 将这些合并到一起 */
    static MergeZipCheckMultipleZip()
    {
        var beMergeNodeMap:Map<string, AssetNode> = this.prefabBeMergeMap;
        let zipMap: Map<string, AssetNode[]> = new Map<string, AssetNode[]>();
        this.map.forEach((node, nodePath)=>{

            if(node.zipNameMap.size > 1)
            {
                if(beMergeNodeMap.has(node.path))
                {
                    console.error("理论上不应该出现被多个Zip引用：", node.path);
                    return;
                }

                let zipNameList:string[] = [];
                node.zipNameMap.forEach((zipNodeRoot, zipName)=>{
                    zipNameList.push(zipName);
                });

                zipNameList = zipNameList.sort();
                var zipName = zipNameList.join("____");
                
                var zipNodeList:AssetNode[];
                if(zipMap.has(zipName))
                {
                    zipNodeList = <AssetNode[]> zipMap.get(zipName);
                }
                else
                {
                    zipNodeList = [];
                    zipMap.set(zipName, zipNodeList);
                }

                zipNodeList.push(node);
            }
            
        });

        zipMap.forEach((nodeList, zipName)=>{
            
            if(nodeList.length < ConfigSetting.mergeMultipleZipNodeMinNum)
            {
                return;
            }
            var node = new AssetNode();
            node.path = zipName;
            node.type = AssetNode.TYPE_ZIP;
            node.assetBundleName = zipName;
            node.zipNameMap.set(zipName, node);
            for(var item of nodeList)
            {
                item.zipNameMap.clear();
                item.zipNameMap.set(zipName, node);
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddAsset(item);
            }
            
            this.map.set(node.path, node);
        });



    }

    
    /** 打包策略--检测被多个Zip引用的，并且在制定目录下， 将这些合并到一起 */
    static MergeZipCheckMultipleZipByDirConfig()
    {
        let beMergeNodeMap:Map<string, AssetNode> = this.prefabBeMergeMap;

        let list:AssetNode[] = [];
        this.map.forEach((node, nodePath)=>{

            if(node.zipNameMap.size > 1)
            {
                if(beMergeNodeMap.has(node.path))
                {
                    console.error("理论上不应该出现被多个Zip引用：", node.path);
                    return;
                }

                list.push(node);
            }
        });

        for(var dir of ConfigSetting.mergeOtherCommonDir)
        {
            var dirPath = ConfigSetting.rootDir + "/" + dir;
            dirPath = dirPath.replace(/\\/g, '/');
            var dirNodeList:AssetNode[] = [];
            for(var i = list.length - 1; i >= 0; i --)
            {
                var item = list[i];
                if(item.path.startsWith(dirPath))
                {
                    list.splice(i, 1);
                    dirNodeList.push(item);
                }
            }

            if(dirNodeList.length > 0)
            {
                var zipName = AssetNode.GetZipName(dirPath, ConfigSetting.rootDir);
                var node = new AssetNode();
                node.path = zipName;
                node.type = AssetNode.TYPE_ZIP;
                node.assetBundleName = zipName;
                node.zipNameMap.set(zipName, node);
                for(var item of dirNodeList)
                {
                    item.zipNameMap.clear();
                    item.zipNameMap.set(zipName, node);
                    beMergeNodeMap.set(item.path, item);
                    item.ClearDependencie();
                    node.AddAsset(item);
                }
                
                this.map.set(node.path, node);
            }
        }

    }

}