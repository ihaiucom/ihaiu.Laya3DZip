import Handler = Laya.Handler;
export default class HttpRequestPool
{
    static pool: XMLHttpRequest[] = [];
    
    // Laya.loader._loaderCount
    static Get()
    {

    }

    private static GetItem()
    {
        if(this.pool.length > 0)
        {
            return this.pool.shift();
        }
        else
        {
            
        }
    }

    static RecoverItem(item: XMLHttpRequest)
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
        }
    }
}