import {EnumZipAssetDataType } from "./ZipEnum";

type AssetIdOrName = string | number;

/** 资源清单 */
export default class AssetManifest
{
    /** 资源列表 */
    assetId2Name:DictionaryObject<number, string> | any = {};
    /** zip列表 */
    zipId2Name:DictionaryObject<number, string> | any = {};
    /** Zip资源列表 */
    zipAssets: DictionaryObject<number, number[]> | any = {};
    /** 资源依赖列表 */
    assetsDependencie: DictionaryObject<number, number[]> | any= {};
    /** 预设依赖列表 */
    prefabDependencie: DictionaryObject<number, number[]> | any= {};


    srcRootPath: string = "";
    zipRootPath: string = "";
    zipExt:string = ".zip";


    protected assetName2Id:DictionaryObject<string, number> | any = {};
    protected assetId2ZipId:DictionaryObject<number, number> | any = {};
    
    protected assetId2DependencieZipNames:DictionaryObject<number, string[]> | any = {};
    protected assetName2DependencieZipNames:DictionaryObject<string, string[]> | any = {};

    protected assetId2DependencieZipPaths:DictionaryObject<number, string[]> | any = {};
    protected assetName2DependencieZipPaths:DictionaryObject<string, string[]> | any = {};

    
    protected assetName2DependencieAssets:DictionaryObject<string, string[]> | any = {};
    protected zipName2DependencieAssets:DictionaryObject<string, string[]> | any = {};

    SetJson(json:any)
    {
        window['assetManifest'] = this;
        this.assetId2Name = json.assetId2Name;
        this.zipId2Name = json.zipId2Name;
        this.zipAssets = json.zipAssets;
        this.assetsDependencie = json.assetsDependencie;
        this.prefabDependencie = json.prefabDependencie;

        var hasAssetsDependencie = false;
        if(this.assetsDependencie)
        {
            for(let assetId in this.assetsDependencie)
            {
                hasAssetsDependencie = true;
                break;
            }
        }

        if(!hasAssetsDependencie)
        {
            this.assetsDependencie = this.prefabDependencie;
        }



        for(let assetId in this.assetId2Name)
        {
            let assetName = this.assetId2Name[assetId];
            this.assetName2Id[assetName] = assetId;
        }

        for(let zipId in this.zipAssets)
        {
            let assetIdList = this.zipAssets[zipId];
            for(let id of assetIdList)
            {
                this.assetId2ZipId[id] = zipId;
            }
        }

        this.InitAssetDependencieZipPaths();
        this.InitDebug();
    }

    private InitAssetDependencieZipPaths()
    {
        for(let assetId in this.assetsDependencie)
        {
            this.GetAssetDependencieZipPathList(parseInt(assetId));
        }
    }

    
    private InitDebug()
    {
        for(let assetId in this.assetsDependencie)
        {
            var assetName = this.GetAssetName(assetId);
            var assetNames = this.assetName2DependencieAssets[assetName] = [];
            var dependenceAssetIdList = this.assetsDependencie[assetId];
            for(let itemAssetId of dependenceAssetIdList)
            {
                assetNames.push(this.GetAssetName(itemAssetId));
            }
        }

        
        for(let zipId in this.zipAssets)
        {
            var zipName = this.GetZipName(zipId);
            var assetNames = this.zipName2DependencieAssets[zipName] = [];
            var dependenceAssetIdList = this.zipAssets[zipId];
            for(let itemAssetId of dependenceAssetIdList)
            {
                assetNames.push(this.GetAssetName(itemAssetId));
            }
        }
    }

    /** 获取资源ID */
    GetAssetId(assetName:string):number
    {
        return this.assetName2Id[assetName];
    }

    /** 获取资源名称 */
    GetAssetName(assetId:number | string):string
    {
        return this.assetId2Name[assetId];
    }
    
    /** 获取资源名称, 根据Url */
    GetAssetNameByPath(assetPath: string):string
    {
        var assetName:string = assetPath.replace(this.srcRootPath, "");
        return assetName;
    }

    /** 获取资源所在Zip Id */
    GetAssetZipId(assetId: number):number
    {
        return this.assetId2ZipId[assetId];
    }
    
    /** 获取资源所在Zip Name */
    GetAssetZipName(assetId: number):string
    {
        let zipId = this.GetAssetZipId(assetId);
        return this.GetZipName(zipId);
    }
    
    /** 获取资源所在Zip Path */
    GetAssetZipPath(asset: AssetIdOrName):string
    {
        let assetId:number = this.ToAssetId(asset);
        let zipId = this.GetAssetZipId(assetId);
        let zipName =  this.GetZipName(zipId);

        if(!zipName)
        {
            console.error(`没找到资源的Zip asset=${asset} `);
        }
        
        let zipPath = this.GetZipPath(zipName);
        return zipPath;
    }

    
    /** 获取资源所在Zip Path */
    GetAssetZipPathByPath(assetPath: string):string
    {
        let assetName = this.GetAssetNameByPath(assetPath);
        let zipPath = this.GetAssetZipPath(assetName);
        return zipPath;
    }

    

    
    /** 获取Zip Path */
    GetZipPath(zipName: string):string
    {
        return this.zipRootPath + zipName + this.zipExt;
    }

