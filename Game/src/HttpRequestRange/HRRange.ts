import FileBlock from "./FileBlock";

export default class HRange
{
    xhr: XMLHttpRequest;
    block: FileBlock;

    get blockInfo()
    {
        return "block_" + this.block.index + ", sendIndex=" + this.block.sendIndex;
    }

    constructor()
    {
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = (this.onreadystatechange.bind(this));
        this.xhr.onprogress = (this.onprogress.bind(this));
        this.xhr.onerror = (this.onerror.bind(this));
        window['xhr'] = this;
    }
    
    private onreadystatechange(e)
    {
        if(!this.block)
        {
            return;
        }

        if(this.xhr.readyState >= XMLHttpRequest.LOADING)
        {
            if (this.xhr.response) 
            {
                // console.log(this.blockInfo, "responseList sendIndex " ,this.block.sendIndex, this.xhr.response, "readyState=", this.xhr.readyState, "status=", this.xhr.status);
                this.block.responseList[this.block.sendIndex] = this.xhr.response;
            }
        }

        if (this.xhr.readyState == 4) 
        {
            // console.log(this.blockInfo, "HRange 完成", " readyState=" + this.xhr.readyState, " status="+ this.xhr.status, "response=", this.xhr.response, this.block.fileTask.url);
             
                
            if (this.xhr.status >= 200 && this.xhr.status < 300 || this.xhr.response) 
            {
                // console.log(this.blockInfo, "OnEnd");
                this.OnEnd();
            } 
            else 
            {
                console.error(this.blockInfo, "HRange 请求文件失败", " readyState=" + this.xhr.readyState, " status="+ this.xhr.status, "response=", this.xhr.response, this.block.fileTask.url);
                // 加载错误就尝试重新加载
                // this.Request(this.block, true);
            }
        }
    }

    
    private onprogress (e) 
    {
        // this.block.responseList[this.block.sendIndex] = this.xhr.response;
        this.block.progressList[this.block.sendIndex] = e.loaded;
        this.block.fileTask.OnPorgess(e.loaded, e.total);
        // console.log("onprogress", e);
        // console.log(this.blockInfo, "onprogress", e.loaded, e.total,  Math.ceil(e.loaded/ e.total * 100) + "%", e);
        // console.log(this.blockInfo, "onprogress", e.loaded, e.total,  Math.ceil(e.loaded/ e.total * 100) + "%");
    }

    private onabort()
    {
        console.warn(this.blockInfo, "onabort");
        this.OnEnd(true);
    }

    private onerror(e)
    {
        console.error(this.blockInfo, e, this.block.fileTask.url);
        // 加载错误就尝试重新加载
        Laya.timer.frameOnce(10, this, this.Request, [this.block, true]);
        // this.Request(this.block, true);
    }

    private OnEnd(isAbort?: boolean)
    {
        this.block.OnEnd(isAbort);
        this.block = null;
        if(!isAbort)
        {
            this.xhr.abort();
        }
        HRange.RecoverItem(this);
    }

    Request(block:FileBlock, isError?: boolean)
    {
        if(isError)
        {
            if(!block.responseList[block.sendIndex])
            {
                block.progressList[block.sendIndex] = 0;
            }
            else
            {
                block.sendIndex ++;
            }
        }
        else
        {
            block.sendIndex ++;
        }
        this.block = block;
        this.xhr.abort();
        this.xhr.responseType = block.fileTask.responseType;
        this.xhr.open("get", block.fileTask.url, true);
        if(block.end <= 0)
        {
            this.xhr.setRequestHeader("Range",`bytes=0- `);
        }
        else
        {
            this.xhr.setRequestHeader("Range",`bytes=${block.rangeBegin}-${block.end}`);
        }
        // this.xhr.setRequestHeader("content-type", "application/zip");
        this.xhr.setRequestHeader("content-type", "application/octet-stream");
        
        this.xhr.send();
        console.log(this.blockInfo, "HRRange.Request", this.block.fileTask.url);
    }

    Abort()
    {
        this.xhr.abort();
    }



    
    public static MaxNum = 2;
    private static currNum = 0;
    private static pool: HRange[] = [];
    private static GetItem()
    {
        if(this.pool.length > 0)
        {
            return this.pool.shift();
        }
        else
        {
            if(this.currNum < this.MaxNum)
            {
                this.currNum ++;
                return new HRange();
            }
            else
            {
                return null;
            }
        }
    }

    private static RecoverItem(item: HRange)
    {
        if(this.wait.length > 0)
        {
            let waitItem = this.wait.shift();
            item.Request(waitItem);
        }
        else
        {
            if(this.pool.indexOf(item) == -1)
            {
                this.pool.push(item);
            }
        }
    }

    private static wait:FileBlock[] = [];
    static Request(bolck: FileBlock)
    {
        let item = this.GetItem();
        if(item)
        {
            item.Request(bolck);
        }
        else
        {
            this.wait.push(bolck);
        }
    }
}