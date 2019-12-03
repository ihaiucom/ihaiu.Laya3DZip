import DebugResources from "./DebugResources";

export default class DebugLaya3D
{
    static InitCode()
    {
        new DebugLaya3D().InitCode();
    }
    
    private InitCode()
    {
        
        
        var _Laya3D: any = Laya3D;

        _Laya3D.src_endLoad = _Laya3D._endLoad;
        _Laya3D._endLoad = this._endLoad;

    }
    

    
    private src_endLoad(loader: Loader, content: any = null, subResous: any[] = null): void
    {

    }

    private _endLoad(loader: Loader, content: any = null, subResous: any[] = null): void
    {
        DebugResources.onLaya3DEnd(loader.url, content);
        this.src_endLoad(loader, content, subResous);
    }



}