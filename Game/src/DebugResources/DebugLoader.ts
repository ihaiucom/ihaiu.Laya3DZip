import DebugResources from "./DebugResources";

export default class DebugLoader 
{
    static InitCode()
    {
        new DebugLoader().InitCode();
    }
    
    private InitCode()
    {
        var Loader: any = Laya.Loader;

        Loader.prototype.src_load = Loader.prototype.load;
        Loader.prototype.load = this.load;
        
        
        Loader.prototype.src_onLoaded = Loader.prototype.onLoaded;
        Loader.prototype.onLoaded = this.onLoaded;

        
        Loader.prototype.src_endLoad = Loader.prototype.endLoad;
        Loader.prototype.endLoad = this.endLoad;

        
        
        Loader.prototype.src_onError = Loader.prototype.onError;
        Loader.prototype.onError = this.onError;
        

    }
    
    url:string;

    
    src_onError(message) 
    {
    }

    onError(message) 
    {
        DebugResources.onLoadError(this.url);
        this.onError(message);
    }


    src_endLoad(content: any = null): void 
    {
    }
    
    endLoad(content: any = null): void 
    {
        DebugResources.onLoadEnd(this.url);
        this.src_endLoad(content);
    }


    
    src_onLoaded(data: any = null): void 
    {
    }

    
    onLoaded(data: any = null): void 
    {
        DebugResources.onLoaded(this.url, data);
        this.src_onLoaded(data);
    }




    src_load(url: string, type: string | null = null, cache: boolean = true, group: string | null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = Laya.WorkerLoader.enable): void 
    {
    }

    load(url: string, type: string | null = null, cache: boolean = true, group: string | null = null, ignoreCache: boolean = false, useWorkerLoader: boolean = Laya.WorkerLoader.enable): void 
    {
        DebugResources.onLoadBegin(url);
        this.src_load(url, type, cache, group, ignoreCache, useWorkerLoader);
    }



}