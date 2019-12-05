/*
 * @Descripttion: 
 * @version: 
 * @Author: ZengFeng
 * @Date: 2019-10-14 19:07:26
 * @LastEditors: ZengFeng
 * @LastEditTime: 2019-10-14 19:07:26
 */
import GameConfig from "./GameConfig";
import GameLaunch from "./GameLaunch";
class GameMain 
{
    constructor() 
    {
		LayaExtendClass();
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		Laya.Shader3D.debugMode = false;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		// if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;
		
		
		LayaExtendLogic();
		Engine.init();
		new GameLaunch().install();
		// this.testAsync();

	}

	initLoader() 
	{

		let path = "res/fgui/GameLaunch_atlas_upoiw2g.jpg";
  
		let system = wx.getSystemInfoSync()
		var sprite = new Laya.Sprite();
		let w = Laya.stage.width;
		let h = Laya.stage.height;
  
  
		sprite.graphics.drawRect(0, 0, w, h, '#FFFFFF');
		sprite.graphics.loadImage(path, 0, 0, w, h);
		Laya.stage.addChild(sprite);
		window['launcherInitBG'] = sprite;
  
	}

	testAsync()
	{
		this.testFun1Async();
	}

	async testFun1Async()
	{
		console.log("testFun1Async Begin");
		await this.testFun2Async();
		console.log("testFun1Async End");
	}

	
	async testFun2Async()
	{
		
	}

}


//激活启动类
new GameMain();