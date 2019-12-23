"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function arrayRemoveItem(arr, item) {
    var i = arr.indexOf(item);
    if (i != -1) {
        arr.splice(i, 1);
        return true;
    }
    return false;
}
class AssetNode {
    constructor() {
        this.uid = 0;
        this.path = "";
        this.type = "";
        this.assetBundleName = "";
        this.parents = [];
        this.childs = [];
        this.assets = [];
        this.zipNameMap = new Map();
        this.uid = AssetNode.UID++;
    }
    /** 获取依赖列表 */
    GetDependencieUidList(assetUids, recursive = false) {
        if (this.type != AssetNode.TYPE_ZIP) {
            if (!assetUids.includes(this.uid)) {
                assetUids.push(this.uid);
            }
        }
        for (let item of this.assets) {
            if (!assetUids.includes(item.uid)) {
                assetUids.push(item.uid);
                if (recursive) {
                    item.GetDependencieUidList(assetUids, recursive);
                }
            }
        }
        for (let item of this.childs) {
            if (!assetUids.includes(item.uid)) {
                assetUids.push(item.uid);
                if (recursive) {
                    item.GetDependencieUidList(assetUids, recursive);
                }
            }
        }
    }
    AddAsset(node) {
        if (!this.assets.includes(node)) {
            this.assets.push(node);
            node.parents.push(this);
        }
    }
    AddDependencie(node) {
        if (!this.childs.includes(node)) {
            this.childs.push(node);
            node.parents.push(this);
        }
    }
    RemoveDependencie(node) {
        if (this.childs.includes(node)) {
            arrayRemoveItem(this.childs, node);
        }
        if (node.parents.includes(this)) {
            arrayRemoveItem(node.parents, this);
        }
    }
    ClearDependencie() {
        for (var i = this.childs.length - 1; i >= 0; i--) {
            var child = this.childs[i];
            this.RemoveDependencie(child);
        }
        for (var i = this.parents.length - 1; i >= 0; i--) {
            var parent = this.parents[i];
            parent.RemoveDependencie(this);
        }
    }
    ForcedSetRoot() {
        for (var i = this.parents.length - 1; i >= 0; i--) {
            var parent = this.parents[i];
            parent.RemoveDependencie(this);
        }
    }
    get assetCount() {
        return this.assets.length;
    }
    get childCount() {
        return this.childs.length;
    }
    get parentCount() {
        return this.parents.length;
    }
    get isRoot() {
        return this.parentCount == 0;
    }
    toString() {
        return `${this.path}   \t[parentCount=${this.parentCount},    childCount=${this.childCount},\t\tassetCount=${this.assetCount}]`;
    }
    /** 移除父节点的依赖和自己依赖相同的节点 */
    RemoveParentShare() {
        var list = this.childs.slice(0);
        for (var cnode of list) {
            for (var pnode of this.parents) {
                if (pnode.childs.includes(cnode)) {
                    pnode.RemoveDependencie(cnode);
                }
            }
            cnode.RemoveParentShare();
        }
    }
    /** 包含的资源 合并到 父亲节点 */
    MergeAssetToParent(pnode) {
        for (var node of this.assets) {
            pnode.assets.push(node);
            arrayRemoveItem(node.parents, this);
            if (!node.parents.includes(pnode)) {
                node.parents.push(pnode);
            }
        }
    }
    /** 入度为1的节点自动打包到上一级节点 */
    MergeParentCountOnce() {
        for (var i = this.childs.length - 1; i >= 0; i--) {
            var cnode = this.childs[i];
            cnode.MergeParentCountOnce();
            if (cnode.parentCount == 1) {
                // 子节点 变为 包含资源
                this.assets.push(cnode);
                arrayRemoveItem(this.childs, cnode);
                // 包含的资源 合并到 父亲节点
                cnode.MergeAssetToParent(this);
            }
        }
    }
    /** 获取Root列表 */
    GetRoots(dict) {
        if (this.isRoot) {
            if (!dict.has(this.path)) {
                dict.set(this.path, this);
            }
        }
        else {
            for (var i = 0; i < this.parents.length; i++) {
                this.parents[i].GetRoots(dict);
            }
        }
    }
    /** 过滤不需要打包的节点 */
    FilterDotNeedNode(needDict) {
        for (var i = this.childs.length - 1; i >= 0; i--) {
            var child = this.childs[i];
            child.FilterDotNeedNode(needDict);
        }
        if (!needDict.has(this.path)) {
            for (var i = this.parents.length - 1; i >= 0; i--) {
                var parent = this.parents[i];
                parent.RemoveDependencie(this);
            }
        }
        else {
            var needParentDict = new Map();
            this.GetNeedParentNodeList(needDict, needParentDict);
            needParentDict.forEach((v, k) => {
                v.AddDependencie(this);
            });
            for (var i = this.parents.length - 1; i >= 0; i--) {
                var parent = this.parents[i];
                if (!needParentDict.has(parent.path)) {
                    parent.RemoveDependencie(this);
                }
            }
        }
    }
    GetNeedParentNodeList(needDict, needParentDict) {
        for (var i = this.parents.length - 1; i >= 0; i--) {
            var parent = this.parents[i];
            if (needDict.has(parent.path)) {
                if (!needParentDict.has(parent.path)) {
                    needParentDict.set(parent.path, parent);
                }
            }
            else {
                parent.GetNeedParentNodeList(needDict, needParentDict);
            }
        }
    }
    GenerateAssetBundleNodesRoot(resourceRoot) {
        this.assetBundleName = AssetNode.GetZipName(this.path, resourceRoot);
    }
    static GetZipName(mypath, resourceRoot) {
        var zipName = mypath.replace(resourceRoot + "/", "").replace(/\//g, '___');
        zipName = zipName.split('.')[0];
        return zipName;
    }
    SetZip(root) {
        if (!this.zipNameMap.has(root.assetBundleName)) {
            this.zipNameMap.set(root.assetBundleName, root);
        }
        for (var node of this.assets) {
            node.SetZip(root);
        }
        for (var node of this.childs) {
            node.SetZip(root);
        }
    }
    GenerateAssetBundleNodes(bundleDict) {
        if (!bundleDict.has(this.path)) {
            bundleDict.set(this.path, this);
        }
        for (var node of this.childs) {
            node.GenerateAssetBundleNodes(bundleDict);
        }
    }
    GetTreeInfo(layout = 0, cprestr = "-- ", aprestr = "   ") {
        var cpre = "";
        var apre = "";
        for (var i = 0; i < layout; i++) {
            cpre += cprestr;
            apre += aprestr;
        }
        var str = "";
        if (layout == 0) {
            str += cpre + this + "\n";
        }
        layout++;
        cpre += cprestr;
        apre += aprestr;
        for (var i = 0; i < this.assets.length; i++) {
            str += apre + this.assets[i] + "\n";
            str += this.assets[i].GetTreeInfo(layout, cprestr);
        }
        for (var i = 0; i < this.childs.length; i++) {
            str += cpre + this.childs[i] + "\n";
            str += this.childs[i].GetTreeInfo(layout, cprestr);
        }
        return str;
    }
    PrintTreeInfo() {
        console.log(this.GetTreeInfo(0, "-- "));
    }
    static GetNodeTree(roots, destr = "") {
        // 打印信息树
        var str = "[" + destr + "]\n";
        for (var i = 0; i < roots.length; i++) {
            var node = roots[i];
            str += node.GetTreeInfo(0, "-- ");
            str += "========================\n\n";
        }
        return str;
    }
    static PrintNodeTree(roots, destr = "") {
        // 打印信息树
        var str = "[" + destr + "]\n";
        for (var i = 0; i < roots.length; i++) {
            var node = roots[i];
            str += node.GetTreeInfo(0, "-- ");
            str += "========================\n\n";
        }
        console.log(str);
    }
    static PrintNodeDict(dict, destr = "") {
        // 打印信息树
        var str = "[" + destr + "]\n";
        dict.forEach((v, k) => {
            str += v.toString() + "\n";
        });
        console.log(str);
    }
}
AssetNode.TYPE_ZIP = "ZIP";
AssetNode.UID = 10001;
exports.default = AssetNode;
