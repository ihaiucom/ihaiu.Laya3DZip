"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class PathUtil {
    static ChangeExtension(filePath, ext) {
        var e = path_1.default.extname(filePath);
        if (!e || e == "") {
            return filePath + ext;
        }
        var backDSC = filePath.indexOf('\\') != -1;
        filePath = filePath.replace(/\\/g, '/');
        if (filePath.indexOf('/') == -1) {
            return filePath.substring(0, filePath.lastIndexOf('.')) + ext;
        }
        var dir = filePath.substring(0, filePath.lastIndexOf('/'));
        var name = filePath.substring(filePath.lastIndexOf('/'), filePath.length - filePath.lastIndexOf('/'));
        name = name.substring(0, name.lastIndexOf('.')) + ext;
        filePath = dir + name;
        if (backDSC) {
            filePath = filePath.replace(/\//g, '\\');
        }
        return filePath;
    }
    /** 读取文件列表 */
    static ReadFileList(rootDir, extname = ".lh") {
        var fileList = [];
        if (!fs_1.default.existsSync(rootDir)) {
            return fileList;
        }
        var list = fs_1.default.readdirSync(rootDir);
        for (var name of list) {
            var filePath = path_1.default.join(rootDir, name);
            filePath = path_1.default.normalize(filePath);
            var stat = fs_1.default.statSync(filePath);
            if (stat.isFile()) {
                filePath = filePath.replace(/\\/g, '/');
                if (extname && extname != "") {
                    var ext = path_1.default.extname(filePath);
                    if (ext == extname) {
                        fileList.push(filePath);
                    }
                }
                else {
                    fileList.push(filePath);
                }
            }
        }
        return fileList;
    }
    /** 读取文件夹列表 */
    static ReadDirList(rootDir) {
        var fileList = [];
        if (!fs_1.default.existsSync(rootDir)) {
            return fileList;
        }
        var list = fs_1.default.readdirSync(rootDir);
        for (var name of list) {
            var filePath = path_1.default.join(rootDir, name);
            filePath = path_1.default.normalize(filePath);
            var stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                filePath = filePath.replace(/\\/g, '/');
                fileList.push(filePath);
            }
        }
        return fileList;
    }
    /** 遍历目录下文件 */
    static RecursiveFile(rootDir, fileList, exts) {
        if (!fs_1.default.existsSync(rootDir)) {
            return;
        }
        var list = fs_1.default.readdirSync(rootDir);
        var isCheckExt = exts && exts.length > 0;
        for (var name of list) {
            var filePath = path_1.default.join(rootDir, name);
            filePath = path_1.default.normalize(filePath);
            var stat = fs_1.default.statSync(filePath);
            if (stat.isFile()) {
                filePath = filePath.replace(/\\/g, '/');
                if (isCheckExt) {
                    var ext = path_1.default.extname(filePath).toLowerCase();
                    if (exts.includes(ext)) {
                        fileList.push(filePath);
                    }
                }
                else {
                    fileList.push(filePath);
                }
            }
            else if (stat.isDirectory()) {
                this.RecursiveFile(filePath, fileList, exts);
            }
        }
    }
}
exports.default = PathUtil;
