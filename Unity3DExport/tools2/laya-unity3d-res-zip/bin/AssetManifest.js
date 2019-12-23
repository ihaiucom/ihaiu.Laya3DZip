"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ConfigSetting_1 = __importDefault(require("./ConfigSetting"));
class AssetManifest {
    constructor() {
        /** 资源列表 */
        this.assetId2Name = {};
        /** zip列表 */
        this.zipId2Name = {};
        /** Zip资源列表 */
        this.zipAssets = {};
        /** 资源依赖列表 */
        this.assetsDependencie = {};
        /** 预设依赖列表 */
        this.prefabDependencie = {};
    }
    /** 生成资源列表 */
    GenerateAssets(map, prefabList, resourceRoot) {
        map.forEach((item, filePath) => {
            var filePath = filePath.replace(resourceRoot + "/", "");
            this.assetId2Name[item.uid] = filePath;
            if (ConfigSetting_1.default.manifest.assetsDependencie) {
                var assetIds = this.assetsDependencie[item.uid] = [];
                item.GetDependencieUidList(assetIds, true);
            }
        });
        if (ConfigSetting_1.default.manifest.prefabDependencie) {
            for (let item of prefabList) {
                var assetIds = this.prefabDependencie[item.uid] = [];
                item.GetDependencieUidList(assetIds, true);
            }
        }
    }
    GenerateZips(zipMap) {
        let UID = 1;
        zipMap.forEach((list, zipName) => {
            let uid = UID++;
            this.zipId2Name[uid] = zipName;
            var assetIds = this.zipAssets[uid] = [];
            for (let item of list) {
                assetIds.push(item.uid);
            }
        });
    }
    ToJson() {
        var json = JSON.stringify(this, null, 4);
        return json;
    }
    Save(filePath) {
        fs_1.default.writeFileSync(filePath, this.ToJson());
    }
}
exports.default = AssetManifest;
