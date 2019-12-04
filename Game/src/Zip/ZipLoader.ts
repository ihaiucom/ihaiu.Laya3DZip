import ZipManager from "./ZipManager";

export default class ZipLoader 
{
    static UseAsync:boolean = true;
    static InitCode()
    {
        new ZipLoader().InitCode();
    }
    
    private InitCode()
    {
        var Loader: any = Laya.Loader;
        Loader.prototype.src_loadHttpRequestWhat = Loader.prototype._loadHttpRequestWhat;
        Loader.prototype._loadHttpRequestWhat = this._loadHttpRequestWhat;

        Loader.prototype.src_loadResourceFilter = Loader.prototype._loadResourceFilter;
        Loader.prototype._loadResourceFilter = this._loadResourceFilter;

        Loader.prototype.src_loadHttpRequest = Loader.prototype._loadHttpRequest;
        Loader.prototype._loadHttpRequest = this._loadHttpRequest;

        Loader.prototype.src_loadHtmlImage =  Loader.prototype._loadHtmlImage;
        Loader.prototype._loadHtmlImage = this._loadHtmlImage;
    }

    
	/**@private */
    protected onProgress(value: number): void 
    {
	}

	/**@private */
    protected onError(message: string): void 
    {
	}

	/**
	 * 资源加载完成的处理函数。
	 * @param	data 数据。
	 */
    protected onLoaded(data: any = null): void 
    {
    }


    private _loadResource(type, url)
    {

    }


    
    private src_loadHttpRequestWhat(url, contentType)
    {

    }

    private _loadHttpRequestWhat(url, contentType) 
    {
        
        var ext =  Laya.Utils.getFileExtension(url);
        if(ext == ZipManager.Instance.zipExtName)
        {
            this.src_loadHttpRequestWhat(url, contentType);
            return;
        }
        this._loadHttpRequest(url, contentType, this, this.onLoaded, this, this.onProgress, this, this.onError);
    }

    private src_loadResourceFilter(type: string, url: string): void 
    {

    }

    private _loadResourceFilter(type: string, url: string): void 
    {
        var ext =  Laya.Utils.getFileExtension(url);
        if(ext == ZipManager.Instance.zipExtName)
        {
            this.src_loadResourceFilter(type, url);
            return;
        }
		this._loadResource(type, url);
    }
    
    
    private src_loadHttpRequest(url, contentType, onLoadCaller:ZipLoader, onLoad:Function, onProcessCaller, onProcess, onErrorCaller, onError)
    {

    }

    private async _loadHttpRequest(url, contentType, onLoadCaller:ZipLoader, onLoad:Function, onProcessCaller, onProcess, onErrorCaller, onError)
    {
        var ext =  Laya.Utils.getFileExtension(url);
        if(ext == "zip")
        {
            this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
            return;
        }

        var data:any;
        if(ZipLoader.UseAsync)
        {
            data =  await ZipManager.Instance.GetAssetDataAsync(url);
        }
        else
        {
            data =  ZipManager.Instance.GetAssetData(url);
        }

        if(data)
        {
            // console.log("_loadHttpRequest ", url);
            if(onProcess) onProcess.call(onLoadCaller, 1);
            onLoad.call(onLoadCaller, data)
            return;
        }
        else
        {
            // console.log("src_loadHttpRequest ", url);
            this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
        }

    }

    
    private src_loadHtmlImage(url:string, onLoadCaller, onLoad, onErrorCaller, onError) 
    {

    }

    private async _loadHtmlImage(url:string, onLoadCaller, onLoad, onErrorCaller, onError) 
    {
        
        var data:any;
        if(ZipLoader.UseAsync)
        {
            data =  await ZipManager.Instance.GetAssetDataAsync(url);
        }
        else
        {
            data =  ZipManager.Instance.GetAssetData(url);
        }

        
        if(data)
        {
            // console.log("_loadHtmlImage ", url);
            this.src_loadHtmlImage(data, onLoadCaller, onLoad, onErrorCaller, onError)
        }
        else
        {
            // console.log("src_loadHtmlImage ", url);
            this.src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) 
        }
    }
}