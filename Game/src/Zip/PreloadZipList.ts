import AsyncUtil from "./AsyncUtil";
import ZipManager from "./ZipManager";
import Handler = Laya.Handler;
import FileTask from "../HttpRequestRange/FileTask";

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
        await this.UnzipListAsync();
    }

    Start(completeHandler?: Handler, progressHandler?: Handler)
    {
        if(this.total == 0)
        {
            if(completeHandler) completeHandler.run();
            return;
        }
        let time = Laya.timer.currTimer;
        this.LoadList(
            Handler.create(this, ()=>
            {
                console.log("加载Zip完成", Laya.timer.currTimer-time);
                let time2 = Laya.timer.currTimer;
                this.LoadZipList(Handler.create(this, ()=>
                {
                    console.log("装载Zip完成", Laya.timer.currTimer-time2);
                    let time3 = Laya.timer.currTimer;
                    this.UnzipList(Handler.create(this, ()=>
                    {
                        console.log("解压zip完成", Laya.timer.currTimer-time3);
                        console.log("加载总费时", Laya.timer.currTimer-time);
                        if(progressHandler) progressHandler.recover();
                        if(completeHandler) completeHandler.run();
                    }),
                    Handler.create(this, (progress: number)=>
                    {
                        // 解压进度
                        if(progressHandler) progressHandler.runWith(progress * 0.3 + 0.7);
                    }, null, false));
                }),
                Handler.create(this, (progress: number)=>
                {
                    // 装载进度
                    if(progressHandler) progressHandler.runWith(progress * 0.2 + 0.5);
                }, null, false));


            }),
            Handler.create(this, (progress: number)=>
            {
                // 加载进度
                if(progressHandler) progressHandler.runWith(progress * 0.5);
            }, null, false)
        )
    }

    Stop()
    {
        this.isStop = true;
    }

    
    LoadList(completeHandler?: Handler, progressHandler?: Handler)
    {
        if(this.total == 0)
        {
            if(completeHandler) completeHandler.run();
            return;
        }

        this.LoadList2(
            Handler.create(this, (result: boolean)=>
            {
                if(result == false)
                {
                    Laya.timer.frameOnce(30, this, ()=>
                    {
                        this.LoadList(completeHandler);
                    })
                }
                else
                {
                    if(progressHandler)
                    {
                        progressHandler.runWith(1);
                        progressHandler.recover();
                    }
                    if(completeHandler) completeHandler.runWith(result);
                }
            })
            ,progressHandler
        );
    }

    private LoadList2(completeHandler?: Handler, progressHandler?: Handler)
    {
        FileTask.RequestList(this.zipPathList, completeHandler, progressHandler);
        // Laya.loader.load(
        //     this.zipPathList, 
        //     // complete
        //     completeHandler,
        //     // progress
        //     progressHandler, 
        //     Laya.Loader.BUFFER
        // );
    }

    private loadZipIndex: number = 0;
    private loadedZipIndex: number = 0;
    private loadZipOnceNum: number = 10;
    LoadZipList(completeHandler?: Handler, progressHandler?: Handler)
    {
        if(this.total == 0)
        {
            if(completeHandler) completeHandler.run();
            return;
        }

        var index = 0;
        var len = this.zipPathList.length;
        for(var i = 0;i < len; i ++)
        {
            ZipManager.Instance.GetZip(this.zipPathList[this.loadZipIndex], Handler.create(this, ()=>
            {
                index ++;
                
                if(progressHandler) progressHandler.runWith(index / this.total);
                if(index >= this.total)
                {
                    if(progressHandler) progressHandler.recover();
                    if(completeHandler) completeHandler.run();
                }
            }))

        }


        // this.LoadZipOnce(completeHandler, progressHandler);
    }

    private LoadZipOnce(completeHandler?: Handler, progressHandler?: Handler)
    {
        for(let i = 0; i < this.loadZipOnceNum; i ++)
        {
            ZipManager.Instance.GetZip(this.zipPathList[this.loadZipIndex], Handler.create(this, ()=>
            {
                this.loadedZipIndex ++;
                
                if(progressHandler) progressHandler.runWith(this.loadedZipIndex / this.total);
                if(this.loadedZipIndex >= this.total)
                {
                    if(progressHandler) progressHandler.recover();
                    if(completeHandler) completeHandler.run();
                }
            }))
            this.loadZipIndex ++;
            if(this.loadZipIndex >= this.total)
            {
                break;
            }
        }

        if(this.loadZipIndex >= this.total)
        {
            return;
        }

        Laya.timer.frameOnce(1, this, this.LoadZipOnce, [completeHandler, progressHandler])
    }

    UnzipList(completeHandler?: Handler, progressHandler?: Handler)
    {
        var index = 0;
        var len = this.assetPathList.length;
        if(this.total == 0)
        {
            if(completeHandler) completeHandler.run();
            return;
        }
        
        for(let i = 0; i <  len; i ++)
        {
            let assetPath = this.assetPathList[i];
            ZipManager.Instance.GetOrLoadAssetData(assetPath, Handler.create(this, ()=>{
                index ++;
                if(progressHandler) progressHandler.runWith(index / len);
                if(index >= len)
                {
                    if(progressHandler) progressHandler.recover();
                    if(completeHandler) completeHandler.run();
                }
            }));
        }
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
        
        let onceNum = 5;
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
                    ZipManager.Instance.GetOrLoadAssetDataAsync(assetPath)
                }
                else
                {
                    // console.log("Preload Read async", i, assetPath);
                    await ZipManager.Instance.GetOrLoadAssetDataAsync(assetPath)
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