    /** 获取Zip名称 */
    GetZipName(zipId:int | string):string
    {
        return this.zipId2Name[zipId];
    }

    private ToAssetId(asset:AssetIdOrName):number
    {
        let assetId:number;
        if(typeof asset == "string")
        {
            assetId = this.GetAssetId(asset);
        }
        else
        {
            assetId = asset;
        }
        return assetId;
    }

    private tmpMap:Map<string, any> = new Map<string, any>();
    /** 获取资源依赖的Zip 名称列表 */
    GetAssetDependencieZipNameList(asset:AssetIdOrName):string[]
    {
        let assetId:number = this.ToAssetId(asset);
        if(this.assetId2DependencieZipNames[assetId])
        {
            return this.assetId2DependencieZipNames[assetId];
        }

        let zipNames:string[] = [];
        

        if(!assetId)
        {
            console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetId 不存在 assetId=${assetId},  asset=${asset}`);
            return zipNames;
        }

        let assetIdList = this.assetsDependencie[assetId];
        if(!assetIdList)
        {
            console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetIdList 不存在,  asset=${this.GetAssetName(assetId)}`);
            return zipNames;
        }

        var tmpMap = this.tmpMap;
        tmpMap.clear();
        for(let assetId of assetIdList)
        {
            let zipName = this.GetAssetZipName(assetId);
            if(zipName)
            {
                if(!tmpMap.has(zipName))
                {
                    zipNames.push(zipName);
                    tmpMap.set(zipName, true);
                }
            }
        }
        tmpMap.clear();

        
        var assetName = this.GetAssetName(assetId);
        this.assetId2DependencieZipNames[assetId] = zipNames;
        this.assetName2DependencieZipNames[assetName] = zipNames;
        return zipNames;
    }

    
    /** 获取资源依赖的Zip 路径列表 */
    GetAssetDependencieZipPathList(asset:AssetIdOrName):string[]
    {
        let assetId:number = this.ToAssetId(asset);
        if(this.assetId2DependencieZipPaths[assetId])
        {
            return this.assetId2DependencieZipPaths[assetId];
        }

        let zipPaths:string[] = [];

        let zipNames = this.GetAssetDependencieZipNameList(assetId);
        for(let zipName of zipNames)
        {
            let zipPath = this.GetZipPath(zipName)
            zipPaths.push(zipPath);
        }

        var assetName = this.GetAssetName(assetId);

        this.assetId2DependencieZipPaths[assetId] = zipPaths;
        this.assetName2DependencieZipPaths[assetName] = zipPaths;
        
        return zipPaths;
    }

    
    private tmpMap2:Map<string, any> = new Map<string, any>();
    /** 获取资源依赖的Zip 路径列表 */
    GetAssetListDependencieZipPathList(assetList:string[] | number[]):string[]
    {
        let zipPaths:string[] = [];
        if(assetList.length == 0)
        {
            return zipPaths;
        }

        
        var tmpMap = this.tmpMap;
        tmpMap.clear();

        for(let asset of assetList)
        {
            let pathList = this.GetAssetDependencieZipPathList(asset);
            for(let path of pathList)
            {
                if(!tmpMap.has(path))
                {
                    zipPaths.push(path);
                    tmpMap.set(path, true);
                }
            }
        }
        tmpMap.clear();

        return zipPaths;
    }

    
    GetEnumZipAssetDataType(assetPath: string):EnumZipAssetDataType
    {
        let type = Laya.Loader.getTypeFromUrl(assetPath);
        var extension = Laya.Utils.getFileExtension(assetPath);
        let t:EnumZipAssetDataType;
        switch(type)
        {
            case "image":
                t = EnumZipAssetDataType.base64;
                break;
            default:
                switch(extension)
                {
                    case "lmat":
                    case "lh":
                        t = EnumZipAssetDataType.string;
                        break;
                    default:
                        t = EnumZipAssetDataType.arraybuffer;
                        break;
                }

                break;
        }
        return t;
    }




    private static _Instance: AssetManifest;
    static get Instance(): AssetManifest
    {
        if (!AssetManifest._Instance)
        {
            AssetManifest._Instance = new AssetManifest();
        }
        return AssetManifest._Instance;
    }

    /** 初始化 */
    static async InitAsync(manifestPath:string, srcRootPath: string, zipRootPath: string, zipExt?:string): Promise<AssetManifest>
    {
        AssetManifest._Instance = await this.LoadAsync(manifestPath, srcRootPath, zipRootPath, zipExt);
        return AssetManifest._Instance;
    }

    /** 加载资源清单配置 */
    static async LoadAsync(path:string, srcRootPath: string, zipRootPath: string, zipExt?:string): Promise<AssetManifest>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    let manifest = new AssetManifest();
                    if(srcRootPath)
                    {
                        manifest.srcRootPath = srcRootPath;
                    }

                    if(zipRootPath)
                    {
                        manifest.zipRootPath = zipRootPath;
                    }


                    if(zipExt)
                    {
                        manifest.zipExt = zipExt;
                    }
                    manifest.SetJson(res);

                    resolve(manifest);
                }), 
                null, Laya.Loader.JSON);
         });
    }

}

window['AssetManifest'] = AssetManifest;