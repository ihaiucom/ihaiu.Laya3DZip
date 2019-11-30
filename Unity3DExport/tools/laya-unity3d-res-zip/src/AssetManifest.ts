import AssetNode from "./AssetNode";
import fs from "fs";
import ConfigSetting from "./ConfigSetting";


export default class AssetManifest
{
    /** 资源列表 */
    assetId2Name:DictionaryObject<number, string> | any = {};
    /** zip列表 */
    zipId2Name:DictionaryObject<number, string> | any = {};
    /** Zip资源列表 */
    zipAssets: DictionaryObject<number, number[]> | any = {};
    /** 资源依赖列表 */
    assetsDependencie: DictionaryObject<number, number[]> | any= {};
    /** 预设依赖列表 */
    prefabDependencie: DictionaryObject<number, number[]> | any= {};


    /** 生成资源列表 */
    GenerateAssets(map:Map<string, AssetNode>, prefabList:AssetNode[], resourceRoot: string)
    {
        map.forEach((item, filePath)=>
        {
            var filePath =  filePath.replace(resourceRoot + "/", "");
            this.assetId2Name[item.uid] = filePath;

            
            if(ConfigSetting.manifest.assetsDependencie)
            {
                var assetIds = this.assetsDependencie[item.uid] = [];
                item.GetDependencieUidList(assetIds, true)
            }
        });

        
        if(ConfigSetting.manifest.prefabDependencie)
        {
            for(let item of prefabList)
            {
                var assetIds = this.prefabDependencie[item.uid] = [];
                item.GetDependencieUidList(assetIds, true)
            }
        }
    }

    GenerateZips(zipMap: Map<string, AssetNode[]>)
    {
        let UID = 1;
        zipMap.forEach((list, zipName)=>
        {
            let uid = UID ++;
            this.zipId2Name[uid] = zipName;
            var assetIds:number[] = this.zipAssets[uid] = [];
            for(let item of list)
            {
                assetIds.push(item.uid);
            }
        });
    }

    ToJson():string
    {
        var json = JSON.stringify(this, null, 4);
        return json;
    }

    Save(filePath:string)
    {
        fs.writeFileSync(filePath, this.ToJson());
    }

}