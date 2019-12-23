import PathUtil from "./PathUtil";
import ConfigSetting from "./ConfigSetting";
import URL from "./URL";

export default class Laya3D
{
    
	/**Hierarchy资源。*/
	static HIERARCHY: string = "HIERARCHY";//兼容
	/**Mesh资源。*/
	static MESH: string = "MESH";//兼容
	/**Material资源。*/
	static MATERIAL: string = "MATERIAL";//兼容
	/**Texture2D资源。*/
	static TEXTURE2D: string = "TEXTURE2D";//兼容
	/**TextureCube资源。*/
	static TEXTURECUBE: string = "TEXTURECUBE";//兼容
	/**AnimationClip资源。*/
	static ANIMATIONCLIP: string = "ANIMATIONCLIP";//兼容
	/**Avatar资源。*/
	static AVATAR: string = "AVATAR";//兼容
	/**Terrain资源。*/
	static TERRAINHEIGHTDATA: string = "TERRAINHEIGHTDATA";
	/**Terrain资源。*/
	static TERRAINRES: string = "TERRAIN";
    
	 static formatRelativePath(base: string, value: string): string {
		var path: string;
		path = base + value;

		var char1: string = value.charAt(0);
		if (char1 === ".") {
			var parts: any[] = path.split("/");
			for (var i: number = 0, len: number = parts.length; i < len; i++) {
				if (parts[i] == '..') {
					var index: number = i - 1;
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
    
	 static _addHierarchyInnerUrls(urls: any[], urlMap: any[], urlVersion: string, hierarchyBasePath: string, path: string, type: string, constructParams: any = null, propertyParams: any = null): string {
		var formatUrl: string = Laya3D.formatRelativePath(hierarchyBasePath, path);
		(urlVersion) && (formatUrl = formatUrl + urlVersion);
		urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
		urlMap.push(formatUrl);
		return formatUrl;
	}


	static _getSprite3DHierarchyInnerUrls(node: any, firstLevelUrls: any[], secondLevelUrls: any[], thirdLevelUrls: any[], fourthLelUrls: any[], subUrls: any[], urlVersion: string, hierarchyBasePath: string): void {
		var i: number, n: number;

		var props: any = node.props;
		switch (node.type) {
			case "Scene3D": //TODO:应该自动序列化类型
				var lightmaps: any[] = props.lightmaps;
				for (i = 0, n = lightmaps.length; i < n; i++) {
					var lightMap: any = lightmaps[i];
					lightMap.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightMap.path, Laya3D.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
				}
				var reflectionTextureData: string = props.reflectionTexture;
				(reflectionTextureData) && (props.reflectionTexture = Laya3D._addHierarchyInnerUrls(thirdLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionTextureData, Laya3D.TEXTURECUBE));

				if (props.sky) {
					var skyboxMaterial: any = props.sky.material;
					(skyboxMaterial) && (skyboxMaterial.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMaterial.path, Laya3D.MATERIAL));
				}
				break;
			case "Camera":
				var skyboxMatData: any = props.skyboxMaterial;
				(skyboxMatData) && (skyboxMatData.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMatData.path, Laya3D.MATERIAL));
				break;
			case "TrailSprite3D":
			case "MeshSprite3D":
			case "SkinnedMeshSprite3D":
				var meshPath: string = props.meshPath;
				(meshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, meshPath, Laya3D.MESH));
				var materials: any[] = props.materials;
				if (materials)
					for (i = 0, n = materials.length; i < n; i++)
						materials[i].path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, materials[i].path, Laya3D.MATERIAL);
				break;
			case "ShuriKenParticle3D":
				if (props.main) {
					var resources: any = props.renderer.resources;
					var mesh: string = resources.mesh;
					var material: string = resources.material;
					(mesh) && (resources.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
					(material) && (resources.material = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, material, Laya3D.MATERIAL));
				}
				else {//兼容代码
					var parMeshPath: string = props.meshPath;
					(parMeshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, parMeshPath, Laya3D.MESH));
					props.material.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, props.material.path, Laya3D.MATERIAL);
				}
				break;
			case "Terrain":
				Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, props.dataPath, Laya3D.TERRAINRES);
				break;
		}

		var components: any[] = node.components;
		if (components) {
			for (var k: number = 0, p: number = components.length; k < p; k++) {
				var component: any = components[k];
				switch (component.type) {
					case "Animator":
						var avatarPath: string = component.avatarPath;
						var avatarData: any = component.avatar;
						(avatarData) && (avatarData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, avatarData.path, Laya3D.AVATAR));
						var clipPaths: string[] = component.clipPaths;
						if (!clipPaths) {
							var layersData: any[] = component.layers;
							for (i = 0; i < layersData.length; i++) {
								var states: any[] = layersData[i].states;
								for (var j: number = 0, m: number = states.length; j < m; j++) {
									var clipPath: string = states[j].clipPath;
									(clipPath) && (states[j].clipPath = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPath, Laya3D.ANIMATIONCLIP));
								}
							}
						} else {
							for (i = 0, n = clipPaths.length; i < n; i++)
								clipPaths[i] = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPaths[i], Laya3D.ANIMATIONCLIP);
						}
						break;
					case "PhysicsCollider":
					case "Rigidbody3D":
					case "CharacterController":
						var shapes: any[] = component.shapes;
						for (i = 0; i < shapes.length; i++) {
							var shape: any = shapes[i];
							if (shape.type === "MeshColliderShape") {
								var mesh: string = shape.mesh;
								(mesh) && (shape.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
							}
						}
						break;
				}
			}
		}

		var children: any[] = node.child;
		for (i = 0, n = children.length; i < n; i++)
			Laya3D._getSprite3DHierarchyInnerUrls(children[i], firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath);
	}

	static _onMaterilLmatLoaded(url:string, lmatData: any, urls:any[], subUrls:string[]): void 
	{
		
        var urlVersion: string = "";
		var materialBasePath: string = URL.getPath(url);
		var customProps: any = lmatData.customProps;
		var formatSubUrl: string;
		var version: string = lmatData.version;
		switch (version) {
			case "LAYAMATERIAL:01":
			case "LAYAMATERIAL:02":
				var i: number, n: number;
				var textures: any[] = lmatData.props.textures;
				if (textures) {
					for (i = 0, n = textures.length; i < n; i++) {
						var tex2D: any = textures[i];
						var tex2DPath: string = tex2D.path;
						if (tex2DPath) {
							formatSubUrl = Laya3D.formatRelativePath(materialBasePath, tex2DPath);
							(urlVersion) && (formatSubUrl = formatSubUrl + urlVersion);

							urls.push({ url: formatSubUrl, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams });//不指定类型,自动根据后缀判断Texture2D或TextureCube
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