import AssetManifest from "./AssetManifest";
import ZipLoader from "./ZipLoader";
import JsZipAsync from "./JsZipAsync";
import { EnumZipAssetDataType } from "./ZipEnum";

export default class ZipManager
{
    
    private static _Instance: ZipManager;
    static get Instance(): ZipManager
    {
        if (!ZipManager._Instance)
        {
            ZipManager._Instance = new ZipManager();
            window['zipManager'] = ZipManager._Instance;
        }
        return ZipManager._Instance;
    }

    zipExt = ".zip";
    zipExtName = "zip";

    /** 资源清单 */
    manifest:AssetManifest;

    /** 初始化 */
    async InitAsync(manifestPath:string, srcRootPath: string, zipRootPath: string, zipExt?:string)
    {
        if(zipExt)
        {
            this.zipExt = zipExt;
            this.zipExtName = zipExt.replace('.', '');
        }

        await AssetManifest.InitAsync(manifestPath, srcRootPath,zipRootPath, zipExt);
        this.manifest = AssetManifest.Instance;
        this.InitCode();
    }

    private InitCode()
    {
        ZipLoader.InitCode();
    }



    /** Zip 资源 */
    zipMap:Map<string, JSZip> = new Map<string, JSZip>();
    /** 资源数据 */
    assetMap:Map<string, any> = new Map<string, any>();

    /** 资源Url 转 路径 */
    AssetUrlToPath(url:string): string
    {
        return url.replace(Laya.URL.basePath, "");
    }

    /** 资源名称转资源路径 */
    AssetNameToPath(assetName:string): string
    {
        return this.manifest.srcRootPath + assetName;
    }


    /** 获取Zip */
    public async GetZipAsync(zipPath:string): Promise<JSZip>
    {
        var zip:JSZip;
        if(this.zipMap.has(zipPath))
        {
            zip = this.zipMap.get(zipPath);
        }
        else
        {
            zip = await JsZipAsync.loadPathAsync(zipPath, Laya.Loader.BUFFER);
            this.zipMap.set(zipPath, zip);
        }
        return zip;
    }

    
    loadImageCount = 0;
    /** 获取资源内容 */
    public GetAssetData(url:string): any
    {
        var assetPath:string = this.AssetUrlToPath(url);
        var data:any;
        
        let type = this.manifest.GetEnumZipAssetDataType(assetPath);
        if(type == EnumZipAssetDataType.base64)
        {
            this.loadImageCount ++;
            console.log(this.loadImageCount, assetPath);
        }

        if(this.assetMap.has(assetPath))
        {
            data = this.assetMap.get(assetPath);
        }
       
        return data;
    }


    /** 获取资源内容 */
    public async GetAssetDataAsync(url:string): Promise<any>
    {
        var assetPath:string = this.AssetUrlToPath(url);
        var data:any;
        
        let type = this.manifest.GetEnumZipAssetDataType(assetPath);
        if(type == EnumZipAssetDataType.base64)
        {
            this.loadImageCount ++;
            console.log(this.loadImageCount, assetPath);
        }

        if(this.assetMap.has(assetPath))
        {
            data = this.assetMap.get(assetPath);
        }
        else
        {
            data = await this.LoadAssetData(assetPath);
            this.assetMap.set(assetPath, data);
        }
        return data;
    }

    imageCount = 0;
    
    /** 加载资源内容 */
    private async LoadAssetData(assetPath:string): Promise<any>
    {
        let assetName = this.manifest.GetAssetNameByPath(assetPath);
        let zipPath = this.manifest.GetAssetZipPath(assetName);
        let type = this.manifest.GetEnumZipAssetDataType(assetName);
        let zip = await this.GetZipAsync(zipPath);
        let data = await JsZipAsync.readAsync(zip, assetName, type);
        switch(type)
        {
            case EnumZipAssetDataType.string:
                data = JSON.parse(data);
                break;
            case EnumZipAssetDataType.base64:
                data = "data:image/png;base64," + data;
                this.imageCount ++;
                break;
        }
        return data;
    }

