"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AssetNodeUtil_1 = __importDefault(require("./AssetNodeUtil"));
class AssetBundleEditor {
    static ClearAssetBundleNames() {
    }
    static SetNames() {
        var list = [];
        // PathUtil.RecursiveFile(resourcesPaths, list, this.exts);
        if (list.length == 0)
            return;
        // 生成所有节点
        var nodeDict = AssetNodeUtil_1.default.GenerateAllNode(list, this.filterDirList, this.filterExts, this.imageExts, this.isSpriteTag, this.assetbundleExt);
        // 生成每个节点依赖的节点
        AssetNodeUtil_1.default.GenerateNodeDependencies(nodeDict);
        // 寻找入度为0的节点
        var roots = AssetNodeUtil_1.default.FindRoots(nodeDict);
        // 移除父节点的依赖和自己依赖相同的节点
        AssetNodeUtil_1.default.RemoveParentShare(roots);
        // 强制设置某些节点为Root节点，删掉被依赖
        AssetNodeUtil_1.default.ForcedSetRoots(nodeDict, list);
        // 寻找入度为0的节点
        roots = AssetNodeUtil_1.default.FindRoots(nodeDict);
        // 入度为1的节点自动打包到上一级节点
        AssetNodeUtil_1.default.MergeParentCountOnce(roots);
        // 生成需要设置AssetBundleName的节点
        // var assetDict: Map<string, AssetNode>  = AssetNodeUtil.GenerateAssetBundleNodes(roots);
        // 设置AssetBundleNames
        // AssetNodeUtil.SetAssetBundleNames(assetDict, this.resourceRoot, this.assetbundleExt);
    }
}
AssetBundleEditor.resourceRoot = "";
AssetBundleEditor.resourcesPaths = [];
AssetBundleEditor.assetbundleExt = ".zip";
AssetBundleEditor.filterDirList = [];
AssetBundleEditor.filterExts = [".cs", ".js"];
AssetBundleEditor.imageExts = [".png", ".jpg", ".jpeg", ".bmp", "gif", ".tga", ".tiff", ".psd"];
AssetBundleEditor.isSpriteTag = true;
AssetBundleEditor.exts = [".prefab", ".png", ".jpg", ".jpeg", ".bmp", "gif", ".tga", ".tiff", ".psd", ".mat", ".mp3", ".wav"];
exports.default = AssetBundleEditor;
