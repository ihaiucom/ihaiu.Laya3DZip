import Handler = Laya.Handler;
import HttpRequestHeadPool from "./HttpRequestHeadPool";
export default class HttpRequestRangePool
{
    static MaxNum = 3;
    static pool: XMLHttpRequest[] = [];
    static currNum = 0;
    static useNum = 0;
    
    private static GetItem()
    {
        var num = Laya.loader._loaderCount + HttpRequestHeadPool.useNum + HttpRequestRangePool.useNum;
        if(num >= 4)
        {
            console.log("当前加载数量超过 Range useNum=", HttpRequestRangePool.useNum, "Head useNum=" + HttpRequestHeadPool.useNum, "maxLoader=", Laya.loader.maxLoader, "_loaderCount=",Laya.loader._loaderCount );
            return null;
        }
        

        if(this.pool.length > 0)
        {
            this.useNum ++;
            var item = this.pool.shift();
            item['__inpool'] = false;
            return item;
        }
        else
        {
            
            this.useNum ++;
            var item =  new XMLHttpRequest();
            item['__inpool'] = false;
            return item;

            // if(this.currNum < this.MaxNum)
            // {
            //     this.currNum ++;
            //     this.useNum ++;
            //     var item =  new XMLHttpRequest();
            //     item['__inpool'] = false;
            //     return item;
            // }
            // else
            // {
            //     return null;
            // }
        }
    }

    static RecoverItem(xhr: XMLHttpRequest)
    {
        xhr.abort();
        xhr.onreadystatechange = null;
        xhr.onprogress = null;
        xhr.onerror = null;
        if(xhr['__inpool'])
        {
            console.log("HttpRequestPool RecoverItem 多次");
            return;
        }
        this.useNum --;

        xhr['__inpool'] = true;
        // if(this.pool.indexOf(xhr) == -1)
        // {
        //     xhr['__inpool'] = true;
        //     this.pool.push(xhr);
        // }

       this.checkWait();

       
    }

    private static checkWait()
    {
        if(this.wait.length > 0)
        {
            var item = this.GetItem();
            if(item)
            {
                let waitItem = this.wait.shift();
                waitItem.runWith(item);
            }
            Laya.timer.frameOnce(1, HttpRequestRangePool, this.checkWait, null, true);
        }
    }

    
    private static wait:Handler[] = [];
    static Request(handler: Handler)
    {
        let item = this.GetItem();
        if(item)
        {
            handler.runWith(item);
        }
        else
        {
            this.wait.push(handler);
            Laya.timer.frameOnce(1, HttpRequestRangePool, this.checkWait, null, true);
        }
    }
}