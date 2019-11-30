function FguiExtend()
{

    window.GRoot = fgui.GRoot;
    window.GObject = fgui.GObject;
    window.GComponent = fgui.GComponent;
    window.GImage = fgui.GImage;
    window.GTextField = fgui.GTextField;
    window.GTextInput = fgui.GTextInput;
    window.GRichTextField = fgui.GRichTextField;
    window.GGraph = fgui.GGraph;
    window.GGroup = fgui.GGroup;
    window.GList = fgui.GList;
    window.GLoader = fgui.GLoader;
    window.GMovieClip = fgui.GMovieClip;
    window.GButton = fgui.GButton;
    window.GComboBox = fgui.GComboBox;
    window.GLabel = fgui.GLabel;
    window.GProgressBar = fgui.GProgressBar;
    window.GScrollBar = fgui.GScrollBar;
    window.GSlider = fgui.GSlider;
    window.GObjectPool = fgui.GObjectPool;

    
    fgui.GList.prototype.setItemRenderer = function(method, caller)
    {
        if(caller)
        {
		    this.itemRenderer = Laya.Handler.create(caller, method, null, false);
        }
        else
        {
		    this.itemRenderer = Laya.Handler.create(null, method, null, false);
        }
    }

    
    fgui.GList.prototype.setItemProvider = function(method, caller)
    {
        if(caller)
        {
		    this.itemProvider = Laya.Handler.create(caller, method, null, false);
        }
        else
        {
		    this.itemProvider = Laya.Handler.create(null, method, null, false);
        }
    }

    


// TODO ZF 输入框默认不显示文字
// fgui.GTextInput.prototype.initSize = function()
// {
    
//     if(!this.node) return;
//     for(var i = 0; i < this.node.childrenCount; i ++)
//     {
//         this.node._children[i].width = this.node.width;
//         this.node._children[i].height = this.node.height;
//     }
// }


}



window.FguiExtend = FguiExtend;