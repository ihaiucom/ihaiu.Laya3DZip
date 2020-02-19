import Handler = Laya.Handler;
export default class WaitCallbackList
{
    key: any;
    list: Handler[] = [];

    add(handler: Handler)
    {
        this.list.push(handler);
    }

    run()
    {
        for(var item of this.list)
        {
            item.run();
        }
    }

    runWith(data:any)
    {
        
        for(var item of this.list)
        {
            item.runWith(data);
        }
    }

    clear()
    {
        this.list.length = 0;
        this.key = null;
    }

    static map: Map<any, WaitCallbackList> = new Map<any, WaitCallbackList>();
    static Get(key: any)
    {
        if(this.map.has(key))
        {
            return this.map.get(key);
        }
    }

    static GetOrCreate(key: any)
    {
        if(this.map.has(key))
        {
            return this.map.get(key);
        }

        var item = Laya.Pool.createByClass(WaitCallbackList);
        item.key = key;
        this.map.set(key, item);
        return item;
    }

    static Add(key:any, handler:Handler)
    {
        var item = this.GetOrCreate(key);
        item.add(handler);
    }

    static Recover(key:any, item: WaitCallbackList)
    {
        item.clear();
        this.map.delete(key);
        Laya.Pool.recoverByClass(item);
    }

    static Run(key:any)
    {
        var item = this.Get(key);
        if(item)
        {
            item.run();
            this.Recover(key, item);
        }
        else
        {
            console.warn("WaitCallbackList没有这个的监听了", key);
        }
    }

    static RunWith(key:any, data: any)
    {
        var item = this.Get(key);
        if(item)
        {
            item.runWith(data);
            this.Recover(key, item);
        }
        else
        {
            console.warn("WaitCallbackList没有这个的监听了", key);
        }
    }

}