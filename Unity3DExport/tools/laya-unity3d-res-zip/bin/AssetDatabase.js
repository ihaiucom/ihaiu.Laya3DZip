"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PathUtil_1 = __importDefault(require("./PathUtil"));
const ConfigSetting_1 = __importDefault(require("./ConfigSetting"));
const AssetNode_1 = __importDefault(require("./AssetNode"));
const Laya3D_1 = __importDefault(require("./Laya3D"));
const URL_1 = __importDefault(require("./URL"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AssetDatabase {
    static LoadAllPrefab() {
        var list = PathUtil_1.default.ReadFileList(ConfigSetting_1.default.rootDir, ".lh");
        for (var filePath of list) {
            var node = new AssetNode_1.default();
            node.path = filePath;
            node.type = Laya3D_1.default.HIERARCHY;
            this.map.set(node.path, node);
            this.prefabList.push(node);
            this.ReadPrefabDependentFiles(filePath, node);
        }
    }
    static ReadPrefabDependentFiles(lhFilePath, parentNode) {
        lhFilePath = lhFilePath.replace(/\\/g, '/');
        var text = fs_1.default.readFileSync(lhFilePath, { encoding: 'utf-8' });
        text = text.trim();
        if (text == "")
            return;
        var lhData = JSON.parse(text);
        var url = lhFilePath;
        var urlVersion = "";
        var hierarchyBasePath = URL_1.default.getPath(url);
        var firstLevUrls = [];
        var secondLevUrls = [];
        var thirdLevUrls = [];
        var forthLevUrls = [];
        var subUrls = [];
        Laya3D_1.default._getSprite3DHierarchyInnerUrls(lhData.data, firstLevUrls, secondLevUrls, thirdLevUrls, forthLevUrls, subUrls, urlVersion, hierarchyBasePath);
        var materials = new Map();
        this.AddUrlItemList(firstLevUrls, parentNode, materials);
        this.AddUrlItemList(secondLevUrls, parentNode, materials);
        this.AddUrlItemList(thirdLevUrls, parentNode, materials);
        this.AddUrlItemList(forthLevUrls, parentNode, materials);
        for (var subUrl of subUrls) {
            if (this.map.has(subUrl)) {
                var nodeChild = this.map.get(subUrl);
                parentNode.AddDependencie(nodeChild);
                continue;
            }
            var node = new AssetNode_1.default();
            node.path = subUrl;
            node.type = this.GetType(subUrl);
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);
            if (node.type == Laya3D_1.default.MATERIAL) {
                if (!materials.has(node.path)) {
                    materials.set(node.path, node);
                }
            }
        }
        // 加载材质球
        materials.forEach((v, k) => {
            this.ReadMaterialDependentFiles(v.path, v);
        });
    }
    static ReadMaterialDependentFiles(materialPath, parentNode) {
        materialPath = materialPath.replace(/\\/g, '/');
        var text = fs_1.default.readFileSync(materialPath, { encoding: 'utf-8' });
        text = text.trim();
        if (text == "")
            return;
        var data = JSON.parse(text);
        var forthLevUrls = [];
        var subUrls = [];
        Laya3D_1.default._onMaterilLmatLoaded(materialPath, data, forthLevUrls, subUrls);
        for (var subUrl of subUrls) {
            if (this.map.has(subUrl)) {
                var nodeChild = this.map.get(subUrl);
                parentNode.AddDependencie(nodeChild);
                continue;
            }
            var node = new AssetNode_1.default();
            node.path = subUrl;
            node.type = Laya3D_1.default.TEXTURE2D;
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);
        }
    }
    static AddUrlItemList(list, parentNode, materials) {
        for (var item of list) {
            if (this.map.has(item.url)) {
                var nodeChild = this.map.get(item.url);
                parentNode.AddDependencie(nodeChild);
                continue;
            }
            var node = new AssetNode_1.default();
            node.path = item.url;
            node.type = this.GetType(item.url, item.type);
            this.map.set(node.path, node);
            parentNode.AddDependencie(node);
            if (node.type == Laya3D_1.default.MATERIAL) {
                if (!materials.has(node.path)) {
                    materials.set(node.path, node);
                }
            }
        }
    }
    static GetType(url, type = "") {
        var ext = path_1.default.extname(url);
        switch (ext) {
            case ".lh":
                return Laya3D_1.default.HIERARCHY;
            case ".lmat":
                return Laya3D_1.default.MATERIAL;
            case ".lm":
                return Laya3D_1.default.MESH;
            case ".lani":
                return Laya3D_1.default.ANIMATIONCLIP;
        }
        return type;
    }
    static GetDependencies(path) {
        return [];
    }
    /** 打包策略--强制将Unity内置资源打包到一起， 并且清理依赖 */
    static MergeZipUnityBuiltin() {
        var node = new AssetNode_1.default();
        node.path = "UnityBuiltin";
        node.type = AssetNode_1.default.TYPE_ZIP;
        this.map.set(node.path, node);
        var beMergeNodeMap = this.prefabBeMergeMap;
        var list = PathUtil_1.default.ReadFileList(ConfigSetting_1.default.rootDir + "/Library", null);
        for (var filePath of list) {
            var item = this.map.get(filePath);
            if (item) {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }
        var list = PathUtil_1.default.ReadFileList(ConfigSetting_1.default.rootDir + "/Resources", null);
        for (var filePath of list) {
            var item = this.map.get(filePath);
            if (item) {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }
    }
    /** 打包策略--特效预设合并 */
    static MergeZipEffectPrefab() {
        var effectZipMap = new Map();
        var beMergeNodeMap = this.prefabBeMergeMap;
        for (var item of this.prefabList) {
            var name = path_1.default.basename(item.path);
            if (name.startsWith("Effect_")) {
                if (name.indexOf("__") != -1) {
                    var zipName = name.split("__")[0];
                    var zipFiles;
                    if (effectZipMap.has(zipName)) {
                        zipFiles = effectZipMap.get(zipName);
                    }
                    else {
                        zipFiles = [];
                        effectZipMap.set(zipName, zipFiles);
                    }
                    zipFiles.push(item);
                }
            }
        }
        effectZipMap.forEach((list, zipName) => {
            if (list.length > 0) {
                var node = new AssetNode_1.default();
                node.path = zipName;
                node.type = AssetNode_1.default.TYPE_ZIP;
                for (var item of list) {
                    beMergeNodeMap.set(item.path, item);
                    node.AddAsset(item);
                }
                this.map.set(node.path, node);
            }
        });
    }
    /** 打包策略--配置的目录，打包Zip */
    static MergeZipByDirConfig() {
        for (var dir of ConfigSetting_1.default.mergeZipDir) {
            this.MergeZipByDir(path_1.default.join(ConfigSetting_1.default.rootDir, dir), ConfigSetting_1.default.rootDir);
        }
        for (var dir of ConfigSetting_1.default.mergeZipDirFolder) {
            this.MergeZipByDirList(path_1.default.join(ConfigSetting_1.default.rootDir, dir), ConfigSetting_1.default.rootDir);
        }
    }
    /** 打包策略--该目录下的目录单独打一个包 */
    static MergeZipByDirList(dirPath, resourceRoot) {
        var list = PathUtil_1.default.ReadDirList(dirPath);
        for (var path of list) {
            this.MergeZipByDir(path, resourceRoot);
        }
    }
    /** 打包策略--该目录下的资源单独打一个包 */
    static MergeZipByDir(dirPath, resourceRoot) {
        var zipName = dirPath.replace(resourceRoot + "/", "");
        zipName = zipName.replace(/\//g, '___');
        var node = new AssetNode_1.default();
        node.path = zipName;
        node.type = AssetNode_1.default.TYPE_ZIP;
        var fileList = [];
        PathUtil_1.default.RecursiveFile(dirPath, fileList);
        var beMergeNodeMap = this.prefabBeMergeMap;
        for (var filePath of fileList) {
            var item = this.map.get(filePath);
            if (item) {
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddDependencie(item);
            }
        }
        if (node.childCount > 0 || node.assetCount > 0) {
            this.map.set(node.path, node);
        }
    }
    /** 打包策略--检测被多个Zip引用的， 将这些合并到一起 */
    static MergeZipCheckMultipleZip() {
        var beMergeNodeMap = this.prefabBeMergeMap;
        let zipMap = new Map();
        this.map.forEach((node, nodePath) => {
            if (node.zipNameMap.size > 1) {
                if (beMergeNodeMap.has(node.path)) {
                    console.error("理论上不应该出现被多个Zip引用：", node.path);
                    return;
                }
                let zipNameList = [];
                node.zipNameMap.forEach((zipNodeRoot, zipName) => {
                    zipNameList.push(zipName);
                });
                zipNameList = zipNameList.sort();
                var zipName = zipNameList.join("____");
                var zipNodeList;
                if (zipMap.has(zipName)) {
                    zipNodeList = zipMap.get(zipName);
                }
                else {
                    zipNodeList = [];
                    zipMap.set(zipName, zipNodeList);
                }
                zipNodeList.push(node);
            }
        });
        zipMap.forEach((nodeList, zipName) => {
            if (nodeList.length < ConfigSetting_1.default.mergeMultipleZipNodeMinNum) {
                return;
            }
            var node = new AssetNode_1.default();
            node.path = zipName;
            node.type = AssetNode_1.default.TYPE_ZIP;
            node.assetBundleName = zipName;
            node.zipNameMap.set(zipName, node);
            for (var item of nodeList) {
                item.zipNameMap.clear();
                item.zipNameMap.set(zipName, node);
                beMergeNodeMap.set(item.path, item);
                item.ClearDependencie();
                node.AddAsset(item);
            }
            this.map.set(node.path, node);
        });
    }
    /** 打包策略--检测被多个Zip引用的，并且在制定目录下， 将这些合并到一起 */
    static MergeZipCheckMultipleZipByDirConfig() {
        let beMergeNodeMap = this.prefabBeMergeMap;
        let list = [];
        this.map.forEach((node, nodePath) => {
            if (node.zipNameMap.size > 1) {
                if (beMergeNodeMap.has(node.path)) {
                    console.error("理论上不应该出现被多个Zip引用：", node.path);
                    return;
                }
                list.push(node);
            }
        });
        for (var dir of ConfigSetting_1.default.mergeOtherCommonDir) {
            var dirPath = ConfigSetting_1.default.rootDir + "/" + dir;
            dirPath = dirPath.replace(/\\/g, '/');
            var dirNodeList = [];
            for (var i = list.length - 1; i >= 0; i--) {
                var item = list[i];
                if (item.path.startsWith(dirPath)) {
                    list.splice(i, 1);
                    dirNodeList.push(item);
                }
            }
            if (dirNodeList.length > 0) {
                var zipName = AssetNode_1.default.GetZipName(dirPath, ConfigSetting_1.default.rootDir);
                var node = new AssetNode_1.default();
                node.path = zipName;
                node.type = AssetNode_1.default.TYPE_ZIP;
                node.assetBundleName = zipName;
                node.zipNameMap.set(zipName, node);
                for (var item of dirNodeList) {
                    item.zipNameMap.clear();
                    item.zipNameMap.set(zipName, node);
                    beMergeNodeMap.set(item.path, item);
                    item.ClearDependencie();
                    node.AddAsset(item);
                }
                this.map.set(node.path, node);
            }
        }
    }
}
AssetDatabase.map = new Map();
AssetDatabase.prefabList = [];
AssetDatabase.prefabBeMergeMap = new Map();
exports.default = AssetDatabase;
