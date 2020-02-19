import FileTask from "./FileTask";

/** 文件块 */
export default class FileBlock
{
    /** 文件任务 */
    fileTask:FileTask;
    /** 块索引 */
    index:number = 0;

    /** range begin */
    begin: number = 0;
    /** range end */
    end: number = 0;
    /** 已经加载了的内容 */
    responseList:any[] = [];
    /** 已经加载了的大小, 是按总大小的位置 */
    progressList:any[] = [];
    /** 第几次请求 */
    sendIndex = -1;

    /** 获取从加载开始位置 */
    get rangeBegin(): number
    {
        return this.begin + this.loadedSize;
    }

    /** 已经加载了的大小 */
    get loadedSize():number
    { 
        var v = 0;
        for(var i = 0, len=this.progressList.length; i < len; i ++)
        {
            v += this.progressList[i];
        }

        // for(var i = 0, len=this.responseList.length; i < len; i ++)
        // {
        //     if(!this.responseList[i])
        //     {
        //         continue;
        //     }
            
        //     // console.log(this.responseList[i]);
        //     // console.log(this.responseList[i].byteLength)
        // }

        return v;
    }

    // getLoadedSize():number
    // {
    //     var v = 0;
    //     for(var i = 0, len=this.progressList.length; i < len; i ++)
    //     {
    //         v += this.progressList[i];
    //     }

    //     for(var i = 0, len=this.responseList.length; i < len; i ++)
    //     {
    //         console.log(this.responseList[i].length)
    //     }

    //     return v;
    // }

    Reset()
    {
        this.fileTask = null;
        this.begin = 0;
        this.end = 0;
        this.responseList.length = 0;
        this.progressList.length = 1;
        this.progressList[0] = 0;
        this.sendIndex = -1;

        this._isAbort = false;
        this._isComplete = false;
    }

    /** 是否中止加载 */
    _isAbort: boolean = false;
    /** 是否加载完成 */
    _isComplete: boolean = false;

    get isAbort(): boolean
    {
        return this._isAbort;
    }
    
    get isComplete(): boolean
    {
        return this._isComplete;
    }

    OnEnd(isAbort?: boolean)
    {
        this._isAbort = isAbort;
        this._isComplete = this.loadedSize == this.end;
        this.fileTask.OnBlockEnd(this);
    }


    MergeToBuff(buff:Int8Array)
    {
        var offset = this.begin;
        for(var i = 0, len= this.responseList.length; i < len; i ++)
        {
            var item:ArrayBuffer = this.responseList[i];
            var itemBuff = new Int8Array(item);
            buff.set(itemBuff, offset);
            offset += item.byteLength;
        }
    }



    private static pool: FileBlock[] = [];
    static PoolGetItem():FileBlock
    {
        var item: FileBlock;
        if(this.pool.length > 0)
        {
            item = this.pool.shift();
        }
        else
        {
            item = new FileBlock();
        }
        item.Reset();
        return item;
    }

    static PoolRecoverItem(item: FileBlock)
    {
        if(this.pool.indexOf(item) == -1)
        {
            return this.pool.push(item);
        }
    }
}