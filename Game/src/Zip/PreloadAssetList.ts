import AsyncUtil from "./AsyncUtil";
import ZipManager from "./ZipManager";

export default class PreloadAssetList
{
    assetPathList:string[];
    maxLoader = 5;
    isStop: boolean = false;

    total:int = 0;
    loadIndex:int = 0;

    constructor(assetPathList:string[])
    {
        this.assetPathList = assetPathList;
        this.loadIndex = 0;
        this.total = assetPathList.length;
        this.maxLoader = Laya.loader.maxLoader - 1;
        this.maxLoader = Math.max(this.maxLoader, 2);
    }

    get IsWait(): boolean
    {
        return Laya.loader._loaderCount >= this.maxLoader;
    }

    
    async StartAsync()
    {
        this.isStop = false;
        await this.LoadListAsync();
    }

    Stop()
    {
        this.isStop = true;
    }


    async LoadListAsync()
    {
        if(this.total == 0)
        {
            return;
        }
        
        let onceNum = 5;
        
        while(this.loadIndex < this.total)
        {
            
            if(this.isStop)
            {
                break;
            }

            if(this.IsWait)
            {
                await AsyncUtil.MAwitFrame();
            }
            
            if(this.isStop)
            {
                break;
            }

            
            for(let i = 0; i < onceNum; i ++)
            {
                if(this.loadIndex >= this.total || this.isStop)
                {
                    break;
                }
                let assetPath = this.assetPathList[this.loadIndex];
    
                if(i < onceNum - 1)
                {
                    // console.log("Preload Load sync", i, assetPath);
                    AsyncUtil.Load3D(assetPath);
                }
                else
                {
                    // console.log("Preload Load async", i, assetPath);
                    await AsyncUtil.Load3DAsync(assetPath);
                }
                this.loadIndex ++;
               
            }

            if(this.isStop)
            {
                break;
            }


          
            if(this.isStop)
            {
                break;
            }
        }
    }

    

}