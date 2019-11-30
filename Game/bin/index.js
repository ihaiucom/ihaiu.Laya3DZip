/*
 * @Descripttion: 
 * @version: 
 * @Author: ZengFeng
 * @Date: 2019-10-10 10:39:36
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-10-30 09:29:12
 */
/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";

//-----libs-begin-----
loadLib("libs/laya.core.js");
// loadLib("libs/laya.webgl.js");
// loadLib("libs/laya.filter.js");
// loadLib("libs/laya.ui.js");
// loadLib("libs/laya.physics3D.js");
loadLib("libs/laya.d3.js");
loadLib("libs/laya.html.js");
loadLib("libs/laya.ani.js");





// 扩展

loadLib("libs/game/GameCommonLib.js");
loadLib("libs/game/StringExtend.js");
loadLib("libs/game/engine-adapter-laya.js");
loadLib("libs/game/LayaExtend.js");
loadLib("libs/game/FguiExtend.js");
loadLib("libs/game/FileSaver.js");

loadLib("libs/jszip/dist/jszip.js");


//-----libs-end-------

loadLib("js/VersionConfig.js")
loadLib("js/bundle.js");


