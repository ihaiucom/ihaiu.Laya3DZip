import ZipManager from "../ZipManager";

export default class LayaExtends_Resouces
{
    static InitCode()
    {
        new LayaExtends_Resouces().InitCode();
    }

    
    private InitCode()
    {
        var Resource: any = Laya.Resource;
        Resource.prototype.src_destroy = Resource.prototype.destroy;
        Resource.prototype.destroy = this.destroy;

    }

    _url: string;
    src_destroy()
    {

    }

	/**
	 * 销毁资源,销毁后资源不能恢复。
	 */
    destroy(): void 
    {
        this.src_destroy();
        if(ZipManager.enable)
        {
            if (this._url) 
            {
                ZipManager.Instance.OnClearResouceAsset(this._url);
            }
        }

    }
}