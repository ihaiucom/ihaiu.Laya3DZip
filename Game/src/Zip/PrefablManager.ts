import ZipManager from "./ZipManager";
import AsyncUtil from "./AsyncUtil";
import DebugResources from "../DebugResources/DebugResources";
import AssetManifest from "./AssetManifest";
import PreloadZipList from "./PreloadZipList";
import PreloadAssetList from "./PreloadAssetList";

export default class PrefabManager
{
    private static _Instance: PrefabManager;
    static get Instance(): PrefabManager
    {
        if (!PrefabManager._Instance)
        {
            PrefabManager._Instance = new PrefabManager();
            window['prefabManager'] = PrefabManager._Instance;
        }
        return PrefabManager._Instance;
    }

    srcRootPath:string;

    Init(srcRootPath:string)
    {
        this.srcRootPath = srcRootPath;
    }

    
    /** 资源ID转资源路径 */
    ResFileNameToAssetPath(resId:string): string
    {
        return this.srcRootPath + resId + ".lh";
    }
    

    
    /** 加载预设列表 */
    public async LoadPrefabListAsync(resIdList:string[], callbacker:any, onProgerss?:((i, count, rate, path, res)=>any))
    {
        return new Promise<any>((resolve)=>
        {
            let i = 0;
            let len = resIdList.length;
            if(len == 0)
            {
                AsyncUtil.ResolveDelayCall(resolve);
                return;
            }

            for(let resId of resIdList)
            {
                let assetPath = this.ResFileNameToAssetPath(resId);
                DebugResources.onPrefabBegin(assetPath);
                Laya.loader.create(assetPath, Laya.Handler.create(null, (res)=>
                { 
                    i ++;
                    
                    DebugResources.onPrefabEnd(assetPath);
                    if(onProgerss)
                    {
                        if(callbacker)
                        {
                            onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), assetPath, res);
                        }
                        else
                        {
                            onProgerss(i, len, Math.ceil(i / len * 100), assetPath, res);
                        }
                    }
                    
                    if(i >= len)
                    {
                        AsyncUtil.ResolveDelayCall(resolve);
                    }

                }));
            }
        });
    }

    preloadZip:PreloadZipList;
    preloadAsset:PreloadAssetList;

    public StopPreload()
    {
        if(this.preloadZip)
        {
            this.preloadZip.Stop();
        }
        
        if(this.preloadAsset)
        {
            this.preloadAsset.Stop();
        }

        this.preloadZip = null;
        this.preloadAsset = null;
    }

    /** 隐藏默默加载 */
    public async PreloadPrefabList(resIdList:string[])
    {
        this.StopPreload();
        if(!ZipManager.enable)
        {
            return;
        }

        let i = 0;
        let len = resIdList.length;
        if(len == 0)
        {
            return;
        }

        var manifest:AssetManifest = ZipManager.Instance.manifest;
        let prefabAssetPathList:string[] = [];
        let assetPathList:string[] = [];
        var tmpMap:Map<string, any> = new Map<string, any>();
        for(let resId of resIdList)
        {
            let assetPath = this.ResFileNameToAssetPath(resId);
            let item  = Laya.Loader.getRes(assetPath);
            if(item)
            {
                continue;
            }


            let dependencieAssetPathList:string[] = manifest.GetAssetDependenciePathListByAssetPath(assetPath);
            for(let dependencieAssetPath of dependencieAssetPathList)
            {
                if(tmpMap.has(dependencieAssetPath))
                {
                    continue;
                }
                
                let item  = Laya.Loader.getRes(dependencieAssetPath);
                if(item)
                {
                    continue;
                }


                assetPathList.push(dependencieAssetPath);
                tmpMap.set(dependencieAssetPath, true);
            }
            assetPathList.push(assetPath);
            prefabAssetPathList.push(assetPath);
        }
        
        let assetNameList:string[] = ZipManager.Instance.AssetPathListToAssetNameList(prefabAssetPathList);
        let zipPathList = manifest.GetAssetListDependencieZipPathList(assetNameList);

        this.preloadZip = new PreloadZipList(zipPathList, assetPathList);
        this.preloadAsset = new PreloadAssetList(assetPathList);

        await this.preloadZip.StartAsync();
        await this.preloadAsset.StartAsync();
       
    }
}

window['PrefabManager'] = PrefabManager;