
import path from "path";
import fs from "fs";
export default class PathUtil
{
    
	public static  ChangeExtension(filePath:string , ext:string ):string
	{
		var e = path.extname(filePath);
		if(!e || e == "")
		{
			return filePath + ext;
		}

		var backDSC:boolean = filePath.indexOf('\\') != -1;
		filePath = filePath.replace(/\\/g, '/');
		if(filePath.indexOf('/') == -1)
		{
			return filePath.substring(0, filePath.lastIndexOf('.')) + ext;
		}

		var dir = filePath.substring(0, filePath.lastIndexOf('/'));
		var name = filePath.substring(filePath.lastIndexOf('/'), filePath.length - filePath.lastIndexOf('/'));
		name = name.substring(0, name.lastIndexOf('.')) + ext;
		filePath = dir + name;

		if (backDSC)
		{
			filePath = filePath.replace(/\//g, '\\');
		}
		return filePath;
    }
    
    
    /** 读取文件列表 */
    static ReadFileList(rootDir:string, extname:string|any=".lh"):string[]
    {
        var fileList:string[] = [];
        if(!fs.existsSync(rootDir))
        {
            return fileList;
        }

        var list = fs.readdirSync(rootDir);
        for(var name of list)
        {
            var filePath = path.join(rootDir, name);
            filePath = path.normalize(filePath);
            var stat = fs.statSync(filePath);
            if(stat.isFile())
            {
                filePath = filePath.replace(/\\/g, '/');

                if(extname && extname != "")
                {
                    var ext = path.extname(filePath);
                    if(ext == extname)
                    {
                        fileList.push(filePath);
                    }
                }
                else
                {
                    fileList.push(filePath);
                }
            }
        }

        return fileList;
    }

    
    /** 读取文件夹列表 */
    static ReadDirList(rootDir:string):string[]
    {
        var fileList:string[] = [];
        if(!fs.existsSync(rootDir))
        {
            return fileList;
        }

        var list = fs.readdirSync(rootDir);
        for(var name of list)
        {
            var filePath = path.join(rootDir, name);
            filePath = path.normalize(filePath);
            var stat = fs.statSync(filePath);
            if(stat.isDirectory())
            {
                filePath = filePath.replace(/\\/g, '/');
                fileList.push(filePath);
            }
        }

        return fileList;
    }

    
    /** 遍历目录下文件 */
    static RecursiveFile(rootDir:string , fileList:string[] , exts?:string[])
    {
        if(!fs.existsSync(rootDir))
        {
            return;
        }
        
        var list = fs.readdirSync(rootDir);
        var isCheckExt  = exts && exts.length > 0;
        
        for(var name of list)
        {
            var filePath = path.join(rootDir, name);
            filePath = path.normalize(filePath);
            var stat = fs.statSync(filePath);
            if(stat.isFile())
            {
                filePath = filePath.replace(/\\/g, '/');
                if(isCheckExt)
                {
                    var ext  = path.extname(filePath).toLowerCase();
                    if((<string[]>exts).includes(ext))
                    {
                        fileList.push(filePath);
                    }
                }
                else
                {
                    fileList.push(filePath);
                }
            }
            else if(stat.isDirectory())
            {
                this.RecursiveFile(filePath, fileList, exts);
            }
        }

    }

}