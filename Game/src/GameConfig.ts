/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=1334;
    static height:number=750;
    static get isMobile(): boolean
    {
        var u = window.navigator.userAgent;
        return u.indexOf("Mobile") > -1;
        
    }
    
    static get scaleMode():string
    {
        return this.isMobile ? Laya.Stage.SCALE_FIXED_AUTO :Laya.Stage.SCALE_FULL ;
    } 

    static screenMode:string="none";
    static alignV:string=Laya.Stage.ALIGN_TOP;
    static alignH:string=Laya.Stage.ALIGN_CENTER;
    static startScene:any="test/TestScene.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=false;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    static isAntialias: boolean = true;

    /**Laya.Stage.SCALE_FULL模式下 X轴缩放比例 */
    static get scaleX()
    {
        return Laya.stage.width / this.width;
    }
    /**Laya.Stage.SCALE_FULL模式下 Y轴缩放比例 */
    static get scaleY()
    {
        return  Laya.stage.height /  this.height;
    }

    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
    }
}
GameConfig.init();