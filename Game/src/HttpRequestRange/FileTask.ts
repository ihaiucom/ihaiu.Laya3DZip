import FileBlock from "./FileBlock";
import HRHead from "./HRHead";
import HRange from "./HRRange";

/** 文件任务 */
export default class FileTask
{
    /** 最大处理数量 */
    static MaxBlockNum = 2;
    /** 单个块最小大小 */
    static singleTmpFileSize = 1024 * 1024 * 5;
    // static singleTmpFileSize = 1024;



    path: string;
    url: string;
    /** 文件总大小 */
    totalSize: number;

    /** 请求返回文件类型 */
    responseType:XMLHttpRequestResponseType = "";
    /** 合并后的结果 */
    response: ArrayBuffer | string;

    /** 结束时是否主动返回Bock */
    isEndRecoverBlockList: boolean = false;
    /** 结束时是否主动返回导对象池 */
    isEndRecover: boolean = false;
    /** 文件块列表 */
    private blockList: FileBlock[] = [];
    /** 文件块结束的数量 */
    private blockEndCount: number = 0;

    /** 回调 */
    onCompleteHandler: Function;
    /** 回调 */
    onProgresssHandler: Function;
    callbackObj: any;

    /** 请求大小 */
    RequestSize()
    {
        HRHead.RequestSize(this.url, this.OnGetSize, this);
        // this.OnGetSize(-1, -1);
    }

    /** 获取导文件大小事件 */
    private OnGetSize(error: number, fileSize: number, url?: string)
    {
        
        this.totalSize = fileSize;
        this.SpliteBlock();
        this.RequestBlocksList();
    }

    /** 请求块列表 */
    RequestBlocksList()
    {
        this.blockEndCount = 0;
        for(var block of this.blockList)
        {
            if(block.isComplete)
            {
                this.blockEndCount ++;
            }
            else
            {
                HRange.Request(block);
            }
        }

        if(this.blockEndCount >= this.blockList.length)
        {
            this.onEnd();
        }
    }



    /** 切分文件块 */
    SpliteBlock()
    {
        var size = this.totalSize;
        var ProcessorCount = FileTask.MaxBlockNum;
        var singleTmpFileSize = FileTask.singleTmpFileSize;
        var blockList = this.blockList;


        //文件块大小
        var blockSize   = Math.floor(size / ProcessorCount);  
        //余数
        var modSize     = this.totalSize % ProcessorCount;

        
        var block:FileBlock;
        if (size < singleTmpFileSize || size<= 0)
        {
            block = FileBlock.PoolGetItem();
            block.fileTask = this;
            block.index = 0;
            block.begin = 0;
            if(size <= 0)
            {
                block.end = -1;
            }
            else
            {
                block.end = size - 1;
            }
            blockList.push(block);
        }
        else
        {
            for(var i = 0; i < ProcessorCount; i ++)
            {
                block = FileBlock.PoolGetItem();
                block.fileTask = this;
                block.index = i;
                block.begin = i * blockSize;
                block.end = (i + 1) * blockSize - 1;

                if (i == ProcessorCount - 1)
                {
                    block.end += modSize;
                }
                blockList.push(block);
            }
        }

        // console.log("blockList.length=", blockList.length);
    }

    /** 启动 */
    Start(url: string, responseType:string="arraybuffer")
    {
        this.url = url;
        this.responseType = <any>responseType;
        this.RequestSize();
    }

    /** 块结束事件 */
    OnBlockEnd(block: FileBlock)
    {
        this.blockEndCount++;
        if(this.blockEndCount >= this.blockList.length)
        {
            this.onEnd();
        }
    }

    /** 结束 */
    onEnd()
    {
        this.Merge();
        Laya.Loader.cacheRes(this.path, this.response);
        if(this.onCompleteHandler)
        {
            if(this.callbackObj)
            {
                this.onCompleteHandler.call(this.callbackObj, this.response, this.path);
            }
            else
            {
                this.onCompleteHandler(this.response, this.path);
            }
        }

        if(this.isEndRecoverBlockList)
        {
            this.RecoverBlockList();
        }

        if(this.isEndRecover)
        {
            this.PoolRecoverItem();
        }
    }

    /** 将block丢回对象池 */
    RecoverBlockList()
    {
        for(var i = 0, len = this.blockList.length; i <  len; i++)
        {
            var block = this.blockList[i];
            FileBlock.PoolRecoverItem(block);
        }
        this.blockList.length = 0;
    }

    /** 合并文件大小 */
    Merge()
    {
        if(this.responseType == "arraybuffer" || this.responseType == <any>"moz-chunked-arraybuffer" || this.responseType == <any>"ms-stream")
        {
            this.MergeArrayBuffer();
        }
        // else if(this.responseType == "text")
        else
        {
            this.MergeText();
        }
    }

