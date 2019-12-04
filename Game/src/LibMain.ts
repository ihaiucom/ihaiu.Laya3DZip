
import AssetManifest from "./Zip/AssetManifest";
import ZipManager from "./Zip/ZipManager";
import PrefabManager from "./Zip/PrefablManager";
import DebugResources from "./DebugResources/DebugResources";
import AsyncUtil from "./Zip/AsyncUtil";
import JsZipAsync from "./Zip/JsZipAsync";
import ZipLoader from "./Zip/ZipLoader";

window['AssetManifest'] = AssetManifest;
window['AsyncUtil'] = AsyncUtil;
window['JsZipAsync'] = JsZipAsync;
window['ZipLoader'] = ZipLoader;
window['ZipManager'] = ZipManager;
window['PrefabManager'] = PrefabManager;
window['DebugResources'] = DebugResources;

