import ZipManager from "../ZipManager";



export default class LayaExtends_Loader 
{
    static UseAsync:boolean = true;
    static InitCode()
    {
        new LayaExtends_Loader().InitCode();
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

        

        Loader.src_clearRes =  Loader.clearRes;
        Loader.clearRes = LayaExtends_Loader.clearRes;
    }


    
    /**
     * 清理指定资源地址的缓存。 
     * @param url 资源地址。
     */
    static clearRes(url: string): void 
    {
        (<any>Loader).src_clearRes(url);

        if(ZipManager.enable)
        {
            ZipManager.Instance.OnClearResouceAsset(url);
        }
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
        if(ext == ZipManager.Instance.zipExtName || !ZipManager.Instance.HasManifestAssetByUrl(url))
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
        if(ext == ZipManager.Instance.zipExtName || !ZipManager.Instance.HasManifestAssetByUrl(url))
        {
            this.src_loadResourceFilter(type, url);
            return;
        }



		this._loadResource(type, url);
    }
    
    
    private src_loadHttpRequest(url, contentType, onLoadCaller:LayaExtends_Loader, onLoad:Function, onProcessCaller, onProcess, onErrorCaller, onError)
    {

    }

    private async _loadHttpRequest(url, contentType, onLoadCaller:LayaExtends_Loader, onLoad:Function, onProcessCaller, onProcess, onErrorCaller, onError)
    {
        var ext =  Laya.Utils.getFileExtension(url);
        if(ext == ZipManager.Instance.zipExtName)
        {
            this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
            return;
        }

        ZipManager.Instance.GetOrLoadAssetData(url, Handler.create(this, (data)=>{
            if(data)
            {
                Laya.timer.frameOnce(1, this, ()=>{
                    // console.log("_loadHttpRequest ", url);
                    if(onProcess) onProcess.call(onLoadCaller, 1);
                    onLoad.call(onLoadCaller, data)
                })
                return;
            }
            else
            {
                // console.log("src_loadHttpRequest ", url);
                this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
            }
        }))


        // var data:any;
        // if(LayaExtends_Loader.UseAsync)
        // {
        //     data =  await ZipManager.Instance.GetOrLoadAssetDataAsync(url);
        // }
        // else
        // {
        //     data =  ZipManager.Instance.GetAssetData(url);
        // }

        // if(data)
        // {
        //     // console.log("_loadHttpRequest ", url);
        //     if(onProcess) onProcess.call(onLoadCaller, 1);
        //     onLoad.call(onLoadCaller, data)
        //     return;
        // }
        // else
        // {
        //     // console.log("src_loadHttpRequest ", url);
        //     this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
        // }

    }

    
    private src_loadHtmlImage(url:string, onLoadCaller, onLoad, onErrorCaller, onError) 
    {

    }

    private async _loadHtmlImage(url:string, onLoadCaller, onLoad, onErrorCaller, onError) 
    {
        if(url.indexOf("Conventional/res3d/Conventional") != -1)
        {
            console.error("_addHierarchyInnerUrls path=", url);
        }
        
        if (url.indexOf("Langyabing/res3d/Conventional") != -1) {
            console.error("Langyabing/res3d/Conventional path=", url);
        }
        ZipManager.Instance.GetOrLoadAssetData(url, Handler.create(this, (data)=>{
            if(data)
            {
                
                Laya.timer.frameOnce(1, this, ()=>{
                    // console.log("_loadHtmlImage ", url);
                    this.src_loadHtmlImage(data, onLoadCaller, onLoad, onErrorCaller, onError)
                })
            }
            else
            {
                // console.log("src_loadHtmlImage ", url);
                this.src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) 
            }
        }))

        // if(LayaExtends_Loader.UseAsync)
        // {
        //     data =  await ZipManager.Instance.GetOrLoadAssetDataAsync(url);
        // }
        // else
        // {
        //     data =  ZipManager.Instance.GetAssetData(url);
        // }

        
        
    }
}