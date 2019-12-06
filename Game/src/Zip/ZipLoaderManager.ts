import ZipManager from "./ZipManager";
import AsyncUtil from "./AsyncUtil";

export default class ZipLoaderManager 
{
    static InitCode() {
        new ZipLoaderManager().InitCode();
    }
    InitCode() {
        var LoaderManager:any = Laya.LoaderManager;
        // LoaderManager.prototype.src_doLoad = LoaderManager.prototype._doLoad;
        // LoaderManager.prototype._doLoad = this._doLoad;

        
        LoaderManager.prototype.src_load = LoaderManager.prototype.load;
        LoaderManager.prototype.load = this.load;
        LoaderManager.prototype.__loadWaitZipAsync = this.__loadWaitZipAsync;

        
        LoaderManager.prototype.src_createLoad = LoaderManager.prototype._createLoad;
        LoaderManager.prototype._createLoad = this._createLoad;
        LoaderManager.prototype.___createLoadWaitZipAsync = this.___createLoadWaitZipAsync;


        
    }
    
    _loaderCount:number = 0;
    // _createLoad
    src_createLoad(url: any, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true, ignoreCache: boolean = false): Laya.LoaderManager 
    {
        return <any>this;
    }

    _createLoad(url: any, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true, ignoreCache: boolean = false): Laya.LoaderManager 
    {
        let manifestHas: boolean = false;
        let zipHas: boolean = false;
        let zipPath:string;
        let zipManager:ZipManager;
        if(ZipManager.enable && !(url instanceof Array))
        {
            zipManager = ZipManager.Instance;
            manifestHas = zipManager.manifest.HasAssetByPath(url);
            if(manifestHas)
            {
                zipPath = zipManager.GetAssetZipPathByAssetUrl(url);
                zipHas = zipManager.HasZip(zipPath);
            }
        }

        if (!manifestHas || zipHas) 
        {
            return this.src_createLoad(url, complete, progress, type, constructParams, propertyParams, priority, ignoreCache);
        }

        this.___createLoadWaitZipAsync(zipPath, url, complete, progress, type, constructParams, propertyParams, priority, ignoreCache);

        return <any>this;
    }

    
    async ___createLoadWaitZipAsync(zipPath:string, url: any, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true, ignoreCache: boolean = false): Laya.LoaderManager 
    {
        // console.log("___createLoadWaitZipAsync await",Laya.loader._loaderCount, url, zipPath);
        let zip = await ZipManager.Instance.GetZipAsync(zipPath);
        await AsyncUtil.MAwitFrame();
        // console.log("___createLoadWaitZipAsync set", Laya.loader._loaderCount,url, zipPath);
        this._loaderCount --;
        var myComplete = Handler.create(this, (data)=>
        {
            this._loaderCount ++;
            if(complete)
            {
                complete.runWith(data);
            }
        })
        this.src_createLoad(url, myComplete, progress, type, constructParams, propertyParams, priority, ignoreCache);
        return <any>this;
    }








    // load
    src_load(url: string|string[]|any[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, priority: number = 1, cache: boolean = true, group: string|null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = Laya.WorkerLoader.enable): Laya.LoaderManager 
    {
        return <any>this;
    }

    load(url: string|string[]|any[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, priority: number = 1, cache: boolean = true, group: string|null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = Laya.WorkerLoader.enable): Laya.LoaderManager 
    {
        let manifestHas: boolean = false;
        let zipHas: boolean = false;
        let zipPath:string;
        let zipManager:ZipManager;
        if(ZipManager.enable && !(url instanceof Array))
        {
            zipManager = ZipManager.Instance;
            manifestHas = zipManager.manifest.HasAssetByPath(url);
            if(manifestHas)
            {
                zipPath = zipManager.GetAssetZipPathByAssetUrl(url);
                zipHas = zipManager.HasZip(zipPath);
            }
        }

        if (!manifestHas || zipHas) 
        {
            return this.src_load(url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        }

        this.__loadWaitZipAsync(zipPath, url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        return <any>this;
    }

    async __loadWaitZipAsync(zipPath:string, url: string|string[]|any[], complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, priority: number = 1, cache: boolean = true, group: string|null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = Laya.WorkerLoader.enable): Laya.LoaderManager 
    {
        // console.log("__loadWaitZipAsync await",Laya.loader._loaderCount, url, zipPath);
        let zip = await ZipManager.Instance.GetZipAsync(zipPath);
        await AsyncUtil.MAwitFrame();
        // console.log("__loadWaitZipAsync set", Laya.loader._loaderCount,url, zipPath);
        this._loaderCount --;
        var myComplete = Handler.create(this, (data)=>
        {
            this._loaderCount ++;
            if(complete)
            {
                complete.runWith(data);
            }
        })
        this.src_load(url, myComplete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        return <any>this;
    }



    src_doLoad(resInfo) {
    }
    _doLoad(resInfo) {
        if (ZipManager.enable) {
            var has = ZipManager.Instance.manifest.HasAssetByPath(resInfo.url);
            
        }
        this.src_doLoad(resInfo);
    }

    
    // _doLoad(resInfo: any): void 
    // {
    //     this._loaderCount++;
    //     var loader: Loader = this._loaders.length ? this._loaders.pop() : new Loader();
    //     loader.on(Event.COMPLETE, null, onLoaded);
    //     loader.on(Event.PROGRESS, null, function (num: number): void {
    //         resInfo.event(Event.PROGRESS, num);
    //     });
    //     loader.on(Event.ERROR, null, function (msg: any): void {
    //         onLoaded(null);
    //     });

    //     var _me: LoaderManager = this;
    //     function onLoaded(data: any = null): void {
    //         loader.offAll();
    //         loader._data = null;
    //         loader._customParse = false;
    //         _me._loaders.push(loader);
    //         _me._endLoad(resInfo, data instanceof Array ? [data] : data);
    //         _me._loaderCount--;
    //         _me._next();
    //     }

    //     loader._constructParams = resInfo.createConstructParams;
    //     loader._propertyParams = resInfo.createPropertyParams;
    //     loader._createCache = resInfo.createCache;
    //     loader.load(resInfo.url, resInfo.type, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
    // }
}