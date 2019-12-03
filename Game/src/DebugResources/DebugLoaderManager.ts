import DebugResources from "./DebugResources";

export default class DebugLoaderManager 
{
    static InitCode()
    {
        new DebugLoaderManager().InitCode();
    }
    
    private InitCode()
    {
        var LoaderManager: any = Laya.LoaderManager;

        LoaderManager.prototype.src_createOne = LoaderManager.prototype._createOne;
        LoaderManager.prototype._createOne = this._createOne;
        
        
        LoaderManager.prototype.src_create = LoaderManager.prototype._create;
        LoaderManager.prototype._create = this._create;
        

    }
    
    url:string;

    
    private src_createOne(url: string, mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void
    {

    }
    private _createOne(url: string, mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void
    {
        DebugResources.onCreateOnceBegin(url);
        var myComplete = Handler.create(this, (res)=>{
            if(complete)
            {
                DebugResources.onCreateOnceEnd(url, res);
                complete.runWith(res);
            }
        })
        this.src_createOne(url, mainResou, myComplete, progress, type, constructParams, propertyParams, priority, cache);
    }

    
    src_create(url: any, mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void 
    {
        
    }

    _create(url: any, mainResou: boolean, complete: Handler|null = null, progress: Handler|null = null, type: string|null = null, constructParams: any[]|null = null, propertyParams: any = null, priority: number = 1, cache: boolean = true): void 
    {
        DebugResources.onCreateBegin(url);
        var myComplete = Handler.create(this, (res)=>{
            if(complete)
            {
                DebugResources.onCreateEnd(url);
                complete.runWith(res);
            }
        })
        this.src_create(url, mainResou, myComplete, progress, type, constructParams, propertyParams, priority, cache);
    }



}