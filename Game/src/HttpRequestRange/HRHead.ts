/** Http Request Head */
export default class HRHead
{
    xhr: XMLHttpRequest;

    url:string;
    callback: Function;
    callbackObj:any;

    constructor()
    {
        this.xhr = new XMLHttpRequest();
        this.xhr.onreadystatechange = (this.onEvent.bind(this));
    }

    private onEvent(e)
    {
        // console.log(e);
        // console.log(this.xhr.readyState, this.xhr.status);
        if (this.xhr.readyState == 4) 
        {
            if (this.xhr.status == 200) 
            {
                var fileSize = this.xhr.getResponseHeader('Content-Length');
                console.log("HRHead", fileSize, this.url);
                this.ResultCallbak(0, parseInt(fileSize));
            } 
            else 
            {
                console.log("HRHead 请求文件头失败", this.url);
                this.ResultCallbak(1, -1);
            }
        }
    }

    private ResultCallbak(errorCode: number, fileSize: number)
    {
        if(this.callback)
        {
            if(this.callbackObj)
            {
                this.callback.call(this.callbackObj, errorCode, fileSize, this.url);
            }
            else
            {
                this.callback(errorCode, fileSize, this.url);
            }
        }

        this.callback = null;
        this.callbackObj = null;
        this.xhr.abort();
        this.url = null;
        HRHead.RecoverItem(this);

    }



    Request(url: string, callback: Function, callbackObj?:any)
    {
        console.log("HRHead.Request", url);
        this.url = url;
        this.callback = callback;
        this.callbackObj = callbackObj;
        this.xhr.open('HEAD', url, true);
        this.xhr.send()
    }


    public static MaxNum = 2;
    private static currNum = 0;
    private static pool: HRHead[] = [];
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
                return new HRHead();
            }
            else
            {
                return null;
            }
        }
    }

    private static RecoverItem(item: HRHead)
    {
        if(this.wait.length > 0)
        {
            let waitItem = this.wait.shift();
            item.Request(waitItem.url, waitItem.callback, waitItem.callbackObj);
        }
        else
        {
            if(this.pool.indexOf(item) == -1)
            {
                this.pool.push(item);
            }
        }
    }

    private static wait:IRequestItem[] = [];
    static RequestSize(url: string, callback: Function, callbackObj?:any)
    {
        let item = this.GetItem();
        if(item)
        {
            item.Request(url, callback, callbackObj);
        }
        else
        {
            this.wait.push({url: url, callback: callback, callbackObj:callbackObj});
        }
    }
}

interface IRequestItem
{
    url:string,
    callback: Function;
    callbackObj?:any;
}