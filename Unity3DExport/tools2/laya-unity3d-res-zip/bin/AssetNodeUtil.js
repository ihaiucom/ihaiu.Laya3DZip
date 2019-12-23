"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AssetNode_1 = __importDefault(require("./AssetNode"));
const EditorUtility_1 = __importDefault(require("./EditorUtility"));
const path_1 = __importDefault(require("path"));
const AssetDatabase_1 = __importDefault(require("./AssetDatabase"));
const jszip_1 = __importDefault(require("jszip"));
const fs_1 = __importDefault(require("fs"));
const ConfigSetting_1 = __importDefault(require("./ConfigSetting"));
const Laya3D_1 = __importDefault(require("./Laya3D"));
class AssetNodeUtil {
    /** 生成所有节点 */
    static GenerateAllNode(resList, filterDirList, filterExts, imageExts, isSpriteTag = false, assetbundleExt = ".assetbundle") {
        var nodeDict = new Map();
        var spriteTagPackageDict = new Map();
        var spriteTagPackageList = [];
        // 生成所有节点
        var dependencies = AssetDatabase_1.default.GetDependencies(resList);
        var count = dependencies.length;
        for (var i = 0; i < count; i++) {
            if (i % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("生成所有节点", i + "/" + count, 1 * i / count);
            var path = dependencies[i];
            var isFilterDir = false;
            // filter dir
            for (var filterDir of filterDirList) {
                if (path.indexOf(filterDir) != -1) {
                    isFilterDir = true;
                    break;
                }
            }
            if (isFilterDir)
                continue;
            var ext = path_1.default.extname(path).toLowerCase();
            if (filterExts.indexOf(ext) != -1)
                continue;
            var node = new AssetNode_1.default();
            node.path = path;
            nodeDict.set(node.path, node);
        }
        if (this.isLog)
            AssetNode_1.default.PrintNodeDict(nodeDict, "nodeDict");
        if (this.isLog)
            AssetNode_1.default.PrintNodeTree(spriteTagPackageList, "图集");
        EditorUtility_1.default.ClearProgressBar();
        return nodeDict;
    }
    /** 生成每个节点依赖的节点 */
    static GenerateNodeDependencies(nodeDict) {
        var count = nodeDict.size;
        var index = 0;
        // 生成每个节点依赖的节点
        nodeDict.forEach((v, k) => {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("生成每个节点依赖的节点", index + "/" + count, 1 * (index++) / count);
            var node = v;
            var dependencies = AssetDatabase_1.default.GetDependencies(node.path);
            for (var i = 0; i < dependencies.length; i++) {
                var path = dependencies[i];
                if (path == node.path)
                    continue;
                var depNode = nodeDict.get(path);
                if (depNode) {
                    node.AddDependencie(depNode);
                }
            }
        });
        EditorUtility_1.default.ClearProgressBar();
        if (this.isLog)
            AssetNode_1.default.PrintNodeDict(nodeDict, "生成每个节点依赖的节点 nodeDict");
    }
    /** 生成要强制设置Root的节点 */
    static GenerateForcedRoots(nodeDict) {
        var count = nodeDict.size;
        var index = 0;
        var forceRootList = [];
        nodeDict.forEach((v, k) => {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("生成要强制设置Root的节点", index + "/" + count, 1 * (index++) / count);
            var path = v.path;
            forceRootList.push(path);
        });
        EditorUtility_1.default.ClearProgressBar();
        return forceRootList;
    }
    /** 强制设置某些节点为Root节点，删掉被依赖 */
    static ForcedSetRoots2(forceRootList) {
        for (var node of forceRootList) {
            node.ForcedSetRoot();
        }
    }
    /** 强制设置某些节点为Root节点，删掉被依赖 */
    static ForcedSetRoots(nodeDict, forceRootList) {
        var count = forceRootList.length;
        var index = 0;
        for (var path of forceRootList) {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("强制设置某些节点为Root节点，删掉被依赖", index + "/" + count, 1 * (index++) / count);
            if (nodeDict.has(path)) {
                var node = nodeDict.get(path);
                node.ForcedSetRoot();
            }
        }
        if (this.isLog)
            AssetNode_1.default.PrintNodeDict(nodeDict, "强制设置某些节点为Root节点，删掉被依赖");
        EditorUtility_1.default.ClearProgressBar();
    }
    /** 寻找入度为0的节点 */
    static FindRoots(nodeDict) {
        var count = nodeDict.size;
        var index = 0;
        // 寻找入度为0的节点
        var roots = [];
        nodeDict.forEach((v, k) => {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("寻找入度为0的节点", index + "/" + count, 1 * (index++) / count);
            var node = v;
            if (node.isRoot) {
                roots.push(node);
            }
        });
        if (this.isLog)
            AssetNode_1.default.PrintNodeTree(roots, "寻找入度为0的节点");
        EditorUtility_1.default.ClearProgressBar();
        return roots;
    }
    /** 移除父节点的依赖和自己依赖相同的节点 */
    static RemoveParentShare(roots) {
        var count = roots.length;
        var index = 0;
        // 移除父节点的依赖和自己依赖相同的节点
        for (var node of roots) {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("寻找入度为0的节点", index + "/" + count, 1 * (index++) / count);
            node.RemoveParentShare();
        }
        if (this.isLog)
            AssetNode_1.default.PrintNodeTree(roots, "移除父节点的依赖和自己依赖相同的节点");
        EditorUtility_1.default.ClearProgressBar();
    }
    /** 入度为1的节点自动打包到上一级节点 */
    static MergeParentCountOnce(roots) {
        var count = roots.length;
        var index = 0;
        // 入度为1的节点自动打包到上一级节点
        for (var node of roots) {
            if (index % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("入度为1的节点自动打包到上一级节点", index + "/" + count, 1 * (index++) / count);
            node.MergeParentCountOnce();
        }
        if (this.isLog)
            AssetNode_1.default.PrintNodeTree(roots, "入度为1的节点自动打包到上一级节点");
        EditorUtility_1.default.ClearProgressBar();
    }
    /** 过滤不需要打包的节点 */
    static FilterDotNeedNode(needDict, needRoots) {
        var count = needRoots.length;
        for (var i = 0; i < needRoots.length; i++) {
            if (i % this.progressNumOnce == 0)
                EditorUtility_1.default.DisplayProgressBar("过滤不需要打包的节点", i + "/" + count, 1 * i / count);
            needRoots[i].FilterDotNeedNode(needDict);
        }
        if (this.isLog)
            AssetNode_1.default.PrintNodeTree(needRoots, "过滤不需要打包的节点");
        EditorUtility_1.default.ClearProgressBar();
    }
    /** 生成需要设置AssetBundleName的节点 */
    static GenerateAssetBundleNodes(roots, resourceRoot) {
        for (var i = 0; i < roots.length; i++) {
            roots[i].GenerateAssetBundleNodesRoot(resourceRoot);
            roots[i].SetZip(roots[i]);
        }
    }
    /** 生成Zip */
    static GenerateZipMap(nodeMap) {
        let zipMap = new Map();
        nodeMap.forEach((node, nodePath) => {
            let zipNameList = [];
            node.zipNameMap.forEach((zipNodeRoot, zipName) => {
                if (node.type == AssetNode_1.default.TYPE_ZIP)
                    return;
                let list;
                if (zipMap.has(zipName)) {
                    list = zipMap.get(zipName);
                }
                else {
                    list = [];
                    zipMap.set(zipName, list);
                }
                list.push(node);
                zipNameList.push(zipName);
            });
            if (node.zipNameMap.size > 1) {
                console.warn(`资源被打入了多个Zip： ${nodePath};  ${zipNameList.join(',')}`);
            }
        });
        return zipMap;
    }
    static GetZipInfo(zipMap) {
        let str = "zipCount=" + zipMap.size + "\n\n";
        zipMap.forEach((list, zipName) => {
            let info = zipName + "， 数量=" + list.length + "\n";
            for (var item of list) {
                info += "   " + item.path + "\n";
            }
            info += "=====================\n\n";
            str += info;
        });
        return str;
    }
    /** 构建Zip */
    static BuildZip(zipMap) {
        if (!fs_1.default.existsSync(ConfigSetting_1.default.outDir)) {
            fs_1.default.mkdirSync(ConfigSetting_1.default.outDir, { recursive: true });
        }
        var resourceRoot = ConfigSetting_1.default.rootDir + "/";
        zipMap.forEach((list, zipName) => {
            var zip = new jszip_1.default();
            for (var item of list) {
                var encoding = 'utf-8';
                switch (item.type) {
                    case Laya3D_1.default.HIERARCHY:
                    case Laya3D_1.default.MATERIAL:
                        encoding = 'utf-8';
                        break;
                    case Laya3D_1.default.TEXTURE2D:
                    case Laya3D_1.default.TEXTURECUBE:
                        encoding = 'base64';
                        break;
                    default:
                        encoding = 'binary';
                        break;
                }
                var fileData = fs_1.default.readFileSync(item.path, { encoding: encoding });
                var zipFilePath = item.path.replace(resourceRoot, "");
                var options;
                switch (item.type) {
                    case Laya3D_1.default.HIERARCHY:
                    case Laya3D_1.default.MATERIAL:
                        options = undefined;
                        break;
                    case Laya3D_1.default.TEXTURE2D:
                    case Laya3D_1.default.TEXTURECUBE:
                        options = { base64: true };
                        break;
                    default:
                        options = { binary: true };
                        break;
                }
                zip.file(zipFilePath, fileData, options);
            }
            zip.generateAsync({
                type: "nodebuffer",
                // compression: "DEFLATE",
                comment: "http://blog.ihaiu.com  ihaiu.laya-unity3d-res-zip  ",
            })
                .then((content) => {
                var zipPath = ConfigSetting_1.default.outDir + "/" + zipName + ".zip";
                fs_1.default.writeFileSync(zipPath, content);
            });
        });
    }
}
AssetNodeUtil.isLog = false;
AssetNodeUtil.progressNumOnce = 30;
AssetNodeUtil.progressNumOnceLit = 10;
exports.default = AssetNodeUtil;