    /** 合并二进制文件 */
    MergeArrayBuffer()
    {
        if(this.blockList.length == 1 && this.blockList[0].responseList.length == 1)
        {
            this.response =  this.blockList[0].responseList[0];
        }
        else
        {
            var arr = new ArrayBuffer(this.totalSize);
            var buff = new Int8Array(arr);
            
            for(var i = 0, len = this.blockList.length; i <  len; i++)
            {
                var block = this.blockList[i];
                block.MergeToBuff(buff);
            }
            this.response = arr;
        }

    }

    
    /** 合并文本文件 */
    MergeText()
    {
        if(this.blockList.length == 1 && this.blockList[0].responseList.length == 1)
        {
            this.response = this.blockList[0].responseList[0];
        }
        else
        {
            var arr = [];
            for(var i = 0, len = this.blockList.length; i <  len; i++)
            {
                var block = this.blockList[i];
                arr.push(...block.responseList);
            }
            this.response = arr.join();
        }

    }


    /** 丢回对象池 */
    PoolRecoverItem()
    {
        this.url = null;
        this.totalSize = 0;
        this.loadedSize = 0;
        this.loadedRate = 0;
        this.responseType = "";
        this.response = null;
        this.isEndRecoverBlockList = false;
        this.isEndRecover = false;
        this.RecoverBlockList();
        this.blockEndCount = 0;
        this.onCompleteHandler = null;
        this.callbackObj = null;
        FileTask.RecoverItem(this);
    }

    loadedSize: number = 0;
    loadedRate: number = 0;

    OnPorgess(loadedSize, totalSize)
    {
        if(this.totalSize > 0)
        {
            this.loadedSize  = 0;
            for(var i = 0, len = this.blockList.length; i < len; i ++)
            {
                this.loadedSize += this.blockList[i].loadedSize;
            }
            if(this.loadedSize > 0)
            {
                this.loadedRate = this.loadedSize / this.totalSize;
            }
        }
        else
        {
            this.loadedSize = loadedSize;
            this.totalSize = totalSize;
            this.loadedRate = this.loadedSize / this.totalSize;
        }
        if(this.onProgresssHandler)
        {
            if(this.callbackObj)
            {
                this.onProgresssHandler.call(this.callbackObj, this.loadedRate);
            }
            else
            {
                this.onProgresssHandler(this.loadedRate);
            }
        }
    }
    
    
    private static pool: FileTask[] = [];
    private static GetItem()
    {
        if(this.pool.length > 0)
        {
            return this.pool.shift();
        }
        else
        {
            return new FileTask();
        }
    }

    private static RecoverItem(item: FileTask)
    {
        if(this.pool.indexOf(item) == -1)
        {
            this.pool.push(item);
        }
    }

    static Request(path: string, onCompleteHandler?:Function, onProgresssHandler?:Function,  callbackObj?:any, responseType:string="arraybuffer",  isEndRecoverBlockList: boolean=true, isEndRecover: boolean=true):FileTask
    {
        var res = Laya.Loader.getRes(path);
        if(res)
        {
            if(onCompleteHandler)
            {
                if(callbackObj)
                {
                    onCompleteHandler.call(callbackObj, res, path);
                }
                else
                {
                    onCompleteHandler(res, path);
                }
            }
            return;
        }
        var url = Laya.URL.formatURL(path)
        // if(url.indexOf("Monster_2005_gongjianshou_Skin1.zip") != -1)
        // {
        //     console.error(url);
        // }
        let item = this.GetItem();
        item.path = path;
        item.onCompleteHandler = onCompleteHandler;
        item.onProgresssHandler = onProgresssHandler;
        item.callbackObj = callbackObj;
        item.isEndRecoverBlockList = isEndRecoverBlockList;
        item.isEndRecover = isEndRecover;
        item.Start(url, responseType);
        return item;
    }

    static RequestList(pathList: string[],completeHandler?: Handler, progressHandler?: Handler)
    {
        let len = pathList.length;
        if(len == 0)
        {
            if(completeHandler)
            {
                completeHandler.runWith(true);
            }
            return;
        }
        
        if(progressHandler)
        {
            progressHandler.runWith(0);
        }

        let loadedNum = 0;
        let onItemComplete = ()=>{
            loadedNum ++;
            if(progressHandler)
            {
                progressHandler.runWith(loadedNum / len);
            }

            if(loadedNum >= len)
            {
                if(completeHandler)
                {
                    completeHandler.runWith(true);
                }
            }
        }

        
        let maxRate = 0;
        let onItemProgerss = (rate)=>
        {
            if(len == 1)
            {
                if(progressHandler)
                {
                    maxRate = Math.max(rate, maxRate)
                    progressHandler.runWith(maxRate);
                }
            }
        }

        for(var i = 0; i < len; i ++)
        {
            var url = pathList[i];
            var task = this.Request(url, onItemComplete, onItemProgerss, null, "arraybuffer", true, true);
        }
    }
}
window['FileTask'] = FileTask;
window['FileBlock'] = FileBlock;
window['HRHead'] = HRHead;
window['HRange'] = HRange;


FileTask.MaxBlockNum = 5;
FileTask.singleTmpFileSize =  1024 * 1024 * 5;
HRHead.MaxNum = 5;
HRange.MaxNum = 5;