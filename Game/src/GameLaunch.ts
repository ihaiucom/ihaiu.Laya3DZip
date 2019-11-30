import AssetManifest from "./Zip/AssetManifest";
import R from "./R";
import TestZip from "./TestZip";
import ZipManager from "./Zip/ZipManager";

export default class GameLaunch 
{
    constructor() 
    {
	}

	// 初始化
	install(callback?: Function)
	{
		this.installAsync(callback);
    }

    async installAsync(callback?: Function)
	{
        if(Engine.borwer.isWXGame)
		{
			if(VersionConfig && VersionConfig.UrlBasePath)
                Laya.URL.basePath = VersionConfig.UrlBasePath;
                
            if(Laya.MiniAdpter)
            {
                Laya.MiniAdpter.nativefiles =
                [
                 
                ];
            }
        }
        
		// 加载版本清单文件
        await this.loadVersionAsync();


        new TestZip();

    }

    
	// 异步加载版本清单文件
	async loadVersionAsync():Promise<void>
	{
		return new Promise<void>((resolve)=>
		{
			Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, ()=>
			{
                resolve();
                this.clearWXFileCache();
            }), 
            Laya.ResourceVersion.FILENAME_VERSION);
		});
    }
    
    
	async checkWXFileCache()
	{
		if(Engine.borwer.isWXGame)
		{
			let preBasePath = Laya.LocalStorage.getItem("__basePath__");
			if (preBasePath != Laya.URL.basePath) 
			{
				console.log(`资源根目录不一样: preBasePath=${preBasePath}, Laya.URL.basePath=${Laya.URL.basePath}`);

				Laya.MiniFileMgr.onSetVersion(preBasePath, Laya.URL.basePath);
			}
		}
	}

	async clearWXFileCache()
	{
		if(Engine.borwer.isWXGame)
		{
			let v = Laya.LocalStorage.getItem("__verIsNeedClear__");
			let vv = "1";
			if (v != vv) 
			{
				console.log("清理缓存 v=", v, "vv=", vv);
				Laya.MiniFileMgr.deleteAll();
				Laya.LocalStorage.setItem("__verIsNeedClear__", vv);
			}
		}
	}


}