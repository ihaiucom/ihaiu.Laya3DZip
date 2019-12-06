import ZipManager from "./ZipManager";

export default class JsZipAsync
{
    
    static loadPath(path: string, type:string, callbacker:any, onComponent:((zip)=>void))
    {
        Laya.loader.load(path, 
            Laya.Handler.create(null, (res: any) =>
            {
                if(!res)
                {
                    
                    console.error("没加载到资源:", path);
                    
                    if(onComponent)
                    {
                        onComponent.call(callbacker, null);
                    }
                    return;
                }
                
                JSZip.loadAsync(res).then((zip:JSZip)=>
                { 
                    if(onComponent)
                    {
                        onComponent.call(callbacker, zip);
                    }
                }).catch((error)=>{
                    console.error(error);
                    
                    if(onComponent)
                    {
                        onComponent.call(callbacker, null);
                    }
                })
            }), 
            null, type);
    }

    static async loadPathAsync(path: string, type:string): Promise<JSZip>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    if(ZipManager.Instance.zipMap.has(path))
                    {
                        let zip = ZipManager.Instance.zipMap.get(path);
                        resolve(zip);
                        return;
                    }

                    JSZip.loadAsync(res).then((zip:JSZip)=>
                    {
                        resolve(zip);
                    }).catch((error)=>{
                        console.error(error);
                        resolve();
                    })
                }), 
                null, type);
		});
    }

    
    static async readAsync(zip:JSZip, path: string, type:string): Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            zip.file(path).async(<any>type).then((data:any)=>
            {
                resolve(data);
            }).catch((error)=>{
                console.error(error);
                resolve();
            });
		});
    }

    
    static read(zip:JSZip, path: string, type:string, callbacker:any, onComponent:((data)=>void))
    {
        zip.file(path).async(<any>type).then((data:any)=>
        {
            if(onComponent)
            {
                onComponent.call(callbacker, data);
            }
        }).catch((error)=>{
            console.error(error);
            
            if(onComponent)
            {
                onComponent.call(callbacker, null);
            }
        });

    }
}