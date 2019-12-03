export default class AsyncUtil
{
    
    static async MAwitFrame(delayFrame: number = 1):Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.timer.frameOnce(delayFrame, this, ()=>{
                resolve();
            })
        });
    }
    
    static ResolveDelayCall(resolve:Function, ...args)
    {
        Laya.timer.frameOnce(1, this, ()=>{
            resolve(...args);
        })
    }

    
	static async Load3DAsync(path: string):Promise<any>
	{
        return new Promise<any>((resolve)=>
        {
			Laya.loader.create(path, Laya.Handler.create(null, (res)=>
			{
                AsyncUtil.ResolveDelayCall(resolve, res);
			}));
		});
    }
    
	static  Load3D(path: string, callbacker?:any, onComponent?:Function)
	{
        Laya.loader.create(path, Laya.Handler.create(null, (res)=>
        {
            if(onComponent)
            {
               if(callbacker)
               {
                onComponent.call(callbacker, res);
               } 
               else
               {
                onComponent(res); 
               }
            }
        }));
    }
}

window['AsyncUtil'] = AsyncUtil;