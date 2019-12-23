#!/usr/bin/env node
"use strict";

import AssetDatabase from "./AssetDatabase";
import AssetNode from "./AssetNode";
import AssetNodeUtil from "./AssetNodeUtil";
import fs from "fs";
import ConfigSetting from "./ConfigSetting";
import AssetManifest from "./AssetManifest";



function main()
{
    var manifest = new AssetManifest();
    // 生成所有节点
    AssetDatabase.LoadAllPrefab();
    manifest.GenerateAssets(AssetDatabase.map, AssetDatabase.prefabList, ConfigSetting.rootDir);
    
    fs.writeFileSync("log_root_src_tree.txt", AssetNode.GetNodeTree(AssetDatabase.prefabList));

    // 打包策略--特效预设合并
    AssetDatabase.MergeZipEffectPrefab();

    // 打包策略--强制将Unity内置资源打包到一起， 并且清理依赖
    AssetDatabase.MergeZipUnityBuiltin();

    // 打包策略--配置的目录，打包Zip
    AssetDatabase.MergeZipByDirConfig();

    var map = AssetDatabase.map;

    
    // 寻找入度为0的节点
    var roots: AssetNode[]  = AssetNodeUtil.FindRoots(map);

    // 移除父节点的依赖和自己依赖相同的节点
    AssetNodeUtil.RemoveParentShare(roots);
    
    
    // 入度为1的节点自动打包到上一级节点
    AssetNodeUtil.MergeParentCountOnce(roots);
    
    // 生成需要设置AssetBundleName的节点
    AssetNodeUtil.GenerateAssetBundleNodes(roots, ConfigSetting.rootDir);

    // 打包策略--检测被多个Zip引用的， 将这些合并到一起
    AssetDatabase.MergeZipCheckMultipleZip();
    // 打包策略--检测被多个Zip引用的，并且在制定目录下， 将这些合并到一起
    AssetDatabase.MergeZipCheckMultipleZipByDirConfig();

    roots  = AssetNodeUtil.FindRoots(map);

    // 生成Zip Map
    var zipMap = AssetNodeUtil.GenerateZipMap(map);
    manifest.GenerateZips(zipMap);


    fs.writeFileSync("log_root_tree.txt", AssetNode.GetNodeTree(roots));
    
    fs.writeFileSync("log_zip.txt", AssetNodeUtil.GetZipInfo(zipMap));

    if(! fs.existsSync(ConfigSetting.outDir))
    {
        fs.mkdirSync(ConfigSetting.outDir, {recursive : true});
    }

    AssetNodeUtil.BuildZip(zipMap);
    
    manifest.Save(ConfigSetting.outDir + "/manifest.json");

    
}

main();