    /** 加载资源用到的所有Zip */
    public async LoadAssetZipListAsync(assetUrlList: string[], callbacker?:any, onProgerss?:((i, count, rate, path)=>any))
    {
        let assetPathList:string[] = [];
        let assetNameList:string[] = [];
        for(let url of assetUrlList)
        {
            let assetPath = this.AssetUrlToPath(url);
            assetPathList.push(assetPath);

            let assetName = this.manifest.GetAssetNameByPath(assetPath);
            assetNameList.push(assetName);
        }

        
        var progerssFun = (i, len, path)=>
        {
            if(onProgerss)
            {
                if(callbacker)
                {
                    onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                }
                else
                {
                    onProgerss(i, len, Math.ceil(i / len * 100), path);
                }
            }
        }


        let zipPathList = this.manifest.GetAssetListDependencieZipPathList(assetNameList);

        
        return new Promise<any>((resolve)=>
        {
            progerssFun(0, zipPathList.length, "");
            var loadNum = 0;
            var loadTotal = zipPathList.length;
            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];

                if(this.zipMap.has(zipPath))
                {
                    continue;
                }
                else
                {
                    JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, this, (zip)=>
                    {
                        this.zipMap.set(zipPath, zip);
                        loadNum ++;
                        progerssFun(loadNum, loadTotal, zipPath);
                        if(loadNum >= loadTotal)
                        {
                            resolve();
                        }
                    })
                }

                
            }
        });
    }

    /** 读取所有Zip里面的资源 */
    public async ReadAllZipAsync(callbacker?:any, onProgerss?:((i, count, rate, path)=>any), onSubProgerss?:((i, count, rate, path)=>any))
    {
        
        return new Promise<any>((resolve)=>
        {
            let zipPathList: string[] = [];
            this.zipMap.forEach((zip, zipPath)=>{
                zipPathList.push(zipPath);
            });

            var progerssFun = (i, len, path)=>
            {
                if(onProgerss)
                {
                    if(callbacker)
                    {
                        onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                    }
                    else
                    {
                        onProgerss(i, len, Math.ceil(i / len * 100), path);
                    }
                }
            }
            
            var subProgerssFun = (i, len, path)=>
            {
                if(onSubProgerss)
                {
                    if(callbacker)
                    {
                        onSubProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
                    }
                    else
                    {
                        onSubProgerss(i, len, Math.ceil(i / len * 100), path);
                    }
                }
            }

            progerssFun(0, zipPathList.length, "");

            var assetNameCount = 0;
            var assetNameLoadedCount = 0;
            var zipAssetNameListMap:Map<string, string[]> = new Map<string, string[]>();
            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];
                let zip = this.zipMap.get(zipPath);



                let assetNameList:string[] = [];

                for(let assetName in zip.files)
                {
                    let fileObject:JSZip.JSZipObject = zip.files[assetName];
                    if(!fileObject.dir)
                    {
                        let assetPath = this.AssetNameToPath(assetName);
                        if(this.assetMap.has(assetPath))
                        {
                            continue;
                        }

                        assetNameList.push(assetName);
                        assetNameCount ++;
                    }
                }

                zipAssetNameListMap.set(zipPath, assetNameList);
            }


                

            for(let i = 0, len = zipPathList.length; i < len; i ++)
            {
                let zipPath = zipPathList[i];
                let zip = this.zipMap.get(zipPath);

                let assetNameList:string[] = zipAssetNameListMap.get(zipPath);
                subProgerssFun(0, assetNameList.length, "");
                for(let j = 0, jLen = assetNameList.length; j < jLen; j ++)
                {
                    let assetName = assetNameList[j];
                    let assetPath = this.AssetNameToPath(assetName);
                    let type = this.manifest.GetEnumZipAssetDataType(assetName);

                    JsZipAsync.read(zip, assetName, type, this, (data)=>
                    {
                        assetNameLoadedCount ++;
                        if(data)
                        {
                            switch(type)
                            {
                                case EnumZipAssetDataType.string:
                                    data = JSON.parse(data);
                                    break;
                                case EnumZipAssetDataType.base64:
                                    data = "data:image/png;base64," + data;
                                    this.imageCount ++;
                                    break;
                            }
                        }
                        
                        this.assetMap.set(assetPath, data);

                        progerssFun(assetNameLoadedCount, assetNameCount, zipPath);
                        subProgerssFun(j, jLen, assetName);

                        if(assetNameLoadedCount >= assetNameCount)
                        {
                            resolve();
                        }
                    })
                }





            }
        
		});
        
    }


}

window['ZipManager'] = ZipManager;