import AssetManifest from "./AssetManifest";
import LayaExtends_Loader from "./LayaExtends/LayaExtends_Loader";
import JsZipAsync from "./JsZipAsync";
import { EnumZipAssetDataType } from "./ZipEnum";
import DebugResources from "../DebugResources/DebugResources";
import AsyncUtil from "./AsyncUtil";
import LayaExtends_LoaderManager from "./LayaExtends/LayaExtends_LoaderManager";
import LayaExtends_Resouces from "./LayaExtends/LayaExtends_Resouces";
import Handler = Laya.Handler;
import WaitCallbackList from "./WaitCallbackList";
export default class ZipManager
{
    private static _Instance: ZipManager;
    static get Instance(): ZipManager
    {
        if (!ZipManager._Instance)
        {
            ZipManager._Instance = new ZipManager();
            window['zipManager'] = ZipManager._Instance;
        }
        return ZipManager._Instance;
    }

    zipExt = ".zip";
    zipExtName = "zip";
    srcRootPath = "res3d/Conventional/";
    zipRootPath = "";
    /** 资源清单 */
    _manifest:AssetManifest;
    get manifest():AssetManifest
    {
        if(this.enablePve01 && this.isPve01)
        {
            return this.manifestPve01;
        }
        return this._manifest;
    }

    static enable: boolean = false;

    /** 初始化 */
    async InitAsync(manifestPath:string, srcRootPath: string, zipRootPath: string, zipExt?:string, isReplace?: boolean)
    {
        if(this._manifest && !isReplace)
        {
            console.log("已经初始了Zip资源清单");
            return;
        }

        if(zipExt)
        {
            this.zipExt = zipExt;
            this.zipExtName = zipExt.replace('.', '');
        }

        await AssetManifest.InitAsync(manifestPath, srcRootPath,zipRootPath, zipExt);
        this._manifest = AssetManifest.Instance;
        this.srcRootPath = srcRootPath;
        this.zipRootPath = zipRootPath;
        ZipManager.enable = true;
        this.InitCode();
        this.InitResourceVersion();
    }

    /** 资源清单 */
    manifestPve01:AssetManifest;

    isPve01: boolean = false;
    enablePve01: boolean = false;
    async InitPVE01(pve01manifestPath:string)
    {
        this.manifestPve01 = await AssetManifest.LoadAsync(pve01manifestPath, this.srcRootPath, this.zipRootPath, this.zipExt);
        this.enablePve01 = true;
    }


    private static isInitCode: boolean = false;
    private InitCode()
    {
        if(ZipManager.isInitCode)
        {
            return;
        }
        ZipManager.isInitCode = true;
        LayaExtends_Loader.InitCode();
        LayaExtends_LoaderManager.InitCode();
        LayaExtends_Resouces.InitCode();
    }

    resourceVersionManifestReverse:Map<string, string> = new Map<string, string>();
    
    private InitResourceVersion()
    {
        this.resourceVersionManifestReverse.clear();
        let manifest = Laya.ResourceVersion.manifest;
        for(let path in manifest)
        {
            let pathVer = manifest[path];
            this.resourceVersionManifestReverse.set(pathVer, path);
        }
    }


    /** Zip 资源 */
    zipMap:Map<string, JSZip> = new Map<string, JSZip>();
    /** 资源数据 */
    assetMap:Map<string, any> = new Map<string, any>();
    /** 资源引用数量 */
    assetReferenceMap:Map<string, any> = new Map<string, any>();
    /** Zip使用资源情况 */
    zipUseAssetMap:Map<string, Map<string, any>> = new Map<string, Map<string, any>>();

    GetZipUseAssetMap(zipPath: string, isCreate?: boolean):Map<string, any>
    {
        if(this.zipUseAssetMap.has(zipPath))
        {
            return this.zipUseAssetMap.get(zipPath);
        }
        else
        {
            if(isCreate)
            {
                var m = new Map<string, any>();
                this.zipUseAssetMap.set(zipPath, m);
                return m;
            }
            return null;
        }
    }

    /** 添加Zip引用资源 */
    AddZipUseAsset(zipPath: string, assetPath: string)
    {
        var m = this.GetZipUseAssetMap(zipPath, true);
        var num = m.getValueOrDefault(zipPath) + 1;
        m.set(assetPath, num);
    }

    /** 移除Zip引用资源 */
    RemoveZipUseAsset(zipPath: string, assetPath: string)
    {
        var m = this.GetZipUseAssetMap(zipPath, true);
        var num = m.getValueOrDefault(zipPath) - 1;
        if(num <= 0)
        {
            m.delete(assetPath);
        }
        else
        {
            m.set(assetPath, num);
        }
    }
    
