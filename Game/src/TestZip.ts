
import Text = Laya.Text;
import ZipManager from "./Zip/ZipManager";
import R from "./R";
import DebugResources from "./DebugResources/DebugResources";
import PrefabManager from "./Zip/PrefablManager";
import AsyncUtil from "./Zip/AsyncUtil";
import LayaExtends_Loader from "./Zip/LayaExtends/LayaExtends_Loader";
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

        // DebugResources.Init();

        this.testLoadAll();
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
        
			"Scene_PVE_001_003",
    ];

    
    async testLoadAll()
    {
        var beginTime = new Date().getTime();
        await ZipManager.Instance.InitAsync(R.res3dzip_manifest, R.res3d, R.res3dzip);
        // ZipLoader.UseAsync = false;
        var useTime = new Date().getTime() - beginTime;
        this.textTime.text += "manifest:" + useTime + "ms\n";

        PrefabManager.Instance.Init(R.res3d);

        
        var beginTime = new Date().getTime();
        await PrefabManager.Instance.PreloadPrefabList(this.list)
        var useTime = new Date().getTime() - beginTime;
        this.textTime.text += "PreloadPrefabList:" + useTime + "ms\n";

        this.testLoad();
    }

    async testLoad()
    {
        var totalBeginTime = new Date().getTime();
        


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
        console.time("LoadPrefabList");
        await this.LoadPrefabList2();
        console.log("imageCount", ZipManager.Instance.imageCount);
        console.timeEnd("LoadPrefabList");
        
    
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
            var path = `res3d/Conventional/${resId}.lh`;
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
        console.log("ReadZipAssetList End");
    }

    prefabList:Laya.Sprite3D[] = [];


    clearScene()
    {
        for(let item of this.prefabList)
        {
            item.removeSelf();
        }
    }
    

    
    async LoadPrefabList1()
    {
        this.clearScene();
        let list = this.list;
        let i = 0;
        let len = list.length;
        for(let resId of list)
        {
            i ++;
            let rate = Math.ceil(i / len * 100);
            let path = ZipManager.Instance.ResFileNameToAssetPath(resId);
            this.textPath.text = path;
            this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${len}`;
            let res = await this.Load3DAsync(path);
            if(this.prefabList.includes(res))
            {
                console.log("已经加载过", path);
            }

            this.prefabList.push(res);
            this.scene.addChild(res);

        }
            
        this.textPath.text = "加载完成所有预设";
    }


    async LoadPrefabList2()
    {
        this.clearScene();
        await PrefabManager.Instance.LoadPrefabListAsync(this.list, this, 
            //onProgerss
            (i, count, rate, path, res)=>
            {
                if(this.prefabList.includes(res))
                {
                    console.log("已经加载过", path);
                }

                this.prefabList.push(res);
                // this.scene.addChild(res);
                this.onLoadMap(res);
                // setTimeout(()=>{
                //     res.removeSelf();
                // }, 100)

                this.textPath.text = path;
                this.textRate.text = `读取所有Zip列表：\n${rate}%     ${i}/${count}`;
            });
            
        this.textPath.text = "加载完成所有预设";
    }

    
    onLoadMap(sceneRoot:Laya.Sprite3D)
    {
        window['sceneRoot'] = sceneRoot;
        let mapNode: Laya.Sprite3D = <Laya.Sprite3D> sceneRoot.getChildByName("Map");
        let mapPositionNode: Laya.Sprite3D = <Laya.Sprite3D> mapNode.getChildByName("Position");
        let cameraNode: Laya.Sprite3D = <Laya.Sprite3D> sceneRoot.getChildByName("CameraCtrl");
        let directionLight: Laya.DirectionLight = <Laya.DirectionLight> sceneRoot.getChildByName("Directional Light");
        let sortLayer: Laya.Sprite3D = <Laya.Sprite3D> sceneRoot.getChildByName("UnitLayer");
        var farLayerNode = <Laya.Sprite3D> mapPositionNode.getChildByName("FarLayer");
        var mediumLayerNode = <Laya.Sprite3D> mapPositionNode.getChildByName("MediumLayer");


        mapPositionNode._children[0]._children[0].meshFilter.sharedMesh = Laya.PrimitiveMesh.createPlane(10, 10, 1, 1);
        
        let box = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1));
        box.meshRenderer.sharedMaterial =  mapPositionNode._children[0]._children[0].meshRenderer.sharedMaterial;
        this.scene.addChild(box);
       

        // this.initLayerCopy();
        this.scene.addChild(sceneRoot);

        mapNode.transform.localRotationEulerX = 20;
        mapNode.transform.localRotationEulerY = 180;

        mapPositionNode.transform.localPositionZ = 100;
        
        window['mapNode'] = mapNode;
        window['mapPositionNode'] = mapPositionNode;
        console.log(mapPositionNode);

        
        if(cameraNode)
            cameraNode.removeSelf();

        if(directionLight)
            directionLight.removeSelf();
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
                AsyncUtil.ResolveDelayCall(resolve, res);
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


        var btn = new Laya.Sprite();
        btn.width = 100;
        btn.height = 50;
        btn.graphics.drawRect(0, 0, 100, 50, '#00FF00')
        Laya.stage.addChild(btn);
        btn.mouseEnabled = true;
        btn.on(Laya.Event.CLICK, this, this.onClickCheck);
        this.checkBtn = btn;
        
        var btn = new Laya.Sprite();
        btn.width = 100;
        btn.height = 50;
        btn.graphics.drawRect(0, 0, 100, 50, '#FF0000')
        Laya.stage.addChild(btn);
        btn.mouseEnabled = true;
        btn.on(Laya.Event.CLICK, this, this.clearScene);
        this.clearBtn = btn;


        var btn = new Laya.Sprite();
        btn.width = 100;
        btn.height = 50;
        btn.graphics.drawRect(0, 0, 100, 50, '#0000FF')
        Laya.stage.addChild(btn);
        btn.mouseEnabled = true;
        btn.on(Laya.Event.CLICK, this, this.onClickReload);
        this.reloadBtn = btn;
        
        Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
        this.onResize();
    }

    checkBtn:Laya.Sprite;
    clearBtn:Laya.Sprite;
    reloadBtn:Laya.Sprite;
    onClickCheck(e)
    {
        DebugResources.Check();
    }
    onClickReload(e)
    {
        this.textTime.text = "";
        this.testLoad();
    }

    onResize()
    {
        var btn = this.checkBtn;
		btn.x = (Laya.stage.width - btn.width)  * 0.5;
        btn.y = ((Laya.stage.height -btn.height) >> 1) + 100;

        var btn = this.clearBtn;
		btn.x = (Laya.stage.width - btn.width)  * 0.5;
        btn.y = ((Laya.stage.height -btn.height) >> 1) + 200;
        
        var btn = this.reloadBtn;
		btn.x = (Laya.stage.width - btn.width)  * 0.5;
        btn.y = ((Laya.stage.height -btn.height) >> 1) + 300;
        
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