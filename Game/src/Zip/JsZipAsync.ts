import ZipManager from "./ZipManager";
import Handler = Laya.Handler;
import FileTask from "../HttpRequestRange/FileTask";

export default class JsZipAsync
{
    
    

    static loadPath(path: string, type:string, callback:Handler)
    {
        var isUseLaya = false;
        // if(path.indexOf("res3d/") != -1)
        // {
        //     if(path.indexOf("Effect_100") != -1|| path.indexOf("Hero_100") != -1)
        //     {
        //         isUseLaya = true;
        //     }
        // }
        
        if(!isUseLaya)
        {
            FileTask.Request(path, (res:any, url)=>
            {
                    Laya.loader.clearRes(path);

                    if(ZipManager.Instance.zipMap.has(path))
                    {
                        let zip = ZipManager.Instance.zipMap.get(path);
                        callback.runWith(zip);
                        return;
                    }
    
                    JSZip.loadAsync(res).then((zip:JSZip)=>
                    {
                        callback.runWith(zip);
                    }).catch((error)=>{
                        console.error(error, path);
                        callback.runWith(null);
                    })
            });
        }
        else
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    Laya.loader.clearRes(path);

                    if(ZipManager.Instance.zipMap.has(path))
                    {
                        let zip = ZipManager.Instance.zipMap.get(path);
                        callback.runWith(zip);
                        return;
                    }
    
                    JSZip.loadAsync(res).then((zip:JSZip)=>
                    {
                        callback.runWith(zip);
                    }).catch((error)=>{
                        console.error(error, path);
                        callback.runWith(null);
                    })

                }), 
                null, type);

        }
        
    }

    // static async loadPathAsync(path: string, type:string): Promise<JSZip>
    // {
    //     return new Promise<any>((resolve)=>
    //     {
    //         Laya.loader.load(path, 
    //             Laya.Handler.create(null, (res: any) =>
    //             {
    //                 if(ZipManager.Instance.zipMap.has(path))
    //                 {
    //                     let zip = ZipManager.Instance.zipMap.get(path);
    //                     resolve(zip);
    //                     return;
    //                 }

    //                 JSZip.loadAsync(res).then((zip:JSZip)=>
    //                 {
    //                     resolve(zip);
    //                 }).catch((error)=>{
    //                     console.error(error);
    //                     resolve();
    //                 })
    //             }), 
    //             null, type, undefined, false);
	// 	});
    // }

    
    // static async readAsync(zip:JSZip, path: string, type:string): Promise<any>
    // {
    //     return new Promise<any>((resolve)=>
    //     {
    //         zip.file(path).async(<any>type).then((data:any)=>
    //         {
    //             resolve(data);
    //         }).catch((error)=>{
    //             console.error(error);
    //             resolve();
    //         });
	// 	});
    // }

    
    static read(zip:JSZip, path: string, type:string, callback: Handler)
    {
        zip.file(path).async(<any>type).then((data:any)=>
        {
            callback.runWith(data);
        }).catch((error)=>
        {
            console.error(error, path);
            callback.runWith(null);
        });

    }
}