    AddAssetReference(assetPath:string, count: number = 1)
    {
        if(this.assetReferenceMap.has(assetPath))
        {
            this.assetReferenceMap.set(assetPath, this.assetReferenceMap.get(assetPath) + count);
        }
        else
        {
            this.assetReferenceMap.set(assetPath, count);
        }
    }

    RemoveAssetReference(assetPath:string, count: number = 1)
    {
        if(this.assetReferenceMap.has(assetPath))
        {
            this.assetReferenceMap.set(assetPath, this.assetReferenceMap.get(assetPath) - count);
        }
    }

    
    GetAssetReference(assetPath:string)
    {
        if(this.assetReferenceMap.has(assetPath))
        {
            return this.assetReferenceMap.get(assetPath);
        }
        return  0;
    }

    OnClearResouceAsset(assetUrl: string)
    {
        
        let assetPath = this.AssetUrlToPath(assetUrl);
        this.RemoveAssetReference(assetPath);
        // console.log("ZipManager.OnClearResouceAsset", assetPath);

    }

    /** 卸载没有使用的资源 */
    DestroyUnusedAssets(): void 
    {
        this.assetReferenceMap.forEach((referenceCount, assetPath)=>
        {
            if(referenceCount <= 0 && this.assetMap.has(assetPath))
            {
                var assetData = this.assetMap.get(assetPath);
                this.assetMap.delete(assetPath);
                let assetName = this.manifest.GetAssetNameByPath(assetPath);
                let zipPath = this.manifest.GetAssetZipPath(assetName);
                // console.log("ZipManager.DestroyUnusedAssets 清理资源", assetPath);
                this.RemoveZipUseAsset(zipPath, assetPath);
            }
        });
        this.DestroyUnusedZip();
    }
    
    
    /** 卸载没有使用的Zip */
    DestroyUnusedZip(): void 
    {
        this.zipUseAssetMap.forEach((infoMap, zipPath)=>
        {
            if(infoMap.size == 0)
            {
                // console.log("ZipManager.DestroyUnusedZip 清理Zip", zipPath);
                if(this.zipMap.has(zipPath))
                {
                    var zip = this.zipMap.get(zipPath);
                    this.zipMap.delete(zipPath);
                }
                
            }
        });
	}




    PrintAssetReferenceMap()
    {
        this.assetReferenceMap.forEach((count, assetName)=>
        {
            console.log(assetName, count);
        });
    }

    HasZip(zipPath:string):boolean
    {
        return this.zipMap.has(zipPath);
    }
    
    HasAsset(assetUrl:string):boolean
    {
        let assetPath = this.AssetUrlToPath(assetUrl);
        return this.assetMap.has(assetPath);
    }

    /** 获取资源所在Zip路径 */
    GetAssetZipPathByAssetUrl(assetUrl:string):string
    {
        let assetName = this.AssetUrlToName(assetUrl);
        let zipPath = this.manifest.GetAssetZipPath(assetName);
        return zipPath;

    }

    /** 资源Url 转 路径 */
    AssetUrlToPath(url:string): string
    {
        if(window['AssetUrlCache'])
        {
            var path = AssetUrlCache.GetPath(url);
            if(path)
            {
                return path;
            }
        }
        let verPath = url.replace(Laya.URL.basePath, "");
        if(this.resourceVersionManifestReverse.has(verPath))
        {
            return this.resourceVersionManifestReverse.get(verPath);
        }
        else
        {
            return verPath;
        }
    }
    /** 资源Url 转 资源名称 */
    AssetUrlToName(url:string): string
    {
        let assetPath = this.AssetUrlToPath(url);
        let assetName = this.manifest.GetAssetNameByPath(assetPath);
        return assetName;
    }

    /** 资源名称转资源路径 */
    AssetNameToPath(assetName:string): string
    {
        return this.manifest.srcRootPath + assetName;
    }

    /** 资源ID转资源路径 */
    ResFileNameToAssetPath(resId:string): string
    {
        return this.manifest.srcRootPath + resId + ".lh";
    }

