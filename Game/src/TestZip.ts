
import Text = Laya.Text;
import ZipManager from "./Zip/ZipManager";
import R from "./R";
export default class TestZip
{
    scene: Laya.Scene3D;
    textRate: Text;
    textPath: Text;
    textTime: Text;
    constructor()
    {
        window['test'] = this;
        this.InitScene();
        this.InitUI();
        this.initTimeLog();

        this.testLoad();
    }

    initTimeLog()
    {
        
        console.time = function(tag:string)
        {
            var timeMap:Map<string, number> =  console['_timeMap'];
            if(!timeMap)
            {
                console['_timeMap'] = timeMap = new Map<string, number>();
            }

            timeMap.set(tag, new Date().getTime());
           
        }

        
        console.timeEnd = function(tag:string)
        {
            var timeMap:Map<string, number> =  console['_timeMap'];
            if(!timeMap)
            {
                console['_timeMap'] = timeMap = new Map<string, number>();
            }

            var begin = timeMap.get(tag);
            if(begin)
            {
                console.log(`${tag}: ${new Date().getTime() - begin}ms`);
            }
           
        }
    }

    list = [
        // "Scene_PVE_001_001",
        "Hero_0001_LongQi_Skin1",
        "Hero_1002_yamamototakeshi_Skin1",
        "Monster_2001_badstudent",
        "Monster_5001_fathoody_Skin1",
        "Monster_5001_octopus_Skin1",
        "Effect_1001_Kyoya_Skin1__ATTACK0",
        "Effect_1001_Kyoya_Skin1__ATTACK1",
        "Effect_1001_Kyoya_Skin1__ATTACK2",
        "Effect_1001_Kyoya_Skin1__ATTACK3",
        "Effect_1001_Kyoya_Skin1__EFFECT1_03",
        "Effect_1001_Kyoya_Skin1__EFFECT1_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT1_04",
        "Effect_1001_Kyoya_Skin1__EFFECT1_05",
        "Effect_1001_Kyoya_Skin1__EFFECT1_06",
        "Effect_1001_Kyoya_Skin1__EFFECT1_07",
        "Effect_1001_Kyoya_Skin1__EFFECT2_02",
        "Effect_1001_Kyoya_Skin1__EFFECT2_03",
        "Effect_1001_Kyoya_Skin1__EFFECT3_01",
        "Effect_1001_Kyoya_Skin1__EFFECT3_01_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_02",
        "Effect_1001_Kyoya_Skin1__EFFECT3_02_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_03",
        "Effect_1001_Kyoya_Skin1__EFFECT3_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_04",
        "Effect_1001_Kyoya_Skin1__EFFECT3_04_w",
        "Effect_1001_Kyoya_Skin1__EFFECT3_05",
        "Effect_1001_Kyoya_Skin1__EFFECT3_05_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_10",
        "Effect_1001_Kyoya_Skin1__EFFECT4_02",
        "Effect_1001_Kyoya_Skin1__EFFECT4_02_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_03",
        "Effect_1001_Kyoya_Skin1__EFFECT4_03_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_04",
        "Effect_1001_Kyoya_Skin1__EFFECT4_04_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_05",
        "Effect_1001_Kyoya_Skin1__EFFECT4_05_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_06",
        "Effect_1001_Kyoya_Skin1__EFFECT4_06_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07_01",
        "Effect_1001_Kyoya_Skin1__EFFECT4_07_w",
        "Effect_1001_Kyoya_Skin1__EFFECT4_08",
        "Effect_1001_Kyoya_Skin1__EFFECT4_09",
        "Effect_1001_Kyoya_Skin1__RUN_ATTACK0",
        "Effect_1001_Kyoya_Skin1__JUMP_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK1",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK2",
        "Effect_1002_yamamototakeshi_Skin1__ATTACK3",
        "Effect_1002_yamamototakeshi_Skin1__JUMP_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1__JUMP_ATTACK0_01",
        "Effect_1002_yamamototakeshi_Skin1_RUN_ATTACK0",
        "Effect_1002_yamamototakeshi_Skin1_RUN_ATTACK0_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1_02",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT1_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT2",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT2_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT4_03",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT4_04",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5_01",
        "Effect_1002_yamamototakeshi_Skin1__EFFECT5_02",
        "Effect_5001_Fathoody__warning01_01",
        "Effect_5001_Fathoody__skill01_02",
        "Effect_5001_Fathoody__warning02_01",
        "Effect_5001_Fathoody__attack02_01",
        "Effect_5001_Fathoody__attack01_01",
        "Effect_000_BehitCommon__Behit",
        "Effect_Text_Forward",
        "Effect_Text_Arrow",
        "Effect_000_Circle__Other",
        "Effect_000_Circle__Self",
        "Effect_13001_fade"
    ];

