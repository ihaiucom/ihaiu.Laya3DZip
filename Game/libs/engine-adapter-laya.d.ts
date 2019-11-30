declare class Engine {
    /** 时间管理器的引用。*/
    static timer: Laya.Timer;
    /** 资源加载器*/
    static loader: Laya.LoaderManager;
    static stage: Laya.Stage;
    static borwer: Engines.Browser;
    static init(): void;
}
declare namespace Engines {
    class Browser {
        _networkType: NetworkType;
        /** 获取当前设备的网络类型, 如果网络类型无法获取，默认将返回  */
        getNetworkType(callback?: Function): number;
        private _getNetworkType_Web;
        /** 返回手机屏幕安全区域，目前仅在 iOS 原生平台有效。其它平台将默认返回设计分辨率尺寸。  */
        /** 是否有刘海 */
        private _isLiuHai;
        readonly isLiuHai: boolean;
        /** 是否是微信小游戏 */
        readonly isWXGame: boolean;
        private _isWXGameSubDomain;
        /** 是否是微信小游戏子域 */
        readonly isWXGameSubDomain: boolean;
        readonly isBrowser: boolean;
        readonly isMobile: boolean;
        readonly isNative: boolean;
        private _language;
        /** "zh" */
        readonly language: BrowserLanguage;
        private _languageCode;
        /** "zh-cn" */
        readonly languageCode: string;
    }
    enum BrowserType {
        BROWSER_TYPE_WECHAT = "wechat",
        BROWSER_TYPE_WECHAT_GAME = "wechatgame",
        BROWSER_TYPE_WECHAT_GAME_SUB = "wechatgamesub",
        BROWSER_TYPE_BAIDU_GAME = "baidugame",
        BROWSER_TYPE_BAIDU_GAME_SUB = "baidugamesub",
        BROWSER_TYPE_QQ_PLAY = "qqplay",
        BROWSER_TYPE_ANDROID = "androidbrowser",
        BROWSER_TYPE_IE = "ie",
        BROWSER_TYPE_QQ = "qqbrowser",
        BROWSER_TYPE_MOBILE_QQ = "mqqbrowser",
        BROWSER_TYPE_UC = "ucbrowser",
        BROWSER_TYPE_UCBS = "ucbs",
        BROWSER_TYPE_BAIDU_APP = "baiduboxapp",
        BROWSER_TYPE_BAIDU = "baidubrowser",
        BROWSER_TYPE_MAXTHON = "maxthon",
        BROWSER_TYPE_OPERA = "opera",
        BROWSER_TYPE_OUPENG = "oupeng",
        BROWSER_TYPE_MIUI = "miuibrowser",
        BROWSER_TYPE_FIREFOX = "firefox",
        BROWSER_TYPE_SAFARI = "safari",
        BROWSER_TYPE_CHROME = "chrome",
        BROWSER_TYPE_LIEBAO = "liebao",
        BROWSER_TYPE_QZONE = "qzone",
        BROWSER_TYPE_SOUGOU = "sogou",
        BROWSER_TYPE_360 = "360",
        BROWSER_TYPE_UNKNOWN = "unknown"
    }
    enum BrowserPlatform {
        MOBILE_BROWSER = 100,
        DESKTOP_BROWSER = 101,
        EDITOR_PAGE = 102,
        EDITOR_CORE = 103,
        WECHAT_GAME = 104,
        QQ_PLAY = 105,
        FB_PLAYABLE_ADS = 106,
        BAIDU_GAME = 107,
        VIVO_GAME = 108,
        OPPO_GAME = 100
    }
    enum BrowserLanguage {
        ENGLISH = "en",
        CHINESE = "zh",
        FRENCH = "fr",
        ITALIAN = "it",
        GERMAN = "de",
        SPANISH = "es",
        DUTCH = "du",
        RUSSIAN = "ru",
        JAPANESE = "ja",
        HUNGARIAN = "hu",
        PORTUGUESE = "pt",
        ARABIC = "ar",
        NORWEGIAN = "no",
        POLISH = "pl",
        TURKISH = "tr",
        UKRAINIAN = "uk",
        ROMANIAN = "ro",
        BULGARIAN = "bg",
        UNKNOWN = "unknown"
    }
    enum BrowserOS {
        IOS = "iOS",
        ANDROID = "Android",
        WINDOWS = "Windows",
        MARMALADE = "Marmalade",
        LINUX = "Linux",
        BADA = "Bada",
        BLACKBERRY = "Blackberry",
        OSX = "OS X",
        WP8 = "WP8",
        WINRT = "WINRT",
        UNKNOWN = "Unknown"
    }
    enum NetworkTypeText {
        wifi = "wifi",
        _2g = "2g",
        _3g = "3g",
        _4g = "5g",
        unknown = "unknown",
        none = "none"
    }
    enum NetworkType {
        none = 0,
        unknown = -1,
        wifi = 1,
        _2g = 2,
        _3g = 3,
        _4g = 4
    }
}
declare namespace Engines {
    class Gid {
        static _gid: number;
        static getGID(): number;
    }
}


declare type PosId = number;
declare type FrameIndex = number;