    /** 资源路径列表 转 资源名称列表 */
    AssetPathListToAssetNameList(assetPathList:string[]):string[]
    {
        let assetNameList:string[] = [];
        for(let assetPath of assetPathList)
        {
            let assetName = this.manifest.GetAssetNameByPath(assetPath);
            assetNameList.push(assetName);
        }

        return assetNameList;
    }



    
    /** 获取Zip */
    public GetZip(zipPath:string, callback: Handler)
    {
        var zip:JSZip;
        if(this.zipMap.has(zipPath))
        {
            zip = this.zipMap.get(zipPath);
            callback.runWith(zip);
        }
        else
        {
            
            WaitCallbackList.Add(zipPath, callback);
            if(WaitCallbackList.Get(zipPath).list.length == 1)
            {
                JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, Handler.create(this, (zip)=>
                {
                    if(zip)
                    {
                        this.zipMap.set(zipPath, zip);
                    }
                    WaitCallbackList.RunWith(zipPath, zip);
                }));
            }
        }
    }

    /** 获取Zip是否存在该资源 */
    HasManifestAssetByUrl(url:string)
    {
        var assetPath:string = this.AssetUrlToPath(url);
        return this.manifest.HasAssetByPath(assetPath);
    }

    
    loadImageCount = 0;
    /** 获取资源内容， 如果没有缓存资源就返回null */
    public GetAssetData(url:string): any
    {
        var assetPath:string = this.AssetUrlToPath(url);
        if(!this.manifest.HasAssetByPath(assetPath))
        {
            return null;
        }
        var data:any;
        
        let type = this.manifest.GetEnumZipAssetDataType(assetPath);
        if(type == EnumZipAssetDataType.base64)
        {
            this.loadImageCount ++;
            // console.log(this.loadImageCount, assetPath);
        }

        if(this.assetMap.has(assetPath))
        {
            data = this.assetMap.get(assetPath);
            this.AddAssetReference(assetPath);
        }
       
        return data;
    }


    /** 获取资源内容 */
    public GetOrLoadAssetData(url:string, callback: Handler)
    {
        var assetPath:string = this.AssetUrlToPath(url);
        if(!this.manifest.HasAssetByPath(assetPath))
        {
            callback.runWith(null);
            return;
        }
        
        var data:any;
        
        let type = this.manifest.GetEnumZipAssetDataType(assetPath);
        if(type == EnumZipAssetDataType.base64)
        {
            this.loadImageCount ++;
            // console.log(this.loadImageCount, assetPath);
        }

        if(this.assetMap.has(assetPath))
        {
            data = this.assetMap.get(assetPath);
            this.AddAssetReference(assetPath);
            callback.runWith(data);
        }
        else
        {
            WaitCallbackList.Add(url, callback);
            if(WaitCallbackList.Get(url).list.length == 1)
            {
                this.LoadAssetData(assetPath, Handler.create(this, (data)=>
                {
                    var assetReferenceCount = this.GetAssetReference(assetPath);
                    if(assetReferenceCount > 0)
                    {
                        console.error("ZipManager.GetAssetDataAsync 已经存在创建的资源了", assetPath, assetReferenceCount);
                    }
                    this.AddAssetReference(assetPath);
                    this.assetMap.set(assetPath, data);
                    WaitCallbackList.RunWith(url, data);
                }));
            }
        }
    }
    

    imageCount = 0;

    
    /** 加载资源内容 */
    private LoadAssetData(assetPath:string, callback: Handler)
    {
        let assetName = this.manifest.GetAssetNameByPath(assetPath);
        

        let zipPath = this.manifest.GetAssetZipPath(assetName);
        let type = this.manifest.GetEnumZipAssetDataType(assetName);

        this.GetZip(zipPath, Handler.create(this, (zip: JSZip)=>
        {
            if(!zip)
            {
                console.log("没有Zip", zipPath, assetPath);
                callback.runWith(null);
                return;
            }
            

            JsZipAsync.read(zip, assetName, type, Handler.create(this, (data)=>
            {
                if(data == null)
                {
                    console.log("zip读取资源失败", zipPath, assetPath);
                    callback.runWith(null);
                    return;
                }
                    
                switch(type)
                {
                    case EnumZipAssetDataType.string:
                        data = JSON.parse(data);
                        break;
                    case EnumZipAssetDataType.base64:
                        data = "data:image/png;base64," + data;
                        this.imageCount ++;
                        break;
                }
                this.AddZipUseAsset(zipPath, assetPath);
                callback.runWith(data);
            }))

        }));
    }
    
    

    /** 加载资源用到的所有Zip */
    public async LoadAssetZipListAsync(assetPathList: string[], callbacker?:any, onProgerss?:((i, count, rate, path)=>any))
    {
        let assetNameList:string[] = this.AssetPathListToAssetNameList(assetPathList);

        
        var progerssFun = (i, len, path)=>
        {
            if(onProgerss)
            {
                if(callbacker)
                {
                    onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                }
                else
                {
                    onProgerss(i, len, Math.ceil(i / len * 100), path);
                }
            }
        }


        let zipPathList = this.manifest.GetAssetListDependencieZipPathList(assetNameList);

        
        return new Promise<any>((resolve)=>
        {
            progerssFun(0, zipPathList.length, "");
            var loadNum = 0;
            var loadTotal = zipPathList.length;
            if(loadTotal == 0)
            {
                AsyncUtil.ResolveDelayCall(resolve);
                return;
            }

            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];

                if(this.zipMap.has(zipPath))
                {
                    loadNum ++;
                    progerssFun(loadNum, loadTotal, zipPath);
                    if(loadNum >= loadTotal)
                    {
                        AsyncUtil.ResolveDelayCall(resolve);
                    }
                    continue;
                }
                else
                {
                    JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, Handler.create(this, (zip)=>
                    {
                        this.zipMap.set(zipPath, zip);
                        loadNum ++;
                        progerssFun(loadNum, loadTotal, zipPath);
                        if(loadNum >= loadTotal)
                        {
                            resolve();
                            // ZipManager.ResolveDelayCall(resolve);
                        }
                    }));

                }

                
            }
        });
    }

    /** 读取所有Zip里面的资源 */
    public async ReadAllZipAsync(callbacker?:any, onProgerss?:((i, count, rate, path)=>any), onSubProgerss?:((i, count, rate, path)=>any))
    {
        
        return new Promise<any>((resolve)=>
        {
            let zipPathList: string[] = [];
            this.zipMap.forEach((zip, zipPath)=>{
                zipPathList.push(zipPath);
            });

            var progerssFun = (i, len, path)=>
            {
                if(onProgerss)
                {
                    if(callbacker)
                    {
                        onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                    }
                    else
                    {
                        onProgerss(i, len, Math.ceil(i / len * 100), path);
                    }
                }
            }
            
            var subProgerssFun = (i, len, path)=>
            {
                if(onSubProgerss)
                {
                    if(callbacker)
                    {
                        onSubProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                    }
                    else
                    {
                        onSubProgerss(i, len, Math.ceil(i / len * 100), path);
                    }
                }
            }

            progerssFun(0, zipPathList.length, "");

            var assetNameTotal = 0;
            var assetNameLoadedCount = 0;
            var zipAssetNameListMap:Map<string, string[]> = new Map<string, string[]>();
            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];
                let zip = this.zipMap.get(zipPath);



                let assetNameList:string[] = [];

                for(let assetName in zip.files)
                {
                    let fileObject:JSZip.JSZipObject = zip.files[assetName];
                    if(!fileObject.dir)
                    {
                        let assetPath = this.AssetNameToPath(assetName);
                        if(this.assetMap.has(assetPath))
                        {
                            continue;
                        }

                        assetNameList.push(assetName);
                        assetNameTotal ++;
                    }
                }

                zipAssetNameListMap.set(zipPath, assetNameList);
            }

            console.log("assetNameTotal=", assetNameTotal);
            if(assetNameTotal == 0)
            {
                AsyncUtil.ResolveDelayCall(resolve);
                return;
            }


                

            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];
                let zip = this.zipMap.get(zipPath);

                let assetNameList:string[] = zipAssetNameListMap.get(zipPath);
                subProgerssFun(0, assetNameList.length, "");
                for(let j = 0, jLen = assetNameList.length; j < jLen; j ++)
                {
                    let assetName = assetNameList[j];
                    let assetPath = this.AssetNameToPath(assetName);
                    let type = this.manifest.GetEnumZipAssetDataType(assetName);

                    JsZipAsync.read(zip, assetName, type, Handler.create(this, (data)=>{

                        assetNameLoadedCount ++;
                        if(data)
                        {
                            switch(type)
                            {
                                case EnumZipAssetDataType.string:
                                    data = JSON.parse(data);
                                    break;
                                case EnumZipAssetDataType.base64:
                                    data = "data:image/png;base64," + data;
                                    this.imageCount ++;
                                    break;
                            }
                        }
                        var assetReferenceCount = this.GetAssetReference(assetPath);
                        if(assetReferenceCount > 0)
                        {
                            console.error("ZipManager.ReadAllZipAsync asset 已经存在创建的资源了", assetPath, assetReferenceCount);
                        }
                        this.assetMap.set(assetPath, data);

                        progerssFun(assetNameLoadedCount, assetNameTotal, zipPath);
                        subProgerssFun(j, jLen, assetName);

                        if(assetNameLoadedCount >= assetNameTotal)
                        {
                            AsyncUtil.ResolveDelayCall(resolve);
                        }
                    }));
                    
                }





            }
        
		});
        
    }


    /** 获取Zip */
    public async GetZipAsync(zipPath:string): Promise<JSZip>
    {
        return new Promise<JSZip>((resolve)=>{
            this.GetZip(zipPath, Handler.create(this, (zip)=>{
                resolve(zip);
            }))
        });
    }


    
    /** 获取资源内容 */
    public async GetOrLoadAssetDataAsync(url:string): Promise<any>
    {
        return new Promise<JSZip>((resolve)=>{
            this.GetOrLoadAssetData(url, Handler.create(this, (data)=>{
                resolve(data);
            }));
        });
    }

}

window['ZipManager'] = ZipManager;