    async testLoad()
    {
        var totalBeginTime = new Date().getTime();
        var beginTime = new Date().getTime();
        await ZipManager.Instance.InitAsync(R.res3dzip_manifest, R.res3d, R.res3dzip);
        var useTime = new Date().getTime() - beginTime;
        this.textTime.text += "manifest:" + useTime + "ms\n";


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
        console.time("LoadRes");
        var list = this.list;
        var i = 0;
        var count = list.length;
        for(var resId of list)
        {
            i ++;
            var path = `res/res3d/Conventional/${resId}.lh`;
            this.textPath.text = path;
            this.textRate.text = `加载预设：\n${Math.ceil(i / count * 100)}%     ${i} / ${count}`;

            var res:Laya.Sprite3D = await this.Load3DAsync(path);
            this.scene.addChild(res);
            setTimeout(()=>{
                res.removeSelf();
            }, 100)
        }

        console.log("imageCount", ZipManager.Instance.imageCount);
        console.timeEnd("LoadRes");
        
        
        // console.time("LoadRes2");
        // var i = 0;
        // var count = list.length;
        // for(var resId of list)
        // {
        //     i ++;
        //     var path = `res/res3d/Conventional/${resId}.lh`;
        //     this.textPath.text = path;
        //     this.textRate.text = `添加到场景： \n${Math.ceil(i / count * 100)}%     ${i} / ${count}`;

        //     var res = await this.Load3DAsync(path);
            
        //     this.scene.addChild(res);
        // }
        // console.log("imageCount", ZipManager.Instance.imageCount);
        // console.timeEnd("LoadRes2");
        var useTime = new Date().getTime() - beginTime;
        this.textTime.text += "load:" + useTime + "ms\n";
        
        var useTime = new Date().getTime() - totalBeginTime;
        this.textTime.text += "total:" + useTime + "ms\n";
    }

    async LoadZipList()
    {
        var pathList = [];
        var list = this.list;
        for(var resId of list)
        {
            var path = `res/res3d/Conventional/${resId}.lh`;
            pathList.push(path);
        }

        await ZipManager.Instance.LoadAssetZipListAsync(pathList, this, (i, count, rate, path)=>{
            
            this.textPath.text = path;
            this.textRate.text = `加载Zip列表： \n${rate}%     ${i}/${count}`;
        });
    }

    async ReadZipAssetList()
    {
        await ZipManager.Instance.ReadAllZipAsync(this, (i, count, rate, path)=>{
            this.textPath.text = path;
            this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${count}`;
        });
    }
    
    async testLoadHero1()
    {
        console.time("testLoadHero")
        var path = "res/res3d/Conventional/Hero_0001_LongQi_Skin1.lh";
        var res = await this.Load3DAsync(path);
        this.scene.addChild(res);
        console.timeEnd("testLoadHero")
    }
    

    async testLoadHero2()
    {
        console.time("testLoadHero")
        var path = "res/res3d/Conventional/Hero_0002_ZhanJi_Skin1.lh";
        var res = await this.Load3DAsync(path);
        this.scene.addChild(res);
        console.timeEnd("testLoadHero")
    }
    
    
	async Load3DAsync(path: string):Promise<any>
	{
        return new Promise<any>((resolve)=>
        {
			Laya.loader.create(path, Laya.Handler.create(null, (res)=>
			{
                resolve(res);
			}));
		});
    }
    
    // 加载资源, 异步
    async loadResAsync(path: string, type: string): Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    resolve(res);
                }), 
                null, type);
         });
    }

    InitScene()
    {
        var scene = new Laya.Scene3D();
        var camera = new Laya.Camera();
        var directionLight = new Laya.DirectionLight();
        camera.transform.localPositionZ = 10;
        scene.addChild(camera);
        scene.addChild(directionLight);
        Laya.stage.addChild(scene);

        this.scene = scene;
    }

    InitUI()
    {
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

        Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
        this.onResize();
    }

    onResize()
    {
        var txt = this.textRate;
		txt.x = (Laya.stage.width - txt.width)  * 0.5;
		txt.y = (Laya.stage.height - txt.textHeight) >> 1 ;
        
        
        var txt = this.textPath;
		txt.x = (Laya.stage.width - txt.width) * 0.5;
        txt.y = 100;
        
        
        var txt = this.textTime;
		txt.x = (Laya.stage.width - txt.width) * 0.5;
		txt.y = 200;
    }




}