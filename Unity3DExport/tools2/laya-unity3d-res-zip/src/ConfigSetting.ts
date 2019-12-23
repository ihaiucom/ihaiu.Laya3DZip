export default class ConfigSetting
{
    /** 资源目录 */
    static rootDir = "../../res3d/Conventional";
    /** 输出Zip目录 */
    static outDir = "../../res3dzip";

    /** 以下列表里的每个目录一个Zip包 */
    static mergeZipDir:string[] = 
    [
        // TODO 之前的测试资源
        // "Assets/TextEffect"
    ];

    
    /** 以下列表里的每个目录下的文件夹打包一个Zip包 */
    static mergeZipDirFolder:string[] = 
    [
        // 场景
        // "Assets/GameArt/Scene",
        // 角色单位
        // "Assets/GameArt/Unit",

        // TODO 之前的测试资源
        // "Assets/Data/Anim/Hero",
        // "Assets/Data/Anim/Monster",
    ];

    /** 资源被多个Zip引用时， 合并Zip策略，合并Zip里的资源数量要大于该数量才合并 */
    static mergeMultipleZipNodeMinNum = 5;

    /** 剩余其他被公用的，合并到一起 */
    static mergeOtherCommonDir:string[] =
    [
        // 特效
        "Assets/GameArt/Effect",
        
        // TODO 之前的测试资源
        "Assets/TextEffect",
        "Assets",
    ];

    /** manifest 设置 */
    static manifest:{
        assetsDependencie?:boolean,
        prefabDependencie?:boolean,
    } = {
        assetsDependencie : false,
        prefabDependencie : true, 
    }
}