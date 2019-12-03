import DebugLoader from "./DebugLoader";
import DebugLoaderManager from "./DebugLoaderManager";
import ZipManager from "../Zip/ZipManager";
import DebugLaya3D from "./DebugLaya3D";

enum DebugLoaderState
{
    Begin = "Begin",
    LoadedSucess = "LoadedSucess",
    LoadedFail = "LoadedFail",
}

export default class DebugResources
{
    static enable: boolean = false;

    static Init()
    {
        this.enable = true;
        DebugLoader.InitCode();
        DebugLoaderManager.InitCode();
        DebugLaya3D.InitCode();
    }

    static stateMap:Map<string, DebugLoaderState> = new Map<string, DebugLoaderState>();
    static loadBeginNumMap:Map<string, any> = new Map<string, any>();
    static loadedNumMap:Map<string, any> = new Map<string, any>();
    static loadEndNumMap:Map<string, any> = new Map<string, any>();
    static loadErrorNumMap:Map<string, any> = new Map<string, any>();

    
    static prefabStateMap:Map<string, DebugLoaderState> = new Map<string, DebugLoaderState>();
    static prefabBeginNumMap:Map<string, any> = new Map<string, any>();
    static prefabEndNumMap:Map<string, any> = new Map<string, any>();

    static createrOnceResMap:Map<string, any> = new Map<string, any>();
    static createrOnceStateMap:Map<string, DebugLoaderState> = new Map<string, DebugLoaderState>();
    static createOnceBeginNumMap:Map<string, any> = new Map<string, any>();
    static createOnceEndNumMap:Map<string, any> = new Map<string, any>();
    

    static createrStateMap:Map<string, DebugLoaderState> = new Map<string, DebugLoaderState>();
    static createeBeginNumMap:Map<string, any> = new Map<string, any>();
    static createEndNumMap:Map<string, any> = new Map<string, any>();


    
    static laya3dStateMap:Map<string, DebugLoaderState> = new Map<string, DebugLoaderState>();
    static laya3dBeginNumMap:Map<string, any> = new Map<string, any>();
    static laya3dEndNumMap:Map<string, any> = new Map<string, any>();

    
    static onLaya3DBegin(url:string)
    {
        this.laya3dStateMap.set(url, DebugLoaderState.Begin);
        var num = 0;
        if(this.laya3dBeginNumMap.has(url))
        {
            num = this.laya3dBeginNumMap.get(url);
        }
        this.laya3dBeginNumMap.set(url, num + 1);
    }

    
    static onLaya3DEnd(url:string, res:any)
    {
        this.laya3dStateMap.set(url, res ? DebugLoaderState.LoadedSucess : DebugLoaderState.LoadedFail);
        var num = 0;
        if(this.laya3dEndNumMap.has(url))
        {
            num = this.laya3dEndNumMap.get(url);
        }
        this.laya3dEndNumMap.set(url, num + 1);
    }


    static onCreateOnceBegin(url:string)
    {
        this.createrOnceStateMap.set(url, DebugLoaderState.Begin);
        var num = 0;
        if(this.createOnceBeginNumMap.has(url))
        {
            num = this.createOnceBeginNumMap.get(url);
        }
        this.createOnceBeginNumMap.set(url, num + 1);
    }

    
    static onCreateOnceEnd(url:string, res:any)
    {
        this.createrOnceResMap.set(url, res);
        this.createrOnceStateMap.set(url, res ? DebugLoaderState.LoadedSucess : DebugLoaderState.LoadedFail);
        var num = 0;
        if(this.createOnceEndNumMap.has(url))
        {
            num = this.createOnceEndNumMap.get(url);
        }
        this.createOnceEndNumMap.set(url, num + 1);
    }



    static onCreateBegin(url:string)
    {
        this.createrStateMap.set(url, DebugLoaderState.Begin);
        var num = 0;
        if(this.createeBeginNumMap.has(url))
        {
            num = this.createeBeginNumMap.get(url);
        }
        this.createeBeginNumMap.set(url, num + 1);
    }

    
    static onCreateEnd(url:string)
    {
        this.createrStateMap.set(url, DebugLoaderState.LoadedSucess);
        var num = 0;
        if(this.createEndNumMap.has(url))
        {
            num = this.createEndNumMap.get(url);
        }
        this.createEndNumMap.set(url, num + 1);
    }



    
    static onPrefabBegin(url:string)
    {
        if(!this.enable)
            return;
        this.prefabStateMap.set(url, DebugLoaderState.Begin);
        var num = 0;
        if(this.prefabBeginNumMap.has(url))
        {
            num = this.prefabBeginNumMap.get(url);
        }
        this.prefabBeginNumMap.set(url, num + 1);
    }

    
    static onPrefabEnd(url:string)
    {
        if(!this.enable)
            return;
        this.prefabStateMap.set(url, DebugLoaderState.LoadedSucess);
        var num = 0;
        if(this.prefabEndNumMap.has(url))
        {
            num = this.prefabEndNumMap.get(url);
        }
        this.prefabEndNumMap.set(url, num + 1);
    }

