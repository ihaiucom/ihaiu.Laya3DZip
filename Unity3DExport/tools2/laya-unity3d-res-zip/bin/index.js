#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AssetDatabase_1 = __importDefault(require("./AssetDatabase"));
const AssetNode_1 = __importDefault(require("./AssetNode"));
const AssetNodeUtil_1 = __importDefault(require("./AssetNodeUtil"));
const fs_1 = __importDefault(require("fs"));
const ConfigSetting_1 = __importDefault(require("./ConfigSetting"));
const AssetManifest_1 = __importDefault(require("./AssetManifest"));
function main() {
    var manifest = new AssetManifest_1.default();
    // 生成所有节点
    AssetDatabase_1.default.LoadAllPrefab();
    manifest.GenerateAssets(AssetDatabase_1.default.map, AssetDatabase_1.default.prefabList, ConfigSetting_1.default.rootDir);
    fs_1.default.writeFileSync("log_root_src_tree.txt", AssetNode_1.default.GetNodeTree(AssetDatabase_1.default.prefabList));
    // 打包策略--特效预设合并
    AssetDatabase_1.default.MergeZipEffectPrefab();
    // 打包策略--强制将Unity内置资源打包到一起， 并且清理依赖
    AssetDatabase_1.default.MergeZipUnityBuiltin();
    // 打包策略--配置的目录，打包Zip
    AssetDatabase_1.default.MergeZipByDirConfig();
    var map = AssetDatabase_1.default.map;
    // 寻找入度为0的节点
    var roots = AssetNodeUtil_1.default.FindRoots(map);
    // 移除父节点的依赖和自己依赖相同的节点
    AssetNodeUtil_1.default.RemoveParentShare(roots);
    // 入度为1的节点自动打包到上一级节点
    AssetNodeUtil_1.default.MergeParentCountOnce(roots);
    // 生成需要设置AssetBundleName的节点
    AssetNodeUtil_1.default.GenerateAssetBundleNodes(roots, ConfigSetting_1.default.rootDir);
    // 打包策略--检测被多个Zip引用的， 将这些合并到一起
    AssetDatabase_1.default.MergeZipCheckMultipleZip();
    // 打包策略--检测被多个Zip引用的，并且在制定目录下， 将这些合并到一起
    AssetDatabase_1.default.MergeZipCheckMultipleZipByDirConfig();
    roots = AssetNodeUtil_1.default.FindRoots(map);
    // 生成Zip Map
    var zipMap = AssetNodeUtil_1.default.GenerateZipMap(map);
    manifest.GenerateZips(zipMap);
    fs_1.default.writeFileSync("log_root_tree.txt", AssetNode_1.default.GetNodeTree(roots));
    fs_1.default.writeFileSync("log_zip.txt", AssetNodeUtil_1.default.GetZipInfo(zipMap));
    if (!fs_1.default.existsSync(ConfigSetting_1.default.outDir)) {
        fs_1.default.mkdirSync(ConfigSetting_1.default.outDir, { recursive: true });
    }
    AssetNodeUtil_1.default.BuildZip(zipMap);
    manifest.Save(ConfigSetting_1.default.outDir + "/manifest.json");
}
main();
