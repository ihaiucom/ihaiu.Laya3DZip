export default class URL
{
    static getPath(url: string): string 
    {
        var ofs: number = url.lastIndexOf('/');
        return ofs > 0 ? url.substr(0, ofs + 1) : "";
    }
    
}