    static onLoadBegin(url:string)
    {
        this.stateMap.set(url, DebugLoaderState.Begin);

        var num = 0;
        if(this.loadBeginNumMap.has(url))
        {
            num = this.loadBeginNumMap.get(url);
        }
        this.loadBeginNumMap.set(url, num + 1);
    }

    static onLoaded(url:string, data:any)
    {
        if(url == "res/res3dzip/Hero_0001_LongQi_Skin1.zip")
        {
            console.log(1);
        }

        if(data)
        {
            this.stateMap.set(url, DebugLoaderState.LoadedSucess);
        }
        else
        {
            this.stateMap.set(url, DebugLoaderState.LoadedFail);
        }

        
        var num = 0;
        if(this.loadedNumMap.has(url))
        {
            num = this.loadedNumMap.get(url);
        }
        this.loadedNumMap.set(url, num + 1);
    }
    
    static onLoadEnd(url:string)
    {
        if(url == "res/res3dzip/Hero_0001_LongQi_Skin1.zip")
        {
            console.log(1);
        }

        var num = 0;
        if(this.loadEndNumMap.has(url))
        {
            num = this.loadEndNumMap.get(url);
        }
        this.loadEndNumMap.set(url, num + 1);

    }

    
    static onLoadError(url:string)
    {
        var num = 0;
        if(this.loadErrorNumMap.has(url))
        {
            num = this.loadErrorNumMap.get(url);
        }
        this.loadErrorNumMap.set(url, num + 1);

    }



    static GetInfo(url:string)
    {
        return `Loader: ${this.stateMap.get(url)},  beginNum=${this.loadBeginNumMap.get(url)},  loadedNum=${this.loadedNumMap.get(url)},  endNum=${this.loadEndNumMap.get(url)}, ErrorNum=${this.loadErrorNumMap.get(url)},  ${url}`;
    }

    
    static GetPrefabInfo(url:string)
    {
        return `Prefab: ${this.prefabStateMap.get(url)},  beginNum=${this.prefabBeginNumMap.get(url)},  endNum=${this.prefabEndNumMap.get(url)},  ${url}`;
    }
    
    static GetCreateOnceInfo(url:string)
    {
        return `CreateOnce: ${this.createrOnceStateMap.get(url)},  beginNum=${this.createOnceBeginNumMap.get(url)},  endNum=${this.createOnceEndNumMap.get(url)},  ${url}`;
    }
    
    static GetCreateInfo(url:string)
    {
        return `Create: ${this.createrStateMap.get(url)},  beginNum=${this.createeBeginNumMap.get(url)},  endNum=${this.createEndNumMap.get(url)},  ${url}`;
    }

    
    static PrintPrefabAssetsInfo(url:string)
    {
        if(!ZipManager.Instance.manifest)
        {
            console.warn("没有ZipManager.Instance.manifest");
            return;
        }
        console.log("CheckPrefab:", url);
        let prefabAssetName = ZipManager.Instance.AssetUrlToName(url);
        let dependenciePathList = ZipManager.Instance.manifest.GetAssetDependenciePathList(prefabAssetName);
        for(let itemAssetPath of dependenciePathList)
        {
            let state =  this.createrOnceStateMap.get(itemAssetPath);
            let state2 =  this.laya3dStateMap.get(itemAssetPath);
            let info = `${state}, laya3dState=${state2},  createOnceBeginNumMap=${this.createOnceBeginNumMap.get(itemAssetPath)},  createOnceEndNumMap=${this.createOnceEndNumMap.get(itemAssetPath)}, ${itemAssetPath}, ${this.createrOnceResMap.get(itemAssetPath)}`;
            if(state != DebugLoaderState.LoadedSucess || state2 != DebugLoaderState.LoadedSucess )
            {
                console.warn(info);
            }
            else
            {
                console.log(info);
            }
        }
    }

    static Check()
    {
        this.CheckNoLoaded();
    }

    /** 检测没有加载完成的 */
    static CheckNoLoaded()
    {
        console.log("CheckNoLoaded");
        this.stateMap.forEach((state, url)=>{
            if(state != DebugLoaderState.LoadedSucess)
            {
                console.warn(this.GetInfo(url));
            }
        });

        this.loadErrorNumMap.forEach((state, url)=>{
            
            console.error(this.GetInfo(url));
        });

        this.prefabStateMap.forEach((state, url)=>{
            if(state != DebugLoaderState.LoadedSucess)
            {
                console.warn(this.GetPrefabInfo(url));
            }
        });

        
        this.createrOnceStateMap.forEach((state, url)=>{
            if(state != DebugLoaderState.LoadedSucess)
            {
                console.warn(this.GetCreateOnceInfo(url));
            }
        });

        
        this.createrStateMap.forEach((state, url)=>{
            if(state != DebugLoaderState.LoadedSucess)
            {
                console.warn(this.GetCreateInfo(url));
            }
        });

        console.log("检测预设哪个文件没加载完成");
        this.prefabStateMap.forEach((state, url)=>{
            if(state != DebugLoaderState.LoadedSucess)
            {
                this.PrintPrefabAssetsInfo(url)
            }
        });
    }


}

window['DebugResources'] = DebugResources;