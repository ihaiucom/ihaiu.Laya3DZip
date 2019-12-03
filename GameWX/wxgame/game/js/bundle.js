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
  GameConfig.stat = true;
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
      this.assetName2DependencieAssetNames = {};
      this.assetName2DependencieAssetPaths = {};
      this.zipName2DependencieAssetNames = {};
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
        this.assetName2Id[assetName] = parseInt(assetId);
      }
      for (let zipId in this.zipAssets) {
        let zipIdInt = parseInt(zipId);
        let assetIdList = this.zipAssets[zipId];
        for (let id of assetIdList) {
          this.assetId2ZipId[id] = zipIdInt;
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
        var assetNames = this.assetName2DependencieAssetNames[assetName] = [];
        var assetPaths = this.assetName2DependencieAssetPaths[assetName] = [];
        var dependenceAssetIdList = this.assetsDependencie[assetId];
        for (let itemAssetId of dependenceAssetIdList) {
          let itemAssetName = this.GetAssetName(itemAssetId);
          assetNames.push(itemAssetName);
          assetPaths.push(this.GetAssetPathByAssetName(itemAssetName));
        }
      }
      for (let zipId in this.zipAssets) {
        var zipName = this.GetZipName(zipId);
        var assetNames = this.zipName2DependencieAssetNames[zipName] = [];
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
    GetAssetPathByAssetName(assetName) {
      var assetPath = this.srcRootPath + assetName;
      return assetPath;
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
    GetAssetDependencieNameList(asset) {
      let assetId = this.ToAssetId(asset);
      let assetName = this.GetAssetName(assetId);
      var assetNames = this.assetName2DependencieAssetNames[assetName];
      return assetNames;
    }
    GetAssetDependenciePathList(asset) {
      let assetId = this.ToAssetId(asset);
      let assetName = this.GetAssetName(assetId);
      var assetPaths = this.assetName2DependencieAssetPaths[assetName];
      return assetPaths;
    }
    GetAssetDependenciePathListByAssetPath(assetPath) {
      let assetName = this.GetAssetNameByPath(assetPath);
      return this.GetAssetDependenciePathList(assetName);
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
        if (onProcess)
          onProcess.call(onLoadCaller, 1);
        onLoad.call(onLoadCaller, data);
        return;
      }
      else {
        this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
      }
    }
    src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
    }
    _loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
      var data = ZipManager.Instance.GetAssetData(url);
      if (data) {
        this.src_loadHtmlImage(data, onLoadCaller, onLoad, onErrorCaller, onError);
      }
      else {
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
      let p = zip.file(path).async(type);
      let a = setTimeout(() => {
        p.then((data) => {
          if (onComponent) {
            onComponent.call(callbacker, data);
          }
        });
      }, 100);
      p.then((data) => {
        clearTimeout(a);
        if (onComponent) {
          onComponent.call(callbacker, data);
        }
      }, (r) => {
        clearTimeout(a);
        console.warn(path, r);
        if (onComponent) {
          onComponent.call(callbacker, null);
        }
      }).catch((error) => {
        console.error(error);
        if (onComponent) {
          onComponent.call(callbacker, null);
        }
      });
    }
  }

  class AsyncUtil {
    static async MAwitFrame(delayFrame = 1) {
      return new Promise((resolve) => {
        Laya.timer.frameOnce(delayFrame, this, () => {
          resolve();
        });
      });
    }
    static ResolveDelayCall(resolve, ...args) {
      Laya.timer.frameOnce(1, this, () => {
        resolve(...args);
      });
    }
    static async Load3DAsync(path) {
      return new Promise((resolve) => {
        Laya.loader.create(path, Laya.Handler.create(null, (res) => {
          AsyncUtil.ResolveDelayCall(resolve, res);
        }));
      });
    }
    static Load3D(path, callbacker, onComponent) {
      Laya.loader.create(path, Laya.Handler.create(null, (res) => {
        if (onComponent) {
          if (callbacker) {
            onComponent.call(callbacker, res);
          }
          else {
            onComponent(res);
          }
        }
      }));
    }
  }
  window['AsyncUtil'] = AsyncUtil;

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
    async InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt, isReplace) {
      if (this.manifest && !isReplace) {
        console.log("已经初始了Zip资源清单");
        return;
      }
      if (zipExt) {
        this.zipExt = zipExt;
        this.zipExtName = zipExt.replace('.', '');
      }
      await AssetManifest.InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt);
      this.manifest = AssetManifest.Instance;
      ZipManager.enable = true;
      this.InitCode();
    }
    InitCode() {
      ZipLoader.InitCode();
    }
    HasZip(zipPath) {
      return this.zipMap.has(zipPath);
    }
    HasAsset(assetPath) {
      return this.assetMap.has(assetPath);
    }
    AssetUrlToPath(url) {
      return url.replace(Laya.URL.basePath, "");
    }
    AssetUrlToName(url) {
      let assetPath = this.AssetUrlToPath(url);
      let assetName = this.manifest.GetAssetNameByPath(assetPath);
      return assetName;
    }
    AssetNameToPath(assetName) {
      return this.manifest.srcRootPath + assetName;
    }
    ResFileNameToAssetPath(resId) {
      return this.manifest.srcRootPath + resId + ".lh";
    }
    AssetPathListToAssetNameList(assetPathList) {
      let assetNameList = [];
      for (let assetPath of assetPathList) {
        let assetName = this.manifest.GetAssetNameByPath(assetPath);
        assetNameList.push(assetName);
      }
      return assetNameList;
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
    async LoadAssetZipListAsync(assetPathList, callbacker, onProgerss) {
      let assetNameList = this.AssetPathListToAssetNameList(assetPathList);
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
        if (loadTotal == 0) {
          AsyncUtil.ResolveDelayCall(resolve);
          return;
        }
        for (let i = 0, len = zipPathList.length; i < len; i++) {
          let zipPath = zipPathList[i];
          if (this.zipMap.has(zipPath)) {
            loadNum++;
            progerssFun(loadNum, loadTotal, zipPath);
            if (loadNum >= loadTotal) {
              AsyncUtil.ResolveDelayCall(resolve);
            }
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
        var assetNameTotal = 0;
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
              assetNameTotal++;
            }
          }
          zipAssetNameListMap.set(zipPath, assetNameList);
        }
        console.log("assetNameTotal=", assetNameTotal);
        if (assetNameTotal == 0) {
          AsyncUtil.ResolveDelayCall(resolve);
          return;
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
              progerssFun(assetNameLoadedCount, assetNameTotal, zipPath);
              subProgerssFun(j, jLen, assetName);
              if (assetNameLoadedCount >= assetNameTotal) {
                AsyncUtil.ResolveDelayCall(resolve);
              }
            });
          }
        }
      });
    }
  }
  ZipManager.enable = false;
  window['ZipManager'] = ZipManager;

  class R {
    static get res3dzip_manifest() {
      return this.res3dzip + "manifest.json";
    }
  }
  R.res3d = "res/res3d/Conventional/";
  R.res3dzip = "res/res3dzip/";

  class DebugLoader {
    static InitCode() {
      new DebugLoader().InitCode();
    }
    InitCode() {
      var Loader = Laya.Loader;
      Loader.prototype.src_load = Loader.prototype.load;
      Loader.prototype.load = this.load;
      Loader.prototype.src_onLoaded = Loader.prototype.onLoaded;
      Loader.prototype.onLoaded = this.onLoaded;
      Loader.prototype.src_endLoad = Loader.prototype.endLoad;
      Loader.prototype.endLoad = this.endLoad;
      Loader.prototype.src_onError = Loader.prototype.onError;
      Loader.prototype.onError = this.onError;
    }
    src_onError(message) {
    }
    onError(message) {
      DebugResources.onLoadError(this.url);
      this.onError(message);
    }
    src_endLoad(content = null) {
    }
    endLoad(content = null) {
      DebugResources.onLoadEnd(this.url);
      this.src_endLoad(content);
    }
    src_onLoaded(data = null) {
    }
    onLoaded(data = null) {
      DebugResources.onLoaded(this.url, data);
      this.src_onLoaded(data);
    }
    src_load(url, type = null, cache = true, group = null, ignoreCache = false, useWorkerLoader = Laya.WorkerLoader.enable) {
    }
    load(url, type = null, cache = true, group = null, ignoreCache = false, useWorkerLoader = Laya.WorkerLoader.enable) {
      DebugResources.onLoadBegin(url);
      this.src_load(url, type, cache, group, ignoreCache, useWorkerLoader);
    }
  }

  class DebugLoaderManager {
    static InitCode() {
      new DebugLoaderManager().InitCode();
    }
    InitCode() {
      var LoaderManager = Laya.LoaderManager;
      LoaderManager.prototype.src_createOne = LoaderManager.prototype._createOne;
      LoaderManager.prototype._createOne = this._createOne;
      LoaderManager.prototype.src_create = LoaderManager.prototype._create;
      LoaderManager.prototype._create = this._create;
    }
    src_createOne(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
    }
    _createOne(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
      DebugResources.onCreateOnceBegin(url);
      var myComplete = Handler.create(this, (res) => {
        if (complete) {
          DebugResources.onCreateOnceEnd(url, res);
          complete.runWith(res);
        }
      });
      this.src_createOne(url, mainResou, myComplete, progress, type, constructParams, propertyParams, priority, cache);
    }
    src_create(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
    }
    _create(url, mainResou, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true) {
      DebugResources.onCreateBegin(url);
      var myComplete = Handler.create(this, (res) => {
        if (complete) {
          DebugResources.onCreateEnd(url);
          complete.runWith(res);
        }
      });
      this.src_create(url, mainResou, myComplete, progress, type, constructParams, propertyParams, priority, cache);
    }
  }

  class DebugLaya3D {
    static InitCode() {
      new DebugLaya3D().InitCode();
    }
    InitCode() {
      var _Laya3D = Laya3D;
      _Laya3D.src_endLoad = _Laya3D._endLoad;
      _Laya3D._endLoad = this._endLoad;
    }
    src_endLoad(loader, content = null, subResous = null) {
    }
    _endLoad(loader, content = null, subResous = null) {
      DebugResources.onLaya3DEnd(loader.url, content);
      this.src_endLoad(loader, content, subResous);
    }
  }

  var DebugLoaderState;
  (function (DebugLoaderState) {
    DebugLoaderState["Begin"] = "Begin";
    DebugLoaderState["LoadedSucess"] = "LoadedSucess";
    DebugLoaderState["LoadedFail"] = "LoadedFail";
  })(DebugLoaderState || (DebugLoaderState = {}));
  class DebugResources {
    static Init() {
      this.enable = true;
      DebugLoader.InitCode();
      DebugLoaderManager.InitCode();
      DebugLaya3D.InitCode();
    }
    static onLaya3DBegin(url) {
      this.laya3dStateMap.set(url, DebugLoaderState.Begin);
      var num = 0;
      if (this.laya3dBeginNumMap.has(url)) {
        num = this.laya3dBeginNumMap.get(url);
      }
      this.laya3dBeginNumMap.set(url, num + 1);
    }
    static onLaya3DEnd(url, res) {
      this.laya3dStateMap.set(url, res ? DebugLoaderState.LoadedSucess : DebugLoaderState.LoadedFail);
      var num = 0;
      if (this.laya3dEndNumMap.has(url)) {
        num = this.laya3dEndNumMap.get(url);
      }
      this.laya3dEndNumMap.set(url, num + 1);
    }
    static onCreateOnceBegin(url) {
      this.createrOnceStateMap.set(url, DebugLoaderState.Begin);
      var num = 0;
      if (this.createOnceBeginNumMap.has(url)) {
        num = this.createOnceBeginNumMap.get(url);
      }
      this.createOnceBeginNumMap.set(url, num + 1);
    }
    static onCreateOnceEnd(url, res) {
      this.createrOnceResMap.set(url, res);
      this.createrOnceStateMap.set(url, res ? DebugLoaderState.LoadedSucess : DebugLoaderState.LoadedFail);
      var num = 0;
      if (this.createOnceEndNumMap.has(url)) {
        num = this.createOnceEndNumMap.get(url);
      }
      this.createOnceEndNumMap.set(url, num + 1);
    }
    static onCreateBegin(url) {
      this.createrStateMap.set(url, DebugLoaderState.Begin);
      var num = 0;
      if (this.createeBeginNumMap.has(url)) {
        num = this.createeBeginNumMap.get(url);
      }
      this.createeBeginNumMap.set(url, num + 1);
    }
    static onCreateEnd(url) {
      this.createrStateMap.set(url, DebugLoaderState.LoadedSucess);
      var num = 0;
      if (this.createEndNumMap.has(url)) {
        num = this.createEndNumMap.get(url);
      }
      this.createEndNumMap.set(url, num + 1);
    }
    static onPrefabBegin(url) {
      if (!this.enable)
        return;
      this.prefabStateMap.set(url, DebugLoaderState.Begin);
      var num = 0;
      if (this.prefabBeginNumMap.has(url)) {
        num = this.prefabBeginNumMap.get(url);
      }
      this.prefabBeginNumMap.set(url, num + 1);
    }
    static onPrefabEnd(url) {
      if (!this.enable)
        return;
      this.prefabStateMap.set(url, DebugLoaderState.LoadedSucess);
      var num = 0;
      if (this.prefabEndNumMap.has(url)) {
        num = this.prefabEndNumMap.get(url);
      }
      this.prefabEndNumMap.set(url, num + 1);
    }
    static onLoadBegin(url) {
      this.stateMap.set(url, DebugLoaderState.Begin);
      var num = 0;
      if (this.loadBeginNumMap.has(url)) {
        num = this.loadBeginNumMap.get(url);
      }
      this.loadBeginNumMap.set(url, num + 1);
    }
    static onLoaded(url, data) {
      if (url == "res/res3dzip/Hero_0001_LongQi_Skin1.zip") {
        console.log(1);
      }
      if (data) {
        this.stateMap.set(url, DebugLoaderState.LoadedSucess);
      }
      else {
        this.stateMap.set(url, DebugLoaderState.LoadedFail);
      }
      var num = 0;
      if (this.loadedNumMap.has(url)) {
        num = this.loadedNumMap.get(url);
      }
      this.loadedNumMap.set(url, num + 1);
    }
    static onLoadEnd(url) {
      if (url == "res/res3dzip/Hero_0001_LongQi_Skin1.zip") {
        console.log(1);
      }
      var num = 0;
      if (this.loadEndNumMap.has(url)) {
        num = this.loadEndNumMap.get(url);
      }
      this.loadEndNumMap.set(url, num + 1);
    }
    static onLoadError(url) {
      var num = 0;
      if (this.loadErrorNumMap.has(url)) {
        num = this.loadErrorNumMap.get(url);
      }
      this.loadErrorNumMap.set(url, num + 1);
    }
    static GetInfo(url) {
      return `Loader: ${this.stateMap.get(url)},  beginNum=${this.loadBeginNumMap.get(url)},  loadedNum=${this.loadedNumMap.get(url)},  endNum=${this.loadEndNumMap.get(url)}, ErrorNum=${this.loadErrorNumMap.get(url)},  ${url}`;
    }
    static GetPrefabInfo(url) {
      return `Prefab: ${this.prefabStateMap.get(url)},  beginNum=${this.prefabBeginNumMap.get(url)},  endNum=${this.prefabEndNumMap.get(url)},  ${url}`;
    }
    static GetCreateOnceInfo(url) {
      return `CreateOnce: ${this.createrOnceStateMap.get(url)},  beginNum=${this.createOnceBeginNumMap.get(url)},  endNum=${this.createOnceEndNumMap.get(url)},  ${url}`;
    }
    static GetCreateInfo(url) {
      return `Create: ${this.createrStateMap.get(url)},  beginNum=${this.createeBeginNumMap.get(url)},  endNum=${this.createEndNumMap.get(url)},  ${url}`;
    }
    static PrintPrefabAssetsInfo(url) {
      if (!ZipManager.Instance.manifest) {
        console.warn("没有ZipManager.Instance.manifest");
        return;
      }
      console.log("CheckPrefab:", url);
      let prefabAssetName = ZipManager.Instance.AssetUrlToName(url);
      let dependenciePathList = ZipManager.Instance.manifest.GetAssetDependenciePathList(prefabAssetName);
      for (let itemAssetPath of dependenciePathList) {
        let state = this.createrOnceStateMap.get(itemAssetPath);
        let state2 = this.laya3dStateMap.get(itemAssetPath);
        let info = `${state}, laya3dState=${state2},  createOnceBeginNumMap=${this.createOnceBeginNumMap.get(itemAssetPath)},  createOnceEndNumMap=${this.createOnceEndNumMap.get(itemAssetPath)}, ${itemAssetPath}, ${this.createrOnceResMap.get(itemAssetPath)}`;
        if (state != DebugLoaderState.LoadedSucess || state2 != DebugLoaderState.LoadedSucess) {
          console.warn(info);
        }
        else {
          console.log(info);
        }
      }
    }
    static Check() {
      this.CheckNoLoaded();
    }
    static CheckNoLoaded() {
      console.log("CheckNoLoaded");
      this.stateMap.forEach((state, url) => {
        if (state != DebugLoaderState.LoadedSucess) {
          console.warn(this.GetInfo(url));
        }
      });
      this.loadErrorNumMap.forEach((state, url) => {
        console.error(this.GetInfo(url));
      });
      this.prefabStateMap.forEach((state, url) => {
        if (state != DebugLoaderState.LoadedSucess) {
          console.warn(this.GetPrefabInfo(url));
        }
      });
      this.createrOnceStateMap.forEach((state, url) => {
        if (state != DebugLoaderState.LoadedSucess) {
          console.warn(this.GetCreateOnceInfo(url));
        }
      });
      this.createrStateMap.forEach((state, url) => {
        if (state != DebugLoaderState.LoadedSucess) {
          console.warn(this.GetCreateInfo(url));
        }
      });
      console.log("检测预设哪个文件没加载完成");
      this.prefabStateMap.forEach((state, url) => {
        if (state != DebugLoaderState.LoadedSucess) {
          this.PrintPrefabAssetsInfo(url);
        }
      });
    }
  }
  DebugResources.enable = false;
  DebugResources.stateMap = new Map();
  DebugResources.loadBeginNumMap = new Map();
  DebugResources.loadedNumMap = new Map();
  DebugResources.loadEndNumMap = new Map();
  DebugResources.loadErrorNumMap = new Map();
  DebugResources.prefabStateMap = new Map();
  DebugResources.prefabBeginNumMap = new Map();
  DebugResources.prefabEndNumMap = new Map();
  DebugResources.createrOnceResMap = new Map();
  DebugResources.createrOnceStateMap = new Map();
  DebugResources.createOnceBeginNumMap = new Map();
  DebugResources.createOnceEndNumMap = new Map();
  DebugResources.createrStateMap = new Map();
  DebugResources.createeBeginNumMap = new Map();
  DebugResources.createEndNumMap = new Map();
  DebugResources.laya3dStateMap = new Map();
  DebugResources.laya3dBeginNumMap = new Map();
  DebugResources.laya3dEndNumMap = new Map();
  window['DebugResources'] = DebugResources;

  class PreloadZipList {
    constructor(zipPathList, assetPathList) {
      this.assetPathList = [];
      this.maxLoader = 2;
      this.isStop = false;
      this.total = 0;
      this.loadIndex = 0;
      this.unzipIndex = 0;
      this.zipPathList = zipPathList;
      this.assetPathList = assetPathList;
      this.loadIndex = 0;
      this.unzipIndex = 0;
      this.total = zipPathList.length;
      this.maxLoader = Laya.loader.maxLoader - 2;
      this.maxLoader = Math.min(this.maxLoader, 2);
    }
    get IsWait() {
      return Laya.loader._loaderCount >= this.maxLoader;
    }
    async StartAsync() {
      this.isStop = false;
      await this.LoadListAsync();
      await this.UnzipListAsync();
    }
    Stop() {
      this.isStop = true;
    }
    async LoadListAsync() {
      if (this.total == 0) {
        return;
      }
      while (this.loadIndex < this.total) {
        if (this.isStop) {
          break;
        }
        if (this.IsWait) {
          await AsyncUtil.MAwitFrame();
        }
        if (this.isStop) {
          break;
        }
        let zipPath = this.zipPathList[this.loadIndex];
        console.log("Preload Zip", zipPath);
        await ZipManager.Instance.GetZipAsync(zipPath);
        this.loadIndex++;
        if (this.isStop) {
          break;
        }
      }
    }
    async UnzipListAsync() {
      if (this.total == 0 || this.isStop) {
        return;
      }
      this.unzipIndex = 0;
      this.total = this.assetPathList.length;
      let onceNum = 3;
      while (this.unzipIndex < this.total) {
        if (this.isStop) {
          break;
        }
        for (let i = 0; i < onceNum; i++) {
          if (this.unzipIndex >= this.total || this.isStop) {
            break;
          }
          let assetPath = this.assetPathList[this.unzipIndex];
          if (i < onceNum - 1) {
            console.log("Preload Read sync", i, assetPath);
            ZipManager.Instance.GetAssetDataAsync(assetPath);
          }
          else {
            console.log("Preload Read async", i, assetPath);
            await ZipManager.Instance.GetAssetDataAsync(assetPath);
          }
          this.unzipIndex++;
        }
        if (this.isStop) {
          break;
        }
      }
    }
  }

  class PreloadAssetList {
    constructor(assetPathList) {
      this.maxLoader = 5;
      this.isStop = false;
      this.total = 0;
      this.loadIndex = 0;
      this.assetPathList = assetPathList;
      this.loadIndex = 0;
      this.total = assetPathList.length;
      this.maxLoader = Laya.loader.maxLoader - 2;
      this.maxLoader = Math.min(this.maxLoader, 2);
    }
    get IsWait() {
      return Laya.loader._loaderCount >= this.maxLoader;
    }
    async StartAsync() {
      this.isStop = false;
      await this.LoadListAsync();
    }
    Stop() {
      this.isStop = true;
    }
    async LoadListAsync() {
      if (this.total == 0) {
        return;
      }
      let onceNum = 3;
      while (this.loadIndex < this.total) {
        if (this.isStop) {
          break;
        }
        if (this.IsWait) {
          await AsyncUtil.MAwitFrame();
        }
        if (this.isStop) {
          break;
        }
        for (let i = 0; i < onceNum; i++) {
          if (this.loadIndex >= this.total || this.isStop) {
            break;
          }
          let assetPath = this.assetPathList[this.loadIndex];
          if (i < onceNum - 1) {
            console.log("Preload Load sync", i, assetPath);
            AsyncUtil.Load3D(assetPath);
          }
          else {
            console.log("Preload Load async", i, assetPath);
            await AsyncUtil.Load3DAsync(assetPath);
          }
          this.loadIndex++;
        }
        if (this.isStop) {
          break;
        }
        if (this.isStop) {
          break;
        }
      }
    }
  }

  class PrefabManager {
    static get Instance() {
      if (!PrefabManager._Instance) {
        PrefabManager._Instance = new PrefabManager();
        window['prefabManager'] = PrefabManager._Instance;
      }
      return PrefabManager._Instance;
    }
    Init(srcRootPath) {
      this.srcRootPath = srcRootPath;
    }
    ResFileNameToAssetPath(resId) {
      return this.srcRootPath + resId + ".lh";
    }
    async LoadPrefabListAsync(resIdList, callbacker, onProgerss) {
      return new Promise((resolve) => {
        let i = 0;
        let len = resIdList.length;
        if (len == 0) {
          AsyncUtil.ResolveDelayCall(resolve);
          return;
        }
        for (let resId of resIdList) {
          let assetPath = this.ResFileNameToAssetPath(resId);
          DebugResources.onPrefabBegin(assetPath);
          Laya.loader.create(assetPath, Laya.Handler.create(null, (res) => {
            i++;
            DebugResources.onPrefabEnd(assetPath);
            if (onProgerss) {
              if (callbacker) {
                onProgerss.call(callbacker, i, len, Math.ceil(i / len * 100), assetPath, res);
              }
              else {
                onProgerss(i, len, Math.ceil(i / len * 100), assetPath, res);
              }
            }
            if (i >= len) {
              AsyncUtil.ResolveDelayCall(resolve);
            }
          }));
        }
      });
    }
    StopPreload() {
      if (this.preloadZip) {
        this.preloadZip.Stop();
      }
      if (this.preloadAsset) {
        this.preloadAsset.Stop();
      }
      this.preloadZip = null;
      this.preloadAsset = null;
    }
    async PreloadPrefabList(resIdList) {
      this.StopPreload();
      if (!ZipManager.enable) {
        return;
      }
      let len = resIdList.length;
      if (len == 0) {
        return;
      }
      var manifest = ZipManager.Instance.manifest;
      let prefabAssetPathList = [];
      let assetPathList = [];
      var tmpMap = new Map();
      for (let resId of resIdList) {
        let assetPath = this.ResFileNameToAssetPath(resId);
        let item = Laya.Loader.getRes(assetPath);
        if (item) {
          continue;
        }
        let dependencieAssetPathList = manifest.GetAssetDependenciePathListByAssetPath(assetPath);
        for (let dependencieAssetPath of dependencieAssetPathList) {
          if (tmpMap.has(dependencieAssetPath)) {
            continue;
          }
          let item = Laya.Loader.getRes(dependencieAssetPath);
          if (item) {
            continue;
          }
          assetPathList.push(dependencieAssetPath);
          tmpMap.set(dependencieAssetPath, true);
        }
        assetPathList.push(assetPath);
        prefabAssetPathList.push(assetPath);
      }
      let assetNameList = ZipManager.Instance.AssetPathListToAssetNameList(prefabAssetPathList);
      let zipPathList = manifest.GetAssetListDependencieZipPathList(assetNameList);
      this.preloadZip = new PreloadZipList(zipPathList, assetPathList);
      this.preloadAsset = new PreloadAssetList(assetPathList);
      await this.preloadZip.StartAsync();
      await this.preloadAsset.StartAsync();
    }
  }
  window['PrefabManager'] = PrefabManager;

  var Text = Laya.Text;
  class TestZip {
    constructor() {
      this.list = [
        "Hero_0001_LongQi_Skin1",
        "Hero_1002_yamamototakeshi_Skin1",
      ];
      this.prefabList = [];
      window['test'] = this;
      this.InitScene();
      this.InitUI();
      this.initTimeLog();
      this.testLoadAll();
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
    async testLoadAll() {
      var beginTime = new Date().getTime();
      await ZipManager.Instance.InitAsync(R.res3dzip_manifest, R.res3d, R.res3dzip);
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "manifest:" + useTime + "ms\n";
      PrefabManager.Instance.Init(R.res3d);
      var beginTime = new Date().getTime();
      await PrefabManager.Instance.PreloadPrefabList(this.list);
      var useTime = new Date().getTime() - beginTime;
      this.textTime.text += "PreloadPrefabList:" + useTime + "ms\n";
      this.testLoad();
    }
    async testLoad() {
      var totalBeginTime = new Date().getTime();
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
      console.time("LoadPrefabList");
      await this.LoadPrefabList2();
      console.log("imageCount", ZipManager.Instance.imageCount);
      console.timeEnd("LoadPrefabList");
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
      console.log("ReadZipAssetList End");
    }
    clearScene() {
      for (let item of this.prefabList) {
        item.removeSelf();
      }
    }
    async LoadPrefabList1() {
      this.clearScene();
      let list = this.list;
      let i = 0;
      let len = list.length;
      for (let resId of list) {
        i++;
        let rate = Math.ceil(i / len * 100);
        let path = ZipManager.Instance.ResFileNameToAssetPath(resId);
        this.textPath.text = path;
        this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${len}`;
        let res = await this.Load3DAsync(path);
        if (this.prefabList.includes(res)) {
          console.log("已经加载过", path);
        }
        this.prefabList.push(res);
        this.scene.addChild(res);
      }
      this.textPath.text = "加载完成所有预设";
    }
    async LoadPrefabList2() {
      this.clearScene();
      await PrefabManager.Instance.LoadPrefabListAsync(this.list, this, (i, count, rate, path, res) => {
        if (this.prefabList.includes(res)) {
          console.log("已经加载过", path);
        }
        this.prefabList.push(res);
        this.scene.addChild(res);
        this.textPath.text = path;
        this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${count}`;
      });
      this.textPath.text = "加载完成所有预设";
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
          AsyncUtil.ResolveDelayCall(resolve, res);
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
      var btn = new Laya.Sprite();
      btn.width = 100;
      btn.height = 50;
      btn.graphics.drawRect(0, 0, 100, 50, '#00FF00');
      Laya.stage.addChild(btn);
      btn.mouseEnabled = true;
      btn.on(Laya.Event.CLICK, this, this.onClickCheck);
      this.checkBtn = btn;
      var btn = new Laya.Sprite();
      btn.width = 100;
      btn.height = 50;
      btn.graphics.drawRect(0, 0, 100, 50, '#FF0000');
      Laya.stage.addChild(btn);
      btn.mouseEnabled = true;
      btn.on(Laya.Event.CLICK, this, this.clearScene);
      this.clearBtn = btn;
      var btn = new Laya.Sprite();
      btn.width = 100;
      btn.height = 50;
      btn.graphics.drawRect(0, 0, 100, 50, '#0000FF');
      Laya.stage.addChild(btn);
      btn.mouseEnabled = true;
      btn.on(Laya.Event.CLICK, this, this.onClickReload);
      this.reloadBtn = btn;
      Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
      this.onResize();
    }
    onClickCheck(e) {
      DebugResources.Check();
    }
    onClickReload(e) {
      this.textTime.text = "";
      this.testLoad();
    }
    onResize() {
      var btn = this.checkBtn;
      btn.x = (Laya.stage.width - btn.width) * 0.5;
      btn.y = ((Laya.stage.height - btn.height) >> 1) + 100;
      var btn = this.clearBtn;
      btn.x = (Laya.stage.width - btn.width) * 0.5;
      btn.y = ((Laya.stage.height - btn.height) >> 1) + 200;
      var btn = this.reloadBtn;
      btn.x = (Laya.stage.width - btn.width) * 0.5;
      btn.y = ((Laya.stage.height - btn.height) >> 1) + 300;
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
    testAsync() {
      this.testFun1Async();
    }
    async testFun1Async() {
      console.log("testFun1Async Begin");
      await this.testFun2Async();
      console.log("testFun1Async End");
    }
    async testFun2Async() {
    }
  }
  new GameMain();

}());