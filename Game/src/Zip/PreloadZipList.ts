import AsyncUtil from "./AsyncUtil";
import ZipManager from "./ZipManager";

export default class PreloadZipList
{
    zipPathList:string[];
    assetPathList:string[] = [];
    maxLoader = 2;
    isStop: boolean = false;

    total:int = 0;
    loadIndex:int = 0;
    unzipIndex:int = 0;

    constructor(zipPathList:string[], assetPathList:string[])
    {
        this.zipPathList = zipPathList;
        this.assetPathList = assetPathList;
        this.loadIndex = 0;
        this.unzipIndex = 0;
        this.total = zipPathList.length;
        this.maxLoader = Laya.loader.maxLoader - 2;
        this.maxLoader = Math.min(this.maxLoader, 2);
    }

    get IsWait(): boolean
    {
        return Laya.loader._loaderCount >= this.maxLoader;
    }

    
    async StartAsync()
    {
        this.isStop = false;
        await this.LoadListAsync();
        await this.UnzipListAsync();
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

            let zipPath = this.zipPathList[this.loadIndex];
            // console.log("Preload Zip", zipPath);
            await ZipManager.Instance.GetZipAsync(zipPath);
            this.loadIndex ++;
            if(this.isStop)
            {
                break;
            }
        }
    }

    
    async UnzipListAsync()
    {
        if(this.total == 0 || this.isStop)
        {
            return;
        }

        this.unzipIndex = 0;
        this.total = this.assetPathList.length;
        
        let onceNum = 3;
        while(this.unzipIndex < this.total)
        {
            if(this.isStop)
            {
                break;
            }

            for(let i = 0; i < onceNum; i ++)
            {
                if(this.unzipIndex >= this.total || this.isStop)
                {
                    break;
                }
                let assetPath = this.assetPathList[this.unzipIndex];
                if(i < onceNum - 1)
                {
                    // console.log("Preload Read sync", i, assetPath);
                    ZipManager.Instance.GetAssetDataAsync(assetPath)
                }
                else
                {
                    // console.log("Preload Read async", i, assetPath);
                    await ZipManager.Instance.GetAssetDataAsync(assetPath)
                }
                this.unzipIndex ++;
               
            }

            if(this.isStop)
            {
                break;
            }
            
        }
    }

}