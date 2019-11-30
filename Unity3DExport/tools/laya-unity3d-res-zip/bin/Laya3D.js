"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const URL_1 = __importDefault(require("./URL"));
class Laya3D {
    static formatRelativePath(base, value) {
        var path;
        path = base + value;
        var char1 = value.charAt(0);
        if (char1 === ".") {
            var parts = path.split("/");
            for (var i = 0, len = parts.length; i < len; i++) {
                if (parts[i] == '..') {
                    var index = i - 1;
                    if (index > 0 && parts[index] !== '..') {
                        parts.splice(index, 2);
                        i -= 2;
                    }
                }
            }
            path = parts.join('/');
        }
        return path;
    }
    static _addHierarchyInnerUrls(urls, urlMap, urlVersion, hierarchyBasePath, path, type, constructParams = null, propertyParams = null) {
        var formatUrl = Laya3D.formatRelativePath(hierarchyBasePath, path);
        (urlVersion) && (formatUrl = formatUrl + urlVersion);
        urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
        urlMap.push(formatUrl);
        return formatUrl;
    }
    static _getSprite3DHierarchyInnerUrls(node, firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath) {
        var i, n;
        var props = node.props;
        switch (node.type) {
            case "Scene3D": //TODO:应该自动序列化类型
                var lightmaps = props.lightmaps;
                for (i = 0, n = lightmaps.length; i < n; i++) {
                    var lightMap = lightmaps[i];
                    lightMap.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightMap.path, Laya3D.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
                }
                var reflectionTextureData = props.reflectionTexture;
                (reflectionTextureData) && (props.reflectionTexture = Laya3D._addHierarchyInnerUrls(thirdLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionTextureData, Laya3D.TEXTURECUBE));
                if (props.sky) {
                    var skyboxMaterial = props.sky.material;
                    (skyboxMaterial) && (skyboxMaterial.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMaterial.path, Laya3D.MATERIAL));
                }
                break;
            case "Camera":
                var skyboxMatData = props.skyboxMaterial;
                (skyboxMatData) && (skyboxMatData.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMatData.path, Laya3D.MATERIAL));
                break;
            case "TrailSprite3D":
            case "MeshSprite3D":
            case "SkinnedMeshSprite3D":
                var meshPath = props.meshPath;
                (meshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, meshPath, Laya3D.MESH));
                var materials = props.materials;
                if (materials)
                    for (i = 0, n = materials.length; i < n; i++)
                        materials[i].path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, materials[i].path, Laya3D.MATERIAL);
                break;
            case "ShuriKenParticle3D":
                var parMeshPath = props.meshPath;
                (parMeshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, parMeshPath, Laya3D.MESH));
                props.material.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, props.material.path, Laya3D.MATERIAL);
                break;
            case "Terrain":
                Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, props.dataPath, Laya3D.TERRAINRES);
                break;
        }
        var components = node.components;
        if (components) {
            for (var k = 0, p = components.length; k < p; k++) {
                var component = components[k];
                switch (component.type) {
                    case "Animator":
                        var avatarPath = component.avatarPath;
                        var avatarData = component.avatar;
                        (avatarData) && (avatarData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, avatarData.path, Laya3D.AVATAR));
                        var clipPaths = component.clipPaths;
                        if (!clipPaths) {
                            var layersData = component.layers;
                            for (i = 0; i < layersData.length; i++) {
                                var states = layersData[i].states;
                                for (var j = 0, m = states.length; j < m; j++) {
                                    var clipPath = states[j].clipPath;
                                    (clipPath) && (states[j].clipPath = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPath, Laya3D.ANIMATIONCLIP));
                                }
                            }
                        }
                        else {
                            for (i = 0, n = clipPaths.length; i < n; i++)
                                clipPaths[i] = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPaths[i], Laya3D.ANIMATIONCLIP);
                        }
                        break;
                    case "PhysicsCollider":
                    case "Rigidbody3D":
                    case "CharacterController":
                        var shapes = component.shapes;
                        for (i = 0; i < shapes.length; i++) {
                            var shape = shapes[i];
                            if (shape.type === "MeshColliderShape") {
                                var mesh = shape.mesh;
                                (mesh) && (shape.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
                            }
                        }
                        break;
                }
            }
        }
        var children = node.child;
        for (i = 0, n = children.length; i < n; i++)
            Laya3D._getSprite3DHierarchyInnerUrls(children[i], firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath);
    }
    static _onMaterilLmatLoaded(url, lmatData, urls, subUrls) {
        var urlVersion = "";
        var materialBasePath = URL_1.default.getPath(url);
        var customProps = lmatData.customProps;
        var formatSubUrl;
        var version = lmatData.version;
        switch (version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
                var i, n;
                var textures = lmatData.props.textures;
                if (textures) {
                    for (i = 0, n = textures.length; i < n; i++) {
                        var tex2D = textures[i];
                        var tex2DPath = tex2D.path;
                        if (tex2DPath) {
                            formatSubUrl = Laya3D.formatRelativePath(materialBasePath, tex2DPath);
                            (urlVersion) && (formatSubUrl = formatSubUrl + urlVersion);
                            urls.push({ url: formatSubUrl, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams }); //不指定类型,自动根据后缀判断Texture2D或TextureCube
                            subUrls.push(formatSubUrl);
                            tex2D.path = formatSubUrl;
                        }
                    }
                }
                break;
            default:
                console.log("Laya3D:unkonwn version.");
        }
    }
}
/**Hierarchy资源。*/
Laya3D.HIERARCHY = "HIERARCHY"; //兼容
/**Mesh资源。*/
Laya3D.MESH = "MESH"; //兼容
/**Material资源。*/
Laya3D.MATERIAL = "MATERIAL"; //兼容
/**Texture2D资源。*/
Laya3D.TEXTURE2D = "TEXTURE2D"; //兼容
/**TextureCube资源。*/
Laya3D.TEXTURECUBE = "TEXTURECUBE"; //兼容
/**AnimationClip资源。*/
Laya3D.ANIMATIONCLIP = "ANIMATIONCLIP"; //兼容
/**Avatar资源。*/
Laya3D.AVATAR = "AVATAR"; //兼容
/**Terrain资源。*/
Laya3D.TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
/**Terrain资源。*/
Laya3D.TERRAINRES = "TERRAIN";
exports.default = Laya3D;
