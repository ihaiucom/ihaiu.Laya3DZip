export default class R
{
    static res3d = "res3d/Conventional/";
    static res3dzip = "res3dzip/";
    static get res3dzip_manifest():string
    {
        return this.res3dzip + "manifest.json";
    }
}