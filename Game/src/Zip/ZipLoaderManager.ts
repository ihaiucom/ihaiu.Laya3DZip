import ZipManager from "./ZipManager";

export default class ZipLoaderManager 
{
    static InitCode() {
        new ZipLoaderManager().InitCode();
    }
    InitCode() {
        var LoaderManager:any = Laya.LoaderManager;
        LoaderManager.prototype.src_doLoad = LoaderManager.prototype._doLoad;
        LoaderManager.prototype._doLoad = this._doLoad;
    }
    src_doLoad(resInfo) {
    }
    _doLoad(resInfo) {
        if (ZipManager.enable) {
            var has = ZipManager.Instance.manifest.HasAssetByPath(resInfo.url);
            
        }
        this.src_doLoad(resInfo);
    }
}