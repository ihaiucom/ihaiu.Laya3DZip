declare class AssetUrlItem
{
    
    /** 相对路径 */
    path;
    /** 有版本号的相对路径 */
    verpath;
    /** url路径 */
    url;
}
declare class AssetUrlCache 
{
    static GetItem(key:string):AssetUrlItem;
    static GetPath(key:string):string;
}