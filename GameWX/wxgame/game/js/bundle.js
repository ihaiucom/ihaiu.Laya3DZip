(function () {
  'use strict';

  class GameConfig {
    constructor() { }
    static get isMobile() {
      var u = window.navigator.userAgent;
      return u.indexOf("Mobile") > -1;
    }
    static get scaleMode() {
      return this.isMobile ? Laya.Stage.SCALE_FIXED_AUTO : Laya.Stage.SCALE_FULL;
    }
    static get scaleX() {
      return Laya.stage.width / this.width;
    }
    static get scaleY() {
      return Laya.stage.height / this.height;
    }
    static init() {
      var reg = Laya.ClassUtils.regClass;
    }
  }
  GameConfig.width = 1334;
  GameConfig.height = 750;
  GameConfig.screenMode = "none";
  GameConfig.alignV = Laya.Stage.ALIGN_TOP;
  GameConfig.alignH = Laya.Stage.ALIGN_CENTER;
  GameConfig.startScene = "test/TestScene.scene";
  GameConfig.sceneRoot = "";
  GameConfig.debug = false;
  GameConfig.stat = false;
  GameConfig.physicsDebug = false;
  GameConfig.exportSceneToJson = true;
  GameConfig.isAntialias = true;
  GameConfig.init();

  var EnumZipAssetDataType;
  (function (EnumZipAssetDataType) {
    EnumZipAssetDataType["base64"] = "base64";
    EnumZipAssetDataType["string"] = "string";
    EnumZipAssetDataType["arraybuffer"] = "arraybuffer";
  })(EnumZipAssetDataType || (EnumZipAssetDataType = {}));

  class AssetManifest {
    constructor() {
      this.assetId2Name = {};
      this.zipId2Name = {};
      this.zipAssets = {};
      this.assetsDependencie = {};
      this.prefabDependencie = {};
      this.srcRootPath = "";
      this.zipRootPath = "";
      this.zipExt = ".zip";
      this.assetName2Id = {};
      this.assetId2ZipId = {};
      this.assetId2DependencieZipNames = {};
      this.assetName2DependencieZipNames = {};
      this.assetId2DependencieZipPaths = {};
      this.assetName2DependencieZipPaths = {};
      this.assetName2DependencieAssets = {};
      this.zipName2DependencieAssets = {};
      this.tmpMap = new Map();
      this.tmpMap2 = new Map();
    }
    SetJson(json) {
      window['assetManifest'] = this;
      this.assetId2Name = json.assetId2Name;
      this.zipId2Name = json.zipId2Name;
      this.zipAssets = json.zipAssets;
      this.assetsDependencie = json.assetsDependencie;
      this.prefabDependencie = json.prefabDependencie;
      var hasAssetsDependencie = false;
      if (this.assetsDependencie) {
        for (let assetId in this.assetsDependencie) {
          hasAssetsDependencie = true;
          break;
        }
      }
      if (!hasAssetsDependencie) {
        this.assetsDependencie = this.prefabDependencie;
      }
      for (let assetId in this.assetId2Name) {
        let assetName = this.assetId2Name[assetId];
        this.assetName2Id[assetName] = assetId;
      }
      for (let zipId in this.zipAssets) {
        let assetIdList = this.zipAssets[zipId];
        for (let id of assetIdList) {
          this.assetId2ZipId[id] = zipId;
        }
      }
      this.InitAssetDependencieZipPaths();
      this.InitDebug();
    }
    InitAssetDependencieZipPaths() {
      for (let assetId in this.assetsDependencie) {
        this.GetAssetDependencieZipPathList(parseInt(assetId));
      }
    }
    InitDebug() {
      for (let assetId in this.assetsDependencie) {
        var assetName = this.GetAssetName(assetId);
        var assetNames = this.assetName2DependencieAssets[assetName] = [];
        var dependenceAssetIdList = this.assetsDependencie[assetId];
        for (let itemAssetId of dependenceAssetIdList) {
          assetNames.push(this.GetAssetName(itemAssetId));
        }
      }
      for (let zipId in this.zipAssets) {
        var zipName = this.GetZipName(zipId);
        var assetNames = this.zipName2DependencieAssets[zipName] = [];
        var dependenceAssetIdList = this.zipAssets[zipId];
        for (let itemAssetId of dependenceAssetIdList) {
          assetNames.push(this.GetAssetName(itemAssetId));
        }
      }
    }
    GetAssetId(assetName) {
      return this.assetName2Id[assetName];
    }
    GetAssetName(assetId) {
      return this.assetId2Name[assetId];
    }
    GetAssetNameByPath(assetPath) {
      var assetName = assetPath.replace(this.srcRootPath, "");
      return assetName;
    }
    GetAssetZipId(assetId) {
      return this.assetId2ZipId[assetId];
    }
    GetAssetZipName(assetId) {
      let zipId = this.GetAssetZipId(assetId);
      return this.GetZipName(zipId);
    }
    GetAssetZipPath(asset) {
      let assetId = this.ToAssetId(asset);
      let zipId = this.GetAssetZipId(assetId);
      let zipName = this.GetZipName(zipId);
      if (!zipName) {
        console.error(`没找到资源的Zip asset=${asset} `);
      }
      let zipPath = this.GetZipPath(zipName);
      return zipPath;
    }
    GetAssetZipPathByPath(assetPath) {
      let assetName = this.GetAssetNameByPath(assetPath);
      let zipPath = this.GetAssetZipPath(assetName);
      return zipPath;
    }
    GetZipPath(zipName) {
      return this.zipRootPath + zipName + this.zipExt;
    }
    GetZipName(zipId) {
      return this.zipId2Name[zipId];
    }
    ToAssetId(asset) {
      let assetId;
      if (typeof asset == "string") {
        assetId = this.GetAssetId(asset);
      }
      else {
        assetId = asset;
      }
      return assetId;
    }
    GetAssetDependencieZipNameList(asset) {
      let assetId = this.ToAssetId(asset);
      if (this.assetId2DependencieZipNames[assetId]) {
        return this.assetId2DependencieZipNames[assetId];
      }
      let zipNames = [];
      if (!assetId) {
        console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetId 不存在 assetId=${assetId},  asset=${asset}`);
        return zipNames;
      }
      let assetIdList = this.assetsDependencie[assetId];
      if (!assetIdList) {
        console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetIdList 不存在,  asset=${this.GetAssetName(assetId)}`);
        return zipNames;
      }
      var tmpMap = this.tmpMap;
      tmpMap.clear();
      for (let assetId of assetIdList) {
        let zipName = this.GetAssetZipName(assetId);
        if (zipName) {
          if (!tmpMap.has(zipName)) {
            zipNames.push(zipName);
            tmpMap.set(zipName, true);
          }
        }
      }
      tmpMap.clear();
      var assetName = this.GetAssetName(assetId);
      this.assetId2DependencieZipNames[assetId] = zipNames;
      this.assetName2DependencieZipNames[assetName] = zipNames;
      return zipNames;
    }
    GetAssetDependencieZipPathList(asset) {
      let assetId = this.ToAssetId(asset);
      if (this.assetId2DependencieZipPaths[assetId]) {
        return this.assetId2DependencieZipPaths[assetId];
      }
      let zipPaths = [];
      let zipNames = this.GetAssetDependencieZipNameList(assetId);
      for (let zipName of zipNames) {
        let zipPath = this.GetZipPath(zipName);
        zipPaths.push(zipPath);
      }
      var assetName = this.GetAssetName(assetId);
      this.assetId2DependencieZipPaths[assetId] = zipPaths;
      this.assetName2DependencieZipPaths[assetName] = zipPaths;
      return zipPaths;
    }
    GetAssetListDependencieZipPathList(assetList) {
      let zipPaths = [];
      if (assetList.length == 0) {
        return zipPaths;
      }
      var tmpMap = this.tmpMap;
      tmpMap.clear();
      for (let asset of assetList) {
        let pathList = this.GetAssetDependencieZipPathList(asset);
        for (let path of pathList) {
          if (!tmpMap.has(path)) {
            zipPaths.push(path);
            tmpMap.set(path, true);
          }
        }
      }
      tmpMap.clear();
      return zipPaths;
    }
    GetEnumZipAssetDataType(assetPath) {
      let type = Laya.Loader.getTypeFromUrl(assetPath);
      var extension = Laya.Utils.getFileExtension(assetPath);
      let t;
      switch (type) {
        case "image":
          t = EnumZipAssetDataType.base64;
          break;
        default:
          switch (extension) {
            case "lmat":
            case "lh":
              t = EnumZipAssetDataType.string;
              break;
            default:
              t = EnumZipAssetDataType.arraybuffer;
              break;
          }
          break;
      }
      return t;
    }
    static get Instance() {
      if (!AssetManifest._Instance) {
        AssetManifest._Instance = new AssetManifest();
      }
      return AssetManifest._Instance;
    }
    static async InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt) {
      AssetManifest._Instance = await this.LoadAsync(manifestPath, srcRootPath, zipRootPath, zipExt);
      return AssetManifest._Instance;
    }
    static async LoadAsync(path, srcRootPath, zipRootPath, zipExt) {
      return new Promise((resolve) => {
        Laya.loader.load(path, Laya.Handler.create(null, (res) => {
          let manifest = new AssetManifest();
          if (srcRootPath) {
            manifest.srcRootPath = srcRootPath;
          }
          if (zipRootPath) {
            manifest.zipRootPath = zipRootPath;
          }
          if (zipExt) {
            manifest.zipExt = zipExt;
          }
          manifest.SetJson(res);
          resolve(manifest);
        }), null, Laya.Loader.JSON);
      });
    }
  }
  window['AssetManifest'] = AssetManifest;

  class ZipLoader {
    static InitCode() {
      new ZipLoader().InitCode();
    }
    InitCode() {
      var Loader = Laya.Loader;
      Loader.prototype.src_loadHttpRequestWhat = Loader.prototype._loadHttpRequestWhat;
      Loader.prototype._loadHttpRequestWhat = this._loadHttpRequestWhat;
      Loader.prototype.src_loadResourceFilter = Loader.prototype._loadResourceFilter;
      Loader.prototype._loadResourceFilter = this._loadResourceFilter;
      Loader.prototype.src_loadHttpRequest = Loader.prototype._loadHttpRequest;
      Loader.prototype._loadHttpRequest = this._loadHttpRequest;
      Loader.prototype.src_loadHtmlImage = Loader.prototype._loadHtmlImage;
      Loader.prototype._loadHtmlImage = this._loadHtmlImage;
    }
    onProgress(value) {
    }
    onError(message) {
    }
    onLoaded(data = null) {
    }
    _loadResource(type, url) {
    }
    src_loadHttpRequestWhat(url, contentType) {
    }
    _loadHttpRequestWhat(url, contentType) {
      var ext = Laya.Utils.getFileExtension(url);
      if (ext == ZipManager.Instance.zipExtName) {
        this.src_loadHttpRequestWhat(url, contentType);
        return;
      }
      this._loadHttpRequest(url, contentType, this, this.onLoaded, this, this.onProgress, this, this.onError);
    }
    src_loadResourceFilter(type, url) {
    }
    _loadResourceFilter(type, url) {
      var ext = Laya.Utils.getFileExtension(url);
      if (ext == ZipManager.Instance.zipExtName) {
        this.src_loadResourceFilter(type, url);
        return;
      }
      this._loadResource(type, url);
    }
    src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
    }
    _loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
      var ext = Laya.Utils.getFileExtension(url);
      if (ext == "zip") {
        this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
        return;
      }
      var data = ZipManager.Instance.GetAssetData(url);
      if (data) {
        console.log("_loadHttpRequest ", url);
        onLoad.call(onLoadCaller, data);
        return;
      }
      else {
        console.log("src_loadHttpRequest ", url);
        this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
      }
    }
    src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
    }
    _loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
      var data = ZipManager.Instance.GetAssetData(url);
      if (data) {
        console.log("_loadHtmlImage ", url);
        this.src_loadHtmlImage(data, onLoadCaller, onLoad, onErrorCaller, onError);
      }
      else {
        console.log("src_loadHtmlImage ", url);
        this.src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError);
      }
    }
  }

  class JsZipAsync {
    static loadPath(path, type, callbacker, onComponent) {
      Laya.loader.load(path, Laya.Handler.create(null, (res) => {
        if (!res) {
          console.error("没加载到资源:", path);
          if (onComponent) {
            onComponent.call(callbacker, null);
          }
          return;
        }
        JSZip.loadAsync(res).then((zip) => {
          if (onComponent) {
            onComponent.call(callbacker, zip);
          }
        }).catch((error) => {
          console.error(error);
          if (onComponent) {
            onComponent.call(callbacker, null);
          }
        });
      }), null, type);
    }
    static async loadPathAsync(path, type) {
      return new Promise((resolve) => {
        Laya.loader.load(path, Laya.Handler.create(null, (res) => {
          JSZip.loadAsync(res).then((zip) => {
            resolve(zip);
          }).catch((error) => {
            console.error(error);
            resolve();
          });
        }), null, type);
      });
    }
    static async readAsync(zip, path, type) {
      return new Promise((resolve) => {
        zip.file(path).async(type).then((data) => {
          resolve(data);
        }).catch((error) => {
          console.error(error);
          resolve();
        });
      });
    }
    static read(zip, path, type, callbacker, onComponent) {
      zip.file(path).async(type).then((data) => {
        if (onComponent) {
          onComponent.call(callbacker, data);
        }
      }).catch((error) => {
        console.error(error);
        if (onComponent) {
          onComponent.call(callbacker, null);
        }
      });
    }
  }

  class ZipManager {
    constructor() {
      this.zipExt = ".zip";
      this.zipExtName = "zip";
      this.zipMap = new Map();
      this.assetMap = new Map();
      this.loadImageCount = 0;
      this.imageCount = 0;
    }
    static get Instance() {
      if (!ZipManager._Instance) {
        ZipManager._Instance = new ZipManager();
        window['zipManager'] = ZipManager._Instance;
      }
      return ZipManager._Instance;
    }
    async InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt) {
      if (zipExt) {
        this.zipExt = zipExt;
        this.zipExtName = zipExt.replace('.', '');
      }
      await AssetManifest.InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt);
      this.manifest = AssetManifest.Instance;
      this.InitCode();
    }
    InitCode() {
      ZipLoader.InitCode();
    }
    AssetUrlToPath(url) {
      return url.replace(Laya.URL.basePath, "");
    }
    AssetNameToPath(assetName) {
      return this.manifest.srcRootPath + assetName;
    }
    async GetZipAsync(zipPath) {
      var zip;
      if (this.zipMap.has(zipPath)) {
        zip = this.zipMap.get(zipPath);
      }
      else {
        zip = await JsZipAsync.loadPathAsync(zipPath, Laya.Loader.BUFFER);
        this.zipMap.set(zipPath, zip);
      }
      return zip;
    }
    GetAssetData(url) {
      var assetPath = this.AssetUrlToPath(url);
      var data;
      let type = this.manifest.GetEnumZipAssetDataType(assetPath);
      if (type == EnumZipAssetDataType.base64) {
        this.loadImageCount++;
        console.log(this.loadImageCount, assetPath);
      }
      if (this.assetMap.has(assetPath)) {
        data = this.assetMap.get(assetPath);
      }
      return data;
    }
    async GetAssetDataAsync(url) {
      var assetPath = this.AssetUrlToPath(url);
      var data;
      let type = this.manifest.GetEnumZipAssetDataType(assetPath);
      if (type == EnumZipAssetDataType.base64) {
        this.loadImageCount++;
        console.log(this.loadImageCount, assetPath);
      }
      if (this.assetMap.has(assetPath)) {
        data = this.assetMap.get(assetPath);
      }
      else {
        data = await this.LoadAssetData(assetPath);
        this.assetMap.set(assetPath, data);
      }
      return data;
    }
    async LoadAssetData(assetPath) {
      let assetName = this.manifest.GetAssetNameByPath(assetPath);
      let zipPath = this.manifest.GetAssetZipPath(assetName);
      let type = this.manifest.GetEnumZipAssetDataType(assetName);
      let zip = await this.GetZipAsync(zipPath);
      let data = await JsZipAsync.readAsync(zip, assetName, type);
      switch (type) {
        case EnumZipAssetDataType.string:
          data = JSON.parse(data);
          break;
        case EnumZipAssetDataType.base64:
          data = "data:image/png;base64," + data;
          this.imageCount++;
          break;
      }
      return data;
    }
    async LoadAssetZipListAsync(assetUrlList, callbacker, onProgerss) {
      let assetNameList = [];
      for (let url of assetUrlList) {
        let assetPath = this.AssetUrlToPath(url);
        let assetName = this.manifest.GetAssetNameByPath(assetPath);
        assetNameList.push(assetName);
      }
      var progerssFun = (i, len, path) => {
        if (onProgerss) {
          if (callbacker) {
            onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
          }
          else {
            onProgerss(i, len, Math.ceil(i / len * 100), path);
          }
        }
      };
      let zipPathList = this.manifest.GetAssetListDependencieZipPathList(assetNameList);
      return new Promise((resolve) => {
        progerssFun(0, zipPathList.length, "");
        var loadNum = 0;
        var loadTotal = zipPathList.length;
        for (let i = 0, len = zipPathList.length; i < len; i++) {
          let zipPath = zipPathList[i];
          if (this.zipMap.has(zipPath)) {
            continue;
          }
          else {
            JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, this, (zip) => {
              this.zipMap.set(zipPath, zip);
              loadNum++;
              progerssFun(loadNum, loadTotal, zipPath);
              if (loadNum >= loadTotal) {
                resolve();
              }
            });
          }
        }
      });
    }
    async ReadAllZipAsync(callbacker, onProgerss, onSubProgerss) {
      return new Promise((resolve) => {
        let zipPathList = [];
        this.zipMap.forEach((zip, zipPath) => {
          zipPathList.push(zipPath);
        });
        var progerssFun = (i, len, path) => {
          if (onProgerss) {
            if (callbacker) {
              onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
            }
            else {
              onProgerss(i, len, Math.ceil(i / len * 100), path);
            }
          }
        };
        var subProgerssFun = (i, len, path) => {
          if (onSubProgerss) {
            if (callbacker) {
              onSubProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), path);
            }
            else {
              onSubProgerss(i, len, Math.ceil(i / len * 100), path);
            }
          }
        };
        progerssFun(0, zipPathList.length, "");
        var assetNameCount = 0;
        var assetNameLoadedCount = 0;
        var zipAssetNameListMap = new Map();
        for (let i = 0, len = zipPathList.length; i < len; i++) {
          let zipPath = zipPathList[i];
          let zip = this.zipMap.get(zipPath);
          let assetNameList = [];
          for (let assetName in zip.files) {
            let fileObject = zip.files[assetName];
            if (!fileObject.dir) {
              let assetPath = this.AssetNameToPath(assetName);
              if (this.assetMap.has(assetPath)) {
                continue;
              }
              assetNameList.push(assetName);
              assetNameCount++;
            }
          }
          zipAssetNameListMap.set(zipPath, assetNameList);
        }
        for (let i = 0, len = zipPathList.length; i < len; i++) {
          let zipPath = zipPathList[i];
          let zip = this.zipMap.get(zipPath);
          let assetNameList = zipAssetNameListMap.get(zipPath);
          subProgerssFun(0, assetNameList.length, "");
          for (let j = 0, jLen = assetNameList.length; j < jLen; j++) {
            let assetName = assetNameList[j];
            let assetPath = this.AssetNameToPath(assetName);
            let type = this.manifest.GetEnumZipAssetDataType(assetName);
            JsZipAsync.read(zip, assetName, type, this, (data) => {
              assetNameLoadedCount++;
              if (data) {
                switch (type) {
                  case EnumZipAssetDataType.string:
                    data = JSON.parse(data);
                    break;
                  case EnumZipAssetDataType.base64:
                    data = "data:image/png;base64," + data;
                    this.imageCount++;
                    break;
                }
              }
              this.assetMap.set(assetPath, data);
              progerssFun(assetNameLoadedCount, assetNameCount, zipPath);
              subProgerssFun(j, jLen, assetName);
              if (assetNameLoadedCount >= assetNameCount) {
                resolve();
              }
            });
          }
        }
      });
    }
  }
  window['ZipManager'] = ZipManager;

  class R {
    static get res3dzip_manifest() {
      return this.res3dzip + "manifest.json";
    }
  }
  R.res3d = "res/res3d/Conventional/";
  R.res3dzip = "res/res3dzip/";

  var Text = Laya.Text;
  class TestZip {
    constructor() {
      this.list = [
        "Hero_0001_LongQi_Skin1",
        "Hero_1002_yamamototakeshi_Skin1",
        "Monster_2001_badstudent",
        "Monster_5001_fathoody_Skin1",
        "Monster_5001_octopus_Skin1",
        "Effect_1001_Kyoya_Skin1__ATTACK0",
        "Effect_1001_Kyoya_Skin1__ATTACK1",
        "Effect_1001_Kyoya_Skin1__ATTACK2",
        "Effect_1001_Kyoya_Skin1__ATTACK3",
        "Effect_1001_Kyoya_Skin1__EFFECT1_03",
        "Effect_1001_Kyoya_Skin1__EFFECT1_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT1_04",
        "Effect_1001_Kyoya_Skin1__EFFECT1_05",
        "Effect_1001_Kyoya_Skin1__EFFECT1_06",
        "Effect_1001_Kyoya_Skin1__EFFECT1_07",
        "Effect_1001_Kyoya_Skin1__EFFECT2_02",
        "Effect_1001_Kyoya_Skin1__EFFECT2_03",
        "Effect_1001_Kyoya_Skin1__EFFECT3_01",
        "Effect_1001_Kyoya_Skin1__EFFECT3_01_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_02",
        "Effect_1001_Kyoya_Skin1__EFFECT3_02_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_03",
        "Effect_1001_Kyoya_Skin1__EFFECT3_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_04",
        "Effect_1001_Kyoya_Skin1__EFFECT3_04_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_05",
        "Effect_1001_Kyoya_Skin1__EFFECT3_05_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_10",
        "Effect_1001_Kyoya_Skin1__EFFECT4_02",
        "Effect_1001_Kyoya_Skin1__EFFECT4_02_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_03",
        "Effect_1001_Kyoya_Skin1__EFFECT4_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_04",
        "Effect_1001_Kyoya_Skin1__EFFECT4_04_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_05",
        "Effect_1001_Kyoya_Skin1__EFFECT4_05_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_06",
        "Effect_1001_Kyoya_Skin1__EFFECT4_06_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07_01",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_08",
        "Effect_1001_Kyoya_Skin1__EFFECT4_09",
        "Effect_1001_Kyoya_Skin1__RUN_ATTACK0",
        "Effect_1001_Kyoya_Skin1__JUMP_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK1",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK2",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK3",
        "Effect_1002_yamamototakeshi_Skin1__JUMP_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__JUMP_ATTACK0_01",
        "Effect_1002_yamamototakeshi_Skin1_RUN_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1_RUN_ATTACK0_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1_02",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT2",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT2_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT4_03",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT4_04",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5_02",
        "Effect_5001_Fathoody__warning01_01",
        "Effect_5001_Fathoody__skill01_02",
        "Effect_5001_Fathoody__warning02_01",
        "Effect_5001_Fathoody__attack02_01",
        "Effect_5001_Fathoody__attack01_01",
        "Effect_000_BehitCommon__Behit",
        "Effect_Text_Forward",
        "Effect_Text_Arrow",
        "Effect_000_Circle__Other",
        "Effect_000_Circle__Self",
        "Effect_13001_fade"
      ];
      window['test'] = this;
      this.InitScene();
      this.InitUI();
      this.initTimeLog();
      this.testLoad();
    }
    initTimeLog() {
      console.time = function (tag) {
        var timeMap = console['_timeMap'];
        if (!timeMap) {
          console['_timeMap'] = timeMap = new Map();
        }
        timeMap.set(tag, new Date().getTime());
      };
      console.timeEnd = function (tag) {
        var timeMap = console['_timeMap'];
        if (!timeMap) {
          console['_timeMap'] = timeMap = new Map();
        }
        var begin = timeMap.get(tag);
        if (begin) {
          console.log(`${tag}: ${new Date().getTime() - begin}ms`);
        }
      };
    }
    async testLoad() {
      var totalBeginTime = new Date().getTime();
      var beginTime = new Date().getTime();
      await ZipManager.Instance.InitAsync(R.res3dzip_manifest, R.res3d, R.res3dzip);
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "manifest:" + useTime + "ms\n";
      var beginTime = new Date().getTime();
      console.time("LoadZipList");
      await this.LoadZipList();
      console.timeEnd("LoadZipList");
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "LoadZipList:" + useTime + "ms\n";
      var beginTime = new Date().getTime();
      console.time("LoadZipList");
      console.time("ReadZipAssetList");
      await this.ReadZipAssetList();
      console.timeEnd("ReadZipAssetList");
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "ReadZipAssetList:" + useTime + "ms\n";
      var beginTime = new Date().getTime();
      console.time("LoadRes");
      var list = this.list;
      var i = 0;
      var count = list.length;
      for (var resId of list) {
        i++;
        var path = `res/res3d/Conventional/${resId}.lh`;
        this.textPath.text = path;
        this.textRate.text = `加载预设：\n${Math.ceil(i / count * 100)}%     ${i} / ${count}`;
        var res = await this.Load3DAsync(path);
        this.scene.addChild(res);
        setTimeout(() => {
          res.removeSelf();
        }, 100);
      }
      console.log("imageCount", ZipManager.Instance.imageCount);
      console.timeEnd("LoadRes");
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "load:" + useTime + "ms\n";
      var useTime = new Date().getTime() - totalBeginTime;
      this.textTime.text += "total:" + useTime + "ms\n";
    }
    async LoadZipList() {
      var pathList = [];
      var list = this.list;
      for (var resId of list) {
        var path = `res/res3d/Conventional/${resId}.lh`;
        pathList.push(path);
      }
      await ZipManager.Instance.LoadAssetZipListAsync(pathList, this, (i, count, rate, path) => {
        this.textPath.text = path;
        this.textRate.text = `加载Zip列表： \n${rate}%     ${i}/${count}`;
      });
    }
    async ReadZipAssetList() {
      await ZipManager.Instance.ReadAllZipAsync(this, (i, count, rate, path) => {
        this.textPath.text = path;
        this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${count}`;
      });
    }
    async testLoadHero1() {
      console.time("testLoadHero");
      var path = "res/res3d/Conventional/Hero_0001_LongQi_Skin1.lh";
      var res = await this.Load3DAsync(path);
      this.scene.addChild(res);
      console.timeEnd("testLoadHero");
    }
    async testLoadHero2() {
      console.time("testLoadHero");
      var path = "res/res3d/Conventional/Hero_0002_ZhanJi_Skin1.lh";
      var res = await this.Load3DAsync(path);
      this.scene.addChild(res);
      console.timeEnd("testLoadHero");
    }
    async Load3DAsync(path) {
      return new Promise((resolve) => {
        Laya.loader.create(path, Laya.Handler.create(null, (res) => {
          resolve(res);
        }));
      });
    }
    async loadResAsync(path, type) {
      return new Promise((resolve) => {
        Laya.loader.load(path, Laya.Handler.create(null, (res) => {
          resolve(res);
        }), null, type);
      });
    }
    InitScene() {
      var scene = new Laya.Scene3D();
      var camera = new Laya.Camera();
      var directionLight = new Laya.DirectionLight();
      camera.transform.localPositionZ = 10;
      scene.addChild(camera);
      scene.addChild(directionLight);
      Laya.stage.addChild(scene);
      this.scene = scene;
    }
    InitUI() {
      let txt = new Text();
      Laya.stage.addChild(txt);
      txt.fontSize = 40;
      txt.color = "#ffffff";
      txt.wordWrap = true;
      txt.width = 500;
      txt.align = "center";
      txt.text = "0%";
      txt.bgColor = "#00000033";
      this.textRate = txt;
      txt = new Text();
      Laya.stage.addChild(txt);
      txt.fontSize = 30;
      txt.color = "#ffffff";
      txt.wordWrap = true;
      txt.width = Laya.stage.width - 40;
      txt.align = "center";
      txt.text = "";
      txt.bgColor = "#00000033";
      this.textPath = txt;
      txt = new Text();
      Laya.stage.addChild(txt);
      txt.fontSize = 30;
      txt.color = "#ffffff";
      txt.wordWrap = true;
      txt.width = Laya.stage.width - 40;
      txt.align = "center";
      txt.text = "";
      txt.bgColor = "#00000033";
      this.textTime = txt;
      Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
      this.onResize();
    }
    onResize() {
      var txt = this.textRate;
      txt.x = (Laya.stage.width - txt.width) * 0.5;
      txt.y = (Laya.stage.height - txt.textHeight) >> 1;
      var txt = this.textPath;
      txt.x = (Laya.stage.width - txt.width) * 0.5;
      txt.y = 100;
      var txt = this.textTime;
      txt.x = (Laya.stage.width - txt.width) * 0.5;
      txt.y = 200;
    }
  }

  class GameLaunch {
    constructor() {
    }
    install(callback) {
      this.installAsync(callback);
    }
    async installAsync(callback) {
      if (Engine.borwer.isWXGame) {
        if (VersionConfig && VersionConfig.UrlBasePath)
          Laya.URL.basePath = VersionConfig.UrlBasePath;
        if (Laya.MiniAdpter) {
          Laya.MiniAdpter.nativefiles =
            [];
        }
      }
      await this.loadVersionAsync();
      new TestZip();
    }
    async loadVersionAsync() {
      return new Promise((resolve) => {
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, () => {
          resolve();
          this.clearWXFileCache();
        }), Laya.ResourceVersion.FILENAME_VERSION);
      });
    }
    async checkWXFileCache() {
      if (Engine.borwer.isWXGame) {
        let preBasePath = Laya.LocalStorage.getItem("__basePath__");
        if (preBasePath != Laya.URL.basePath) {
          console.log(`资源根目录不一样: preBasePath=${preBasePath}, Laya.URL.basePath=${Laya.URL.basePath}`);
          Laya.MiniFileMgr.onSetVersion(preBasePath, Laya.URL.basePath);
        }
      }
    }
    async clearWXFileCache() {
      if (Engine.borwer.isWXGame) {
        let v = Laya.LocalStorage.getItem("__verIsNeedClear__");
        let vv = "1";
        if (v != vv) {
          console.log("清理缓存 v=", v, "vv=", vv);
          Laya.MiniFileMgr.deleteAll();
          Laya.LocalStorage.setItem("__verIsNeedClear__", vv);
        }
      }
    }
  }

  class GameMain {
    constructor() {
      LayaExtendClass();
      if (window["Laya3D"])
        Laya3D.init(GameConfig.width, GameConfig.height);
      else
        Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
      Laya["Physics"] && Laya["Physics"].enable();
      Laya["DebugPanel"] && Laya["DebugPanel"].enable();
      Laya.stage.scaleMode = GameConfig.scaleMode;
      Laya.stage.screenMode = GameConfig.screenMode;
      Laya.stage.alignV = GameConfig.alignV;
      Laya.stage.alignH = GameConfig.alignH;
      Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
      Laya.Shader3D.debugMode = false;
      if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
        Laya["PhysicsDebugDraw"].enable();
      if (GameConfig.stat)
        Laya.Stat.show();
      Laya.alertGlobalError = true;
      LayaExtendLogic();
      Engine.init();
      new GameLaunch().install();
    }
  }
  new GameMain();

}());