(function () {
    'use strict';

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
        HasAsset(assetName) {
            return this.GetAssetId(assetName) != undefined;
        }
        HasAssetByPath(assetPath) {
            var assetName = this.GetAssetNameByPath(assetPath);
            return this.HasAsset(assetName);
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

    class LayaExtends_Loader {
        static InitCode() {
            new LayaExtends_Loader().InitCode();
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
            Loader.src_clearRes = Loader.clearRes;
            Loader.clearRes = LayaExtends_Loader.clearRes;
        }
        static clearRes(url) {
            Loader.src_clearRes(url);
            if (ZipManager.enable) {
                ZipManager.Instance.OnClearResouceAsset(url);
            }
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
            if (ext == ZipManager.Instance.zipExtName || !ZipManager.Instance.HasManifestAssetByUrl(url)) {
                this.src_loadHttpRequestWhat(url, contentType);
                return;
            }
            this._loadHttpRequest(url, contentType, this, this.onLoaded, this, this.onProgress, this, this.onError);
        }
        src_loadResourceFilter(type, url) {
        }
        _loadResourceFilter(type, url) {
            var ext = Laya.Utils.getFileExtension(url);
            if (ext == ZipManager.Instance.zipExtName || !ZipManager.Instance.HasManifestAssetByUrl(url)) {
                this.src_loadResourceFilter(type, url);
                return;
            }
            this._loadResource(type, url);
        }
        src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
        }
        async _loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError) {
            var ext = Laya.Utils.getFileExtension(url);
            if (ext == ZipManager.Instance.zipExtName) {
                this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
                return;
            }
            ZipManager.Instance.GetOrLoadAssetData(url, Handler.create(this, (data) => {
                if (data) {
                    Laya.timer.frameOnce(1, this, () => {
                        if (onProcess)
                            onProcess.call(onLoadCaller, 1);
                        onLoad.call(onLoadCaller, data);
                    });
                    return;
                }
                else {
                    this.src_loadHttpRequest(url, contentType, onLoadCaller, onLoad, onProcessCaller, onProcess, onErrorCaller, onError);
                }
            }));
        }
        src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
        }
        async _loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError) {
            if (url.indexOf("Conventional/res3d/Conventional") != -1) {
                console.error("_addHierarchyInnerUrls path=", url);
            }
            ZipManager.Instance.GetOrLoadAssetData(url, Handler.create(this, (data) => {
                if (data) {
                    Laya.timer.frameOnce(1, this, () => {
                        this.src_loadHtmlImage(data, onLoadCaller, onLoad, onErrorCaller, onError);
                    });
                }
                else {
                    this.src_loadHtmlImage(url, onLoadCaller, onLoad, onErrorCaller, onError);
                }
            }));
        }
    }
    LayaExtends_Loader.UseAsync = true;

    class FileBlock {
        constructor() {
            this.index = 0;
            this.begin = 0;
            this.end = 0;
            this.responseList = [];
            this.progressList = [];
            this.sendIndex = -1;
            this._isAbort = false;
            this._isComplete = false;
        }
        get rangeBegin() {
            return this.begin + this.loadedSize;
        }
        get loadedSize() {
            var v = 0;
            for (var i = 0, len = this.progressList.length; i < len; i++) {
                v += this.progressList[i];
            }
            return v;
        }
        Reset() {
            this.fileTask = null;
            this.begin = 0;
            this.end = 0;
            this.responseList.length = 0;
            this.progressList.length = 1;
            this.progressList[0] = 0;
            this.sendIndex = -1;
            this._isAbort = false;
            this._isComplete = false;
        }
        get isAbort() {
            return this._isAbort;
        }
        get isComplete() {
            return this._isComplete;
        }
        OnEnd(isAbort) {
            this._isAbort = isAbort;
            this._isComplete = this.loadedSize == this.end;
            this.fileTask.OnBlockEnd(this);
        }
        MergeToBuff(buff) {
            var offset = this.begin;
            for (var i = 0, len = this.responseList.length; i < len; i++) {
                var item = this.responseList[i];
                var itemBuff = new Int8Array(item);
                buff.set(itemBuff, offset);
                offset += item.byteLength;
            }
        }
        static PoolGetItem() {
            var item;
            if (this.pool.length > 0) {
                item = this.pool.shift();
            }
            else {
                item = new FileBlock();
            }
            item.Reset();
            return item;
        }
        static PoolRecoverItem(item) {
            if (this.pool.indexOf(item) == -1) {
                return this.pool.push(item);
            }
        }
    }
    FileBlock.pool = [];

    class HttpRequestRangePool {
        static GetItem() {
            var num = Laya.loader._loaderCount + HttpRequestHeadPool.useNum + HttpRequestRangePool.useNum;
            if (num >= 4) {
                return null;
            }
            if (this.pool.length > 0) {
                this.useNum++;
                var item = this.pool.shift();
                item['__inpool'] = false;
                return item;
            }
            else {
                this.useNum++;
                var item = new XMLHttpRequest();
                item['__inpool'] = false;
                return item;
            }
        }
        static RecoverItem(xhr) {
            xhr.abort();
            xhr.onreadystatechange = null;
            xhr.onprogress = null;
            xhr.onerror = null;
            if (xhr['__inpool']) {
                console.log("HttpRequestPool RecoverItem 多次");
                return;
            }
            this.useNum--;
            xhr['__inpool'] = true;
            this.checkWait();
        }
        static checkWait() {
            if (this.wait.length > 0) {
                var item = this.GetItem();
                if (item) {
                    let waitItem = this.wait.shift();
                    waitItem.runWith(item);
                }
                Laya.timer.frameOnce(1, HttpRequestRangePool, this.checkWait, null, true);
            }
        }
        static Request(handler) {
            let item = this.GetItem();
            if (item) {
                handler.runWith(item);
            }
            else {
                this.wait.push(handler);
                Laya.timer.frameOnce(1, HttpRequestRangePool, this.checkWait, null, true);
            }
        }
    }
    HttpRequestRangePool.MaxNum = 3;
    HttpRequestRangePool.pool = [];
    HttpRequestRangePool.currNum = 0;
    HttpRequestRangePool.useNum = 0;
    HttpRequestRangePool.wait = [];

    class HttpRequestHeadPool {
        static GetItem() {
            var num = Laya.loader._loaderCount + HttpRequestHeadPool.useNum + HttpRequestRangePool.useNum;
            if (num >= 4) {
                return null;
            }
            if (this.pool.length > 0) {
                this.useNum++;
                var item = this.pool.shift();
                item['__inpool'] = false;
                return item;
            }
            else {
                this.useNum++;
                var item = new XMLHttpRequest();
                item['__inpool'] = false;
                return item;
            }
        }
        static RecoverItem(xhr) {
            xhr.abort();
            xhr.onreadystatechange = null;
            xhr.onprogress = null;
            xhr.onerror = null;
            if (xhr['__inpool']) {
                console.log("HttpRequestPool RecoverItem 多次");
                return;
            }
            this.useNum--;
            xhr['__inpool'] = true;
            this.checkWait();
        }
        static checkWait() {
            if (this.wait.length > 0) {
                var item = this.GetItem();
                if (item) {
                    let waitItem = this.wait.shift();
                    waitItem.runWith(item);
                }
                Laya.timer.frameOnce(1, HttpRequestHeadPool, this.checkWait, null, true);
            }
        }
        static Request(handler) {
            let item = this.GetItem();
            if (item) {
                handler.runWith(item);
            }
            else {
                this.wait.push(handler);
                Laya.timer.frameOnce(1, HttpRequestHeadPool, this.checkWait, null, true);
            }
        }
    }
    HttpRequestHeadPool.MaxNum = 2;
    HttpRequestHeadPool.pool = [];
    HttpRequestHeadPool.currNum = 0;
    HttpRequestHeadPool.useNum = 0;
    HttpRequestHeadPool.wait = [];

    var Handler$1 = Laya.Handler;
    class HRHead {
        onEvent(e) {
            if (this.xhr.readyState == 4) {
                var fileSize = this.xhr.getResponseHeader('Content-Length');
                if (fileSize) {
                    this.ResultCallbak(0, parseInt(fileSize));
                }
                else {
                    this.ResultCallbak(1, -1);
                }
            }
        }
        onerror(e) {
            console.warn("HRHead 请求文件头失败", this.url, e);
            this.ResultCallbak(1, -1);
        }
        ResultCallbak(errorCode, fileSize) {
            if (this.callback) {
                if (this.callbackObj) {
                    this.callback.call(this.callbackObj, errorCode, fileSize, this.url);
                }
                else {
                    this.callback(errorCode, fileSize, this.url);
                }
            }
            this.callback = null;
            this.callbackObj = null;
            this.url = null;
            if (this.xhr) {
                this.xhr.abort();
                HttpRequestHeadPool.RecoverItem(this.xhr);
                this.xhr = null;
                HRHead.RecoverItem(this);
            }
        }
        Request(url, callback, callbackObj) {
            console.log("HRHead.Request", url);
            this.url = url;
            this.callback = callback;
            this.callbackObj = callbackObj;
            HttpRequestHeadPool.Request(Handler$1.create(this, (xhr) => {
                this.xhr = xhr;
                this.xhr.onreadystatechange = (this.onEvent.bind(this));
                this.xhr.onerror = (this.onerror.bind(this));
                this.xhr.open('HEAD', url, true);
                this.xhr.send();
            }));
        }
        static GetItem() {
            if (this.pool.length > 0) {
                return this.pool.shift();
            }
            else {
                if (this.currNum < this.MaxNum) {
                    this.currNum++;
                    return new HRHead();
                }
                else {
                    return null;
                }
            }
        }
        static RecoverItem(item) {
            if (this.wait.length > 0) {
                let waitItem = this.wait.shift();
                item.Request(waitItem.url, waitItem.callback, waitItem.callbackObj);
            }
            else {
                if (this.pool.indexOf(item) == -1) {
                    this.pool.push(item);
                }
            }
        }
        static RequestSize(url, callback, callbackObj) {
            let item = this.GetItem();
            if (item) {
                item.Request(url, callback, callbackObj);
            }
            else {
                this.wait.push({ url: url, callback: callback, callbackObj: callbackObj });
            }
        }
    }
    HRHead.MaxNum = 2;
    HRHead.currNum = 0;
    HRHead.pool = [];
    HRHead.wait = [];

    var Handler$2 = Laya.Handler;
    class HRange {
        get blockInfo() {
            return "block_" + this.block.index + ", sendIndex=" + this.block.sendIndex;
        }
        onreadystatechange(e) {
            if (!this.block) {
                return;
            }
            if (this.xhr.readyState >= XMLHttpRequest.LOADING) {
                if (this.xhr.response) {
                    this.block.responseList[this.block.sendIndex] = this.xhr.response;
                }
            }
            if (this.xhr.readyState == 4) {
                if (this.xhr.status >= 200 && this.xhr.status < 300 || this.xhr.response) {
                    this.OnEnd();
                }
                else {
                    console.error(this.blockInfo, "HRange 请求文件失败", " readyState=" + this.xhr.readyState, " status=" + this.xhr.status, "response=", this.xhr.response, this.block.fileTask.url);
                }
            }
        }
        onprogress(e) {
            this.block.progressList[this.block.sendIndex] = e.loaded;
            this.block.fileTask.OnPorgess(e.loaded, e.total);
        }
        onabort() {
            console.warn(this.blockInfo, "onabort");
            this.OnEnd(true);
        }
        onerror(e) {
            console.warn(this.blockInfo, e, this.block.fileTask.url);
            Laya.timer.frameOnce(10, this, this.Send, [true]);
        }
        OnEnd(isAbort) {
            this.block.OnEnd(isAbort);
            this.block = null;
            this.xhr.abort();
            HttpRequestRangePool.RecoverItem(this.xhr);
            this.xhr = null;
            HRange.RecoverItem(this);
        }
        Send(isError) {
            var block = this.block;
            if (isError) {
                if (!block.responseList[block.sendIndex]) {
                    block.progressList[block.sendIndex] = 0;
                }
                else {
                    block.sendIndex++;
                }
            }
            this.xhr.abort();
            this.xhr.responseType = block.fileTask.responseType;
            this.xhr.open("get", block.fileTask.url, true);
            if (this.block.end <= 0) {
                this.xhr.setRequestHeader("Range", `bytes=0- `);
            }
            else {
                this.xhr.setRequestHeader("Range", `bytes=${block.rangeBegin}-${block.end}`);
            }
            this.xhr.setRequestHeader("content-type", "application/octet-stream");
            this.xhr.send();
        }
        Request(block, isError) {
            block.sendIndex++;
            this.block = block;
            HttpRequestRangePool.Request(Handler$2.create(this, (xhr) => {
                this.xhr = xhr;
                this.xhr.onreadystatechange = (this.onreadystatechange.bind(this));
                this.xhr.onprogress = (this.onprogress.bind(this));
                this.xhr.onerror = (this.onerror.bind(this));
                this.Send();
            }));
        }
        Abort() {
            this.xhr.abort();
        }
        static GetItem() {
            if (this.pool.length > 0) {
                return this.pool.shift();
            }
            else {
                if (this.currNum < this.MaxNum) {
                    this.currNum++;
                    return new HRange();
                }
                else {
                    return null;
                }
            }
        }
        static RecoverItem(item) {
            if (this.wait.length > 0) {
                let waitItem = this.wait.shift();
                item.Request(waitItem);
            }
            else {
                if (this.pool.indexOf(item) == -1) {
                    this.pool.push(item);
                }
            }
        }
        static Request(bolck) {
            let item = this.GetItem();
            if (item) {
                item.Request(bolck);
            }
            else {
                this.wait.push(bolck);
            }
        }
    }
    HRange.MaxNum = 2;
    HRange.currNum = 0;
    HRange.pool = [];
    HRange.wait = [];

    class FileTask {
        constructor() {
            this.responseType = "";
            this.isEndRecoverBlockList = false;
            this.isEndRecover = false;
            this.blockList = [];
            this.blockEndCount = 0;
            this.loadedSize = 0;
            this.loadedRate = 0;
        }
        RequestSize() {
            HRHead.RequestSize(this.url, this.OnGetSize, this);
        }
        OnGetSize(error, fileSize, url) {
            this.totalSize = fileSize;
            this.SpliteBlock();
            this.RequestBlocksList();
        }
        RequestBlocksList() {
            this.blockEndCount = 0;
            for (var block of this.blockList) {
                if (block.isComplete) {
                    this.blockEndCount++;
                }
                else {
                    HRange.Request(block);
                }
            }
            if (this.blockEndCount >= this.blockList.length) {
                this.onEnd();
            }
        }
        SpliteBlock() {
            var size = this.totalSize;
            var ProcessorCount = FileTask.MaxBlockNum;
            var singleTmpFileSize = FileTask.singleTmpFileSize;
            var blockList = this.blockList;
            var blockSize = Math.floor(size / ProcessorCount);
            var modSize = this.totalSize % ProcessorCount;
            var block;
            if (size < singleTmpFileSize || size <= 0) {
                block = FileBlock.PoolGetItem();
                block.fileTask = this;
                block.index = 0;
                block.begin = 0;
                if (size <= 0) {
                    block.end = -1;
                }
                else {
                    block.end = size - 1;
                }
                blockList.push(block);
            }
            else {
                for (var i = 0; i < ProcessorCount; i++) {
                    block = FileBlock.PoolGetItem();
                    block.fileTask = this;
                    block.index = i;
                    block.begin = i * blockSize;
                    block.end = (i + 1) * blockSize - 1;
                    if (i == ProcessorCount - 1) {
                        block.end += modSize;
                    }
                    blockList.push(block);
                }
            }
        }
        Start(url, responseType = "arraybuffer") {
            this.url = url;
            this.responseType = responseType;
            this.RequestSize();
        }
        OnBlockEnd(block) {
            this.blockEndCount++;
            if (this.blockEndCount >= this.blockList.length) {
                this.onEnd();
            }
        }
        onEnd() {
            this.Merge();
            Laya.Loader.cacheRes(this.path, this.response);
            if (this.onCompleteHandler) {
                if (this.callbackObj) {
                    this.onCompleteHandler.call(this.callbackObj, this.response, this.path);
                }
                else {
                    this.onCompleteHandler(this.response, this.path);
                }
            }
            if (this.isEndRecoverBlockList) {
                this.RecoverBlockList();
            }
            if (this.isEndRecover) {
                this.PoolRecoverItem();
            }
        }
        RecoverBlockList() {
            for (var i = 0, len = this.blockList.length; i < len; i++) {
                var block = this.blockList[i];
                FileBlock.PoolRecoverItem(block);
            }
            this.blockList.length = 0;
        }
        Merge() {
            if (this.responseType == "arraybuffer" || this.responseType == "moz-chunked-arraybuffer" || this.responseType == "ms-stream") {
                this.MergeArrayBuffer();
            }
            else {
                this.MergeText();
            }
        }
        MergeArrayBuffer() {
            if (this.blockList.length == 1 && this.blockList[0].responseList.length == 1) {
                this.response = this.blockList[0].responseList[0];
            }
            else {
                var arr = new ArrayBuffer(this.totalSize);
                var buff = new Int8Array(arr);
                for (var i = 0, len = this.blockList.length; i < len; i++) {
                    var block = this.blockList[i];
                    block.MergeToBuff(buff);
                }
                this.response = arr;
            }
        }
        MergeText() {
            if (this.blockList.length == 1 && this.blockList[0].responseList.length == 1) {
                this.response = this.blockList[0].responseList[0];
            }
            else {
                var arr = [];
                for (var i = 0, len = this.blockList.length; i < len; i++) {
                    var block = this.blockList[i];
                    arr.push(...block.responseList);
                }
                this.response = arr.join();
            }
        }
        PoolRecoverItem() {
            this.url = null;
            this.totalSize = 0;
            this.loadedSize = 0;
            this.loadedRate = 0;
            this.responseType = "";
            this.response = null;
            this.isEndRecoverBlockList = false;
            this.isEndRecover = false;
            this.RecoverBlockList();
            this.blockEndCount = 0;
            this.onCompleteHandler = null;
            this.callbackObj = null;
            FileTask.RecoverItem(this);
        }
        OnPorgess(loadedSize, totalSize) {
            if (this.totalSize > 0) {
                this.loadedSize = 0;
                for (var i = 0, len = this.blockList.length; i < len; i++) {
                    this.loadedSize += this.blockList[i].loadedSize;
                }
                if (this.loadedSize > 0) {
                    this.loadedRate = this.loadedSize / this.totalSize;
                }
            }
            else {
                this.loadedSize = loadedSize;
                this.totalSize = totalSize;
                this.loadedRate = this.loadedSize / this.totalSize;
            }
            if (this.onProgresssHandler) {
                if (this.callbackObj) {
                    this.onProgresssHandler.call(this.callbackObj, this.loadedRate);
                }
                else {
                    this.onProgresssHandler(this.loadedRate);
                }
            }
        }
        static GetItem() {
            if (this.pool.length > 0) {
                return this.pool.shift();
            }
            else {
                return new FileTask();
            }
        }
        static RecoverItem(item) {
            if (this.pool.indexOf(item) == -1) {
                this.pool.push(item);
            }
        }
        static Request(path, onCompleteHandler, onProgresssHandler, callbackObj, responseType = "arraybuffer", isEndRecoverBlockList = true, isEndRecover = true) {
            var res = Laya.Loader.getRes(path);
            if (res) {
                if (onCompleteHandler) {
                    if (callbackObj) {
                        onCompleteHandler.call(callbackObj, res, path);
                    }
                    else {
                        onCompleteHandler(res, path);
                    }
                }
                return;
            }
            var url = Laya.URL.formatURL(path);
            let item = this.GetItem();
            item.path = path;
            item.onCompleteHandler = onCompleteHandler;
            item.onProgresssHandler = onProgresssHandler;
            item.callbackObj = callbackObj;
            item.isEndRecoverBlockList = isEndRecoverBlockList;
            item.isEndRecover = isEndRecover;
            item.Start(url, responseType);
            return item;
        }
        static RequestList(pathList, completeHandler, progressHandler) {
            let len = pathList.length;
            if (len == 0) {
                if (completeHandler) {
                    completeHandler.runWith(true);
                }
                return;
            }
            if (progressHandler) {
                progressHandler.runWith(0);
            }
            let loadedNum = 0;
            let onItemComplete = () => {
                loadedNum++;
                if (progressHandler) {
                    progressHandler.runWith(loadedNum / len);
                }
                if (loadedNum >= len) {
                    if (completeHandler) {
                        completeHandler.runWith(true);
                    }
                }
            };
            let maxRate = 0;
            let onItemProgerss = (rate) => {
                if (len == 1) {
                    if (progressHandler) {
                        maxRate = Math.max(rate, maxRate);
                        progressHandler.runWith(maxRate);
                    }
                }
            };
            for (var i = 0; i < len; i++) {
                var url = pathList[i];
                var task = this.Request(url, onItemComplete, onItemProgerss, null, "arraybuffer", true, true);
            }
        }
    }
    FileTask.MaxBlockNum = 2;
    FileTask.singleTmpFileSize = 1024 * 1024 * 5;
    FileTask.pool = [];
    window['FileTask'] = FileTask;
    window['FileBlock'] = FileBlock;
    window['HRHead'] = HRHead;
    window['HRange'] = HRange;
    FileTask.MaxBlockNum = 5;
    FileTask.singleTmpFileSize = 1024 * 1024 * 5;
    HRHead.MaxNum = 5;
    HRange.MaxNum = 5;

    class JsZipAsync {
        static loadPath(path, type, callback) {
            var isUseLaya = false;
            if (path.indexOf("res3d/") != -1) {
                if (path.indexOf("Effect_100") != -1 || path.indexOf("Hero_100") != -1) {
                    isUseLaya = true;
                }
            }
            if (!isUseLaya) {
                FileTask.Request(path, (res, url) => {
                    if (ZipManager.Instance.zipMap.has(path)) {
                        let zip = ZipManager.Instance.zipMap.get(path);
                        callback.runWith(zip);
                        return;
                    }
                    JSZip.loadAsync(res).then((zip) => {
                        callback.runWith(zip);
                    }).catch((error) => {
                        console.error(error, path);
                        callback.runWith(null);
                    });
                });
            }
            else {
                Laya.loader.load(path, Laya.Handler.create(null, (res) => {
                    if (ZipManager.Instance.zipMap.has(path)) {
                        let zip = ZipManager.Instance.zipMap.get(path);
                        callback.runWith(zip);
                        return;
                    }
                    JSZip.loadAsync(res).then((zip) => {
                        callback.runWith(zip);
                    }).catch((error) => {
                        console.error(error, path);
                        callback.runWith(null);
                    });
                }), null, type);
            }
        }
        static read(zip, path, type, callback) {
            zip.file(path).async(type).then((data) => {
                callback.runWith(data);
            }).catch((error) => {
                console.error(error, path);
                callback.runWith(null);
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

    class LayaExtends_LoaderManager {
        constructor() {
            this._loaderCount = 0;
        }
        static InitCode() {
            new LayaExtends_LoaderManager().InitCode();
        }
        InitCode() {
            var LoaderManager = Laya.LoaderManager;
            LoaderManager.prototype.src_load = LoaderManager.prototype.load;
            LoaderManager.prototype.load = this.load;
            LoaderManager.prototype.__loadWaitZipAsync = this.__loadWaitZipAsync;
            LoaderManager.prototype.src_createLoad = LoaderManager.prototype._createLoad;
            LoaderManager.prototype._createLoad = this._createLoad;
            LoaderManager.prototype.___createLoadWaitZipAsync = this.___createLoadWaitZipAsync;
        }
        src_createLoad(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true, ignoreCache = false) {
            return this;
        }
        _createLoad(url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true, ignoreCache = false) {
            let manifestHas = false;
            let zipHas = false;
            let zipPath;
            let zipManager;
            if (ZipManager.enable && !(url instanceof Array)) {
                zipManager = ZipManager.Instance;
                manifestHas = zipManager.manifest.HasAssetByPath(url);
                if (manifestHas) {
                    zipPath = zipManager.GetAssetZipPathByAssetUrl(url);
                    zipHas = zipManager.HasZip(zipPath);
                }
            }
            if (!manifestHas || zipHas) {
                return this.src_createLoad(url, complete, progress, type, constructParams, propertyParams, priority, cache, ignoreCache);
            }
            this.___createLoadWaitZipAsync(zipPath, url, complete, progress, type, constructParams, propertyParams, priority, cache, ignoreCache);
            return this;
        }
        async ___createLoadWaitZipAsync(zipPath, url, complete = null, progress = null, type = null, constructParams = null, propertyParams = null, priority = 1, cache = true, ignoreCache = false) {
            ZipManager.Instance.GetZip(zipPath, Handler.create(this, () => {
                this._loaderCount--;
                var myComplete = Handler.create(this, (data) => {
                    this._loaderCount++;
                    if (complete) {
                        complete.runWith(data);
                    }
                });
                this.src_createLoad(url, myComplete, progress, type, constructParams, propertyParams, priority, cache, ignoreCache);
            }));
            return this;
        }
        src_load(url, complete = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = Laya.WorkerLoader.enable) {
            return this;
        }
        load(url, complete = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = Laya.WorkerLoader.enable) {
            let manifestHas = false;
            let zipHas = false;
            let zipPath;
            let zipManager;
            if (ZipManager.enable && !(url instanceof Array)) {
                zipManager = ZipManager.Instance;
                manifestHas = zipManager.manifest.HasAssetByPath(url);
                if (manifestHas) {
                    zipPath = zipManager.GetAssetZipPathByAssetUrl(url);
                    zipHas = zipManager.HasZip(zipPath);
                }
            }
            if (!manifestHas || zipHas) {
                return this.src_load(url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
            }
            this.__loadWaitZipAsync(zipPath, url, complete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
            return this;
        }
        async __loadWaitZipAsync(zipPath, url, complete = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = Laya.WorkerLoader.enable) {
            ZipManager.Instance.GetZip(zipPath, Handler.create(this, () => {
                this._loaderCount--;
                var myComplete = Handler.create(this, (data) => {
                    this._loaderCount++;
                    if (complete) {
                        complete.runWith(data);
                    }
                });
                this.src_load(url, myComplete, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
            }));
            return this;
        }
    }

    class LayaExtends_Resouces {
        static InitCode() {
            new LayaExtends_Resouces().InitCode();
        }
        InitCode() {
            var Resource = Laya.Resource;
            Resource.prototype.src_destroy = Resource.prototype.destroy;
            Resource.prototype.destroy = this.destroy;
        }
        src_destroy() {
        }
        destroy() {
            this.src_destroy();
            if (ZipManager.enable) {
                if (this._url) {
                    ZipManager.Instance.OnClearResouceAsset(this._url);
                }
            }
        }
    }

    class WaitCallbackList {
        constructor() {
            this.list = [];
        }
        add(handler) {
            this.list.push(handler);
        }
        run() {
            for (var item of this.list) {
                item.run();
            }
        }
        runWith(data) {
            for (var item of this.list) {
                item.runWith(data);
            }
        }
        clear() {
            this.list.length = 0;
            this.key = null;
        }
        static Get(key) {
            if (this.map.has(key)) {
                return this.map.get(key);
            }
        }
        static GetOrCreate(key) {
            if (this.map.has(key)) {
                return this.map.get(key);
            }
            var item = Laya.Pool.createByClass(WaitCallbackList);
            item.key = key;
            this.map.set(key, item);
            return item;
        }
        static Add(key, handler) {
            var item = this.GetOrCreate(key);
            item.add(handler);
        }
        static Recover(key, item) {
            item.clear();
            this.map.delete(key);
            Laya.Pool.recoverByClass(item);
        }
        static Run(key) {
            var item = this.Get(key);
            if (item) {
                item.run();
                this.Recover(key, item);
            }
            else {
                console.warn("WaitCallbackList没有这个的监听了", key);
            }
        }
        static RunWith(key, data) {
            var item = this.Get(key);
            if (item) {
                item.runWith(data);
                this.Recover(key, item);
            }
            else {
                console.warn("WaitCallbackList没有这个的监听了", key);
            }
        }
    }
    WaitCallbackList.map = new Map();

    var Handler$3 = Laya.Handler;
    class ZipManager {
        constructor() {
            this.zipExt = ".zip";
            this.zipExtName = "zip";
            this.srcRootPath = "res3d/Conventional/";
            this.zipRootPath = "";
            this.isPve01 = false;
            this.enablePve01 = false;
            this.resourceVersionManifestReverse = new Map();
            this.zipMap = new Map();
            this.assetMap = new Map();
            this.assetReferenceMap = new Map();
            this.zipUseAssetMap = new Map();
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
        get manifest() {
            if (this.enablePve01 && this.isPve01) {
                return this.manifestPve01;
            }
            return this._manifest;
        }
        async InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt, isReplace) {
            if (this._manifest && !isReplace) {
                console.log("已经初始了Zip资源清单");
                return;
            }
            if (zipExt) {
                this.zipExt = zipExt;
                this.zipExtName = zipExt.replace('.', '');
            }
            await AssetManifest.InitAsync(manifestPath, srcRootPath, zipRootPath, zipExt);
            this._manifest = AssetManifest.Instance;
            this.srcRootPath = srcRootPath;
            this.zipRootPath = zipRootPath;
            ZipManager.enable = true;
            this.InitCode();
            this.InitResourceVersion();
        }
        async InitPVE01(pve01manifestPath) {
            this.manifestPve01 = await AssetManifest.LoadAsync(pve01manifestPath, this.srcRootPath, this.zipRootPath, this.zipExt);
            this.enablePve01 = true;
        }
        InitCode() {
            if (ZipManager.isInitCode) {
                return;
            }
            ZipManager.isInitCode = true;
            LayaExtends_Loader.InitCode();
            LayaExtends_LoaderManager.InitCode();
            LayaExtends_Resouces.InitCode();
        }
        InitResourceVersion() {
            this.resourceVersionManifestReverse.clear();
            let manifest = Laya.ResourceVersion.manifest;
            for (let path in manifest) {
                let pathVer = manifest[path];
                this.resourceVersionManifestReverse.set(pathVer, path);
            }
        }
        GetZipUseAssetMap(zipPath, isCreate) {
            if (this.zipUseAssetMap.has(zipPath)) {
                return this.zipUseAssetMap.get(zipPath);
            }
            else {
                if (isCreate) {
                    var m = new Map();
                    this.zipUseAssetMap.set(zipPath, m);
                    return m;
                }
                return null;
            }
        }
        AddZipUseAsset(zipPath, assetPath) {
            var m = this.GetZipUseAssetMap(zipPath, true);
            var num = m.getValueOrDefault(zipPath) + 1;
            m.set(assetPath, num);
        }
        RemoveZipUseAsset(zipPath, assetPath) {
            var m = this.GetZipUseAssetMap(zipPath, true);
            var num = m.getValueOrDefault(zipPath) - 1;
            if (num <= 0) {
                m.delete(assetPath);
            }
            else {
                m.set(assetPath, num);
            }
        }
        AddAssetReference(assetPath, count = 1) {
            if (this.assetReferenceMap.has(assetPath)) {
                this.assetReferenceMap.set(assetPath, this.assetReferenceMap.get(assetPath) + count);
            }
            else {
                this.assetReferenceMap.set(assetPath, count);
            }
        }
        RemoveAssetReference(assetPath, count = 1) {
            if (this.assetReferenceMap.has(assetPath)) {
                this.assetReferenceMap.set(assetPath, this.assetReferenceMap.get(assetPath) - count);
            }
        }
        GetAssetReference(assetPath) {
            if (this.assetReferenceMap.has(assetPath)) {
                return this.assetReferenceMap.get(assetPath);
            }
            return 0;
        }
        OnClearResouceAsset(assetUrl) {
            let assetPath = this.AssetUrlToPath(assetUrl);
            this.RemoveAssetReference(assetPath);
        }
        DestroyUnusedAssets() {
            this.assetReferenceMap.forEach((referenceCount, assetPath) => {
                if (referenceCount <= 0 && this.assetMap.has(assetPath)) {
                    var assetData = this.assetMap.get(assetPath);
                    this.assetMap.delete(assetPath);
                    let assetName = this.manifest.GetAssetNameByPath(assetPath);
                    let zipPath = this.manifest.GetAssetZipPath(assetName);
                    this.RemoveZipUseAsset(zipPath, assetPath);
                }
            });
            this.DestroyUnusedZip();
        }
        DestroyUnusedZip() {
            this.zipUseAssetMap.forEach((infoMap, zipPath) => {
                if (infoMap.size == 0) {
                    if (this.zipMap.has(zipPath)) {
                        var zip = this.zipMap.get(zipPath);
                        this.zipMap.delete(zipPath);
                    }
                }
            });
        }
        PrintAssetReferenceMap() {
            this.assetReferenceMap.forEach((count, assetName) => {
                console.log(assetName, count);
            });
        }
        HasZip(zipPath) {
            return this.zipMap.has(zipPath);
        }
        HasAsset(assetUrl) {
            let assetPath = this.AssetUrlToPath(assetUrl);
            return this.assetMap.has(assetPath);
        }
        GetAssetZipPathByAssetUrl(assetUrl) {
            let assetName = this.AssetUrlToName(assetUrl);
            let zipPath = this.manifest.GetAssetZipPath(assetName);
            return zipPath;
        }
        AssetUrlToPath(url) {
            if (window['AssetUrlCache']) {
                var path = AssetUrlCache.GetPath(url);
                if (path) {
                    return path;
                }
            }
            let verPath = url.replace(Laya.URL.basePath, "");
            if (this.resourceVersionManifestReverse.has(verPath)) {
                return this.resourceVersionManifestReverse.get(verPath);
            }
            else {
                return verPath;
            }
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
        GetZip(zipPath, callback) {
            var zip;
            if (this.zipMap.has(zipPath)) {
                zip = this.zipMap.get(zipPath);
                callback.runWith(zip);
            }
            else {
                WaitCallbackList.Add(zipPath, callback);
                if (WaitCallbackList.Get(zipPath).list.length == 1) {
                    JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, Handler$3.create(this, (zip) => {
                        if (zip) {
                            this.zipMap.set(zipPath, zip);
                        }
                        WaitCallbackList.RunWith(zipPath, zip);
                    }));
                }
            }
        }
        HasManifestAssetByUrl(url) {
            var assetPath = this.AssetUrlToPath(url);
            return this.manifest.HasAssetByPath(assetPath);
        }
        GetAssetData(url) {
            var assetPath = this.AssetUrlToPath(url);
            if (!this.manifest.HasAssetByPath(assetPath)) {
                return null;
            }
            var data;
            let type = this.manifest.GetEnumZipAssetDataType(assetPath);
            if (type == EnumZipAssetDataType.base64) {
                this.loadImageCount++;
            }
            if (this.assetMap.has(assetPath)) {
                data = this.assetMap.get(assetPath);
                this.AddAssetReference(assetPath);
            }
            return data;
        }
        GetOrLoadAssetData(url, callback) {
            var assetPath = this.AssetUrlToPath(url);
            if (!this.manifest.HasAssetByPath(assetPath)) {
                callback.runWith(null);
                return;
            }
            var data;
            let type = this.manifest.GetEnumZipAssetDataType(assetPath);
            if (type == EnumZipAssetDataType.base64) {
                this.loadImageCount++;
            }
            if (this.assetMap.has(assetPath)) {
                data = this.assetMap.get(assetPath);
                this.AddAssetReference(assetPath);
                callback.runWith(data);
            }
            else {
                WaitCallbackList.Add(url, callback);
                if (WaitCallbackList.Get(url).list.length == 1) {
                    this.LoadAssetData(assetPath, Handler$3.create(this, (data) => {
                        var assetReferenceCount = this.GetAssetReference(assetPath);
                        if (assetReferenceCount > 0) {
                            console.error("ZipManager.GetAssetDataAsync 已经存在创建的资源了", assetPath, assetReferenceCount);
                        }
                        this.AddAssetReference(assetPath);
                        this.assetMap.set(assetPath, data);
                        WaitCallbackList.RunWith(url, data);
                    }));
                }
            }
        }
        LoadAssetData(assetPath, callback) {
            let assetName = this.manifest.GetAssetNameByPath(assetPath);
            let zipPath = this.manifest.GetAssetZipPath(assetName);
            let type = this.manifest.GetEnumZipAssetDataType(assetName);
            this.GetZip(zipPath, Handler$3.create(this, (zip) => {
                if (!zip) {
                    console.log("没有Zip", zipPath, assetPath);
                    callback.runWith(null);
                    return;
                }
                JsZipAsync.read(zip, assetName, type, Handler$3.create(this, (data) => {
                    if (data == null) {
                        console.log("zip读取资源失败", zipPath, assetPath);
                        callback.runWith(null);
                        return;
                    }
                    switch (type) {
                        case EnumZipAssetDataType.string:
                            data = JSON.parse(data);
                            break;
                        case EnumZipAssetDataType.base64:
                            data = "data:image/png;base64," + data;
                            this.imageCount++;
                            break;
                    }
                    this.AddZipUseAsset(zipPath, assetPath);
                    callback.runWith(data);
                }));
            }));
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
                        JsZipAsync.loadPath(zipPath, Laya.Loader.BUFFER, Handler$3.create(this, (zip) => {
                            this.zipMap.set(zipPath, zip);
                            loadNum++;
                            progerssFun(loadNum, loadTotal, zipPath);
                            if (loadNum >= loadTotal) {
                                resolve();
                            }
                        }));
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
                        JsZipAsync.read(zip, assetName, type, Handler$3.create(this, (data) => {
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
                            var assetReferenceCount = this.GetAssetReference(assetPath);
                            if (assetReferenceCount > 0) {
                                console.error("ZipManager.ReadAllZipAsync asset 已经存在创建的资源了", assetPath, assetReferenceCount);
                            }
                            this.assetMap.set(assetPath, data);
                            progerssFun(assetNameLoadedCount, assetNameTotal, zipPath);
                            subProgerssFun(j, jLen, assetName);
                            if (assetNameLoadedCount >= assetNameTotal) {
                                AsyncUtil.ResolveDelayCall(resolve);
                            }
                        }));
                    }
                }
            });
        }
        async GetZipAsync(zipPath) {
            return new Promise((resolve) => {
                this.GetZip(zipPath, Handler$3.create(this, (zip) => {
                    resolve(zip);
                }));
            });
        }
        async GetOrLoadAssetDataAsync(url) {
            return new Promise((resolve) => {
                this.GetOrLoadAssetData(url, Handler$3.create(this, (data) => {
                    resolve(data);
                }));
            });
        }
    }
    ZipManager.enable = false;
    ZipManager.isInitCode = false;
    window['ZipManager'] = ZipManager;

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
            this.src_onError(message);
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

    var Handler$4 = Laya.Handler;
    class PreloadZipList {
        constructor(zipPathList, assetPathList) {
            this.assetPathList = [];
            this.maxLoader = 2;
            this.isStop = false;
            this.total = 0;
            this.loadIndex = 0;
            this.unzipIndex = 0;
            this.loadZipIndex = 0;
            this.loadedZipIndex = 0;
            this.loadZipOnceNum = 10;
            this.zipPathList = zipPathList;
            this.assetPathList = assetPathList;
            this.loadIndex = 0;
            this.unzipIndex = 0;
            this.total = zipPathList.length;
            this.maxLoader = Laya.loader.maxLoader - 1;
            this.maxLoader = Math.max(this.maxLoader, 2);
        }
        get IsWait() {
            return Laya.loader._loaderCount >= this.maxLoader;
        }
        async StartAsync() {
            this.isStop = false;
            await this.LoadListAsync();
            await this.UnzipListAsync();
        }
        Start(completeHandler, progressHandler) {
            if (this.total == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            let time = Laya.timer.currTimer;
            this.LoadList(Handler$4.create(this, () => {
                console.log("加载Zip完成", Laya.timer.currTimer - time);
                let time2 = Laya.timer.currTimer;
                this.LoadZipList(Handler$4.create(this, () => {
                    console.log("装载Zip完成", Laya.timer.currTimer - time2);
                    let time3 = Laya.timer.currTimer;
                    this.UnzipList(Handler$4.create(this, () => {
                        console.log("解压zip完成", Laya.timer.currTimer - time3);
                        console.log("加载总费时", Laya.timer.currTimer - time);
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }), Handler$4.create(this, (progress) => {
                        if (progressHandler)
                            progressHandler.runWith(progress * 0.3 + 0.7);
                    }, null, false));
                }), Handler$4.create(this, (progress) => {
                    if (progressHandler)
                        progressHandler.runWith(progress * 0.2 + 0.5);
                }, null, false));
            }), Handler$4.create(this, (progress) => {
                if (progressHandler)
                    progressHandler.runWith(progress * 0.5);
            }, null, false));
        }
        Stop() {
            this.isStop = true;
        }
        LoadList(completeHandler, progressHandler) {
            if (this.total == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            this.LoadList2(Handler$4.create(this, (result) => {
                if (result == false) {
                    Laya.timer.frameOnce(30, this, () => {
                        this.LoadList(completeHandler);
                    });
                }
                else {
                    if (progressHandler) {
                        progressHandler.runWith(1);
                        progressHandler.recover();
                    }
                    if (completeHandler)
                        completeHandler.runWith(result);
                }
            }), progressHandler);
        }
        LoadList2(completeHandler, progressHandler) {
            FileTask.RequestList(this.zipPathList, completeHandler, progressHandler);
        }
        LoadZipList(completeHandler, progressHandler) {
            if (this.total == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            var index = 0;
            var len = this.zipPathList.length;
            for (var i = 0; i < len; i++) {
                ZipManager.Instance.GetZip(this.zipPathList[this.loadZipIndex], Handler$4.create(this, () => {
                    index++;
                    if (progressHandler)
                        progressHandler.runWith(index / this.total);
                    if (index >= this.total) {
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }
                }));
            }
        }
        LoadZipOnce(completeHandler, progressHandler) {
            for (let i = 0; i < this.loadZipOnceNum; i++) {
                ZipManager.Instance.GetZip(this.zipPathList[this.loadZipIndex], Handler$4.create(this, () => {
                    this.loadedZipIndex++;
                    if (progressHandler)
                        progressHandler.runWith(this.loadedZipIndex / this.total);
                    if (this.loadedZipIndex >= this.total) {
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }
                }));
                this.loadZipIndex++;
                if (this.loadZipIndex >= this.total) {
                    break;
                }
            }
            if (this.loadZipIndex >= this.total) {
                return;
            }
            Laya.timer.frameOnce(1, this, this.LoadZipOnce, [completeHandler, progressHandler]);
        }
        UnzipList(completeHandler, progressHandler) {
            var index = 0;
            var len = this.assetPathList.length;
            if (this.total == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            for (let i = 0; i < len; i++) {
                let assetPath = this.assetPathList[i];
                ZipManager.Instance.GetOrLoadAssetData(assetPath, Handler$4.create(this, () => {
                    index++;
                    if (progressHandler)
                        progressHandler.runWith(index / len);
                    if (index >= len) {
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }
                }));
            }
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
            let onceNum = 5;
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
                        ZipManager.Instance.GetOrLoadAssetDataAsync(assetPath);
                    }
                    else {
                        await ZipManager.Instance.GetOrLoadAssetDataAsync(assetPath);
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
            this.maxLoader = Laya.loader.maxLoader - 1;
            this.maxLoader = Math.max(this.maxLoader, 2);
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
        LoadList(completeHandler, progressHandler) {
            if (this.total == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            var time = Laya.timer.currTimer;
            var loadedIndex = 0;
            for (let i = 0; i < this.total; i++) {
                let assetPath = this.assetPathList[i];
                Laya.loader.create(assetPath, Laya.Handler.create(null, (res) => {
                    loadedIndex++;
                    if (progressHandler)
                        progressHandler.runWith(loadedIndex / this.total);
                    if (loadedIndex >= this.total) {
                        console.log("加载预设完成", Laya.timer.currTimer - time);
                        if (completeHandler)
                            completeHandler.run();
                    }
                }));
            }
        }
        async LoadListAsync() {
            if (this.total == 0) {
                return;
            }
            let onceNum = 5;
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
                        AsyncUtil.Load3D(assetPath);
                    }
                    else {
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

    var Handler$5 = Laya.Handler;
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
        LoadPrefabList2(resIdList, isLoadPrefab = true, completeHandler, progressHandler) {
            this.StopPreload();
            let len = resIdList.length;
            if (len == 0) {
                if (completeHandler)
                    completeHandler.run();
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
                if (!manifest.HasAssetByPath(assetPath)) {
                    console.warn("Zip 文件清单中不存在资源", assetPath);
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
                prefabAssetPathList.push(assetPath);
            }
            let assetNameList = ZipManager.Instance.AssetPathListToAssetNameList(prefabAssetPathList);
            let zipPathList = manifest.GetAssetListDependencieZipPathList(assetNameList);
            this.preloadZip = new PreloadZipList(zipPathList, assetPathList);
            this.preloadAsset = new PreloadAssetList(prefabAssetPathList);
            this.preloadZip.Start(Handler$5.create(this, () => {
                if (isLoadPrefab) {
                    this.preloadAsset.LoadList(Handler$5.create(this, () => {
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }), Handler$5.create(this, (progress) => {
                        if (progressHandler)
                            progressHandler.runWith(progress * 0.3 + 0.7);
                    }, null, false));
                }
                else {
                    if (progressHandler)
                        progressHandler.recover();
                    if (completeHandler)
                        completeHandler.run();
                }
            }), Handler$5.create(this, (progress) => {
                if (isLoadPrefab) {
                    if (progressHandler)
                        progressHandler.runWith(progress * 0.7);
                }
                else {
                    if (progressHandler)
                        progressHandler.runWith(progress);
                }
            }, null, false));
        }
        LoadPrefabList(pathList, prefabAssetPathList, isLoadPrefab = true, completeHandler, progressHandler) {
            this.StopPreload();
            let len = pathList.length;
            if (len == 0) {
                if (completeHandler)
                    completeHandler.run();
                return;
            }
            var manifest = ZipManager.Instance.manifest;
            var assetPathList = [];
            var tmpMap = new Map();
            for (let assetPath of pathList) {
                tmpMap.set(assetPath, true);
                assetPathList.push(assetPath);
            }
            for (let assetPath of pathList) {
                let item = Laya.Loader.getRes(assetPath);
                if (item) {
                    continue;
                }
                if (!manifest.HasAssetByPath(assetPath)) {
                    console.warn("Zip 文件清单中不存在资源", assetPath);
                    continue;
                }
                let dependencieAssetPathList = manifest.GetAssetDependenciePathListByAssetPath(assetPath);
                if (!dependencieAssetPathList) {
                    continue;
                }
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
            }
            let assetNameList = ZipManager.Instance.AssetPathListToAssetNameList(prefabAssetPathList);
            let zipPathList = manifest.GetAssetListDependencieZipPathList(assetNameList);
            this.preloadZip = new PreloadZipList(zipPathList, assetPathList);
            this.preloadAsset = new PreloadAssetList(prefabAssetPathList);
            this.preloadZip.Start(Handler$5.create(this, () => {
                if (isLoadPrefab) {
                    this.preloadAsset.LoadList(Handler$5.create(this, () => {
                        if (progressHandler)
                            progressHandler.recover();
                        if (completeHandler)
                            completeHandler.run();
                    }), Handler$5.create(this, (progress) => {
                        if (progressHandler)
                            progressHandler.runWith(progress * 0.3 + 0.7);
                    }, null, false));
                }
                else {
                    if (progressHandler)
                        progressHandler.recover();
                    if (completeHandler)
                        completeHandler.run();
                }
            }), Handler$5.create(this, (progress) => {
                if (isLoadPrefab) {
                    if (progressHandler)
                        progressHandler.runWith(progress * 0.7);
                }
                else {
                    if (progressHandler)
                        progressHandler.runWith(progress);
                }
            }, null, false));
        }
    }
    window['PrefabManager'] = PrefabManager;

    window['AssetManifest'] = AssetManifest;
    window['AsyncUtil'] = AsyncUtil;
    window['JsZipAsync'] = JsZipAsync;
    window['ZipLoader'] = LayaExtends_Loader;
    window['ZipManager'] = ZipManager;
    window['PrefabManager'] = PrefabManager;
    window['DebugResources'] = DebugResources;

}());
//# sourceMappingURL=bundle.js.map
