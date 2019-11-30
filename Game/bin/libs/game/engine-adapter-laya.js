var Engine = /** @class */ (function () {
    function Engine() {
    }
    Engine.init = function () {
        window['Engines'] = Engines;
        this.timer = Laya.timer;
        this.loader = Laya.loader;
        this.stage = Laya.stage;
        this.borwer = new Engines.Browser();
        this['LocalStorage'] = Laya.LocalStorage;
        this['Handler'] = Laya.Handler;
        this['Loader'] = Laya.Loader;
        this['Ease'] = Laya.Ease;
        this['Tween'] = Laya.Tween;
        this['Stage'] = Laya.Stage;
        window['LocalStorage'] = Laya.LocalStorage;
        window['Handler'] = Laya.Handler;
        window['Loader'] = Laya.Loader;
        window['Ease'] = Laya.Ease;
        window['Tween'] = Laya.Tween;
        window['Stage'] = Laya.Stage;
    };
    return Engine;
}());
var Engines;
(function (Engines) {
    var Browser = /** @class */ (function () {
        function Browser() {
        }
        /** 获取当前设备的网络类型, 如果网络类型无法获取，默认将返回  */
        Browser.prototype.getNetworkType = function (callback) {
            var _this = this;
            if (this.isWXGame) {
                var wx = window['wx'];
                wx.getNetworkType({
                    success: function (res) {
                        var networkType;
                        switch (res.networkType) {
                            case NetworkTypeText.wifi:
                                networkType = NetworkType.wifi;
                                break;
                            case NetworkTypeText._4g:
                                networkType = NetworkType._4g;
                                break;
                            case NetworkTypeText._3g:
                                networkType = NetworkType._3g;
                                break;
                            case '3gnet':
                                networkType = NetworkType._3g;
                                break;
                            case NetworkTypeText._2g:
                                networkType = NetworkType._2g;
                                break;
                            default:
                                networkType = NetworkType.unknown;
                        }
                        ;
                        _this._networkType = networkType;
                        if (callback)
                            callback(_this._networkType);
                    },
                    fail: function () {
                        _this._networkType = NetworkType.none;
                        if (callback)
                            callback(_this._networkType);
                    }
                });
            }
            else {
                this._networkType = this._getNetworkType_Web();
                if (callback)
                    callback(this._networkType);
            }
            return this._networkType;
        };
        Browser.prototype._getNetworkType_Web = function () {
            var ua = navigator.userAgent;
            var networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
            networkStr = networkStr.toLowerCase().replace('nettype/', '');
            var networkType;
            switch (networkStr) {
                case NetworkTypeText.wifi:
                    networkType = NetworkType.wifi;
                    break;
                case NetworkTypeText._4g:
                    networkType = NetworkType._4g;
                    break;
                case NetworkTypeText._3g:
                    networkType = NetworkType._3g;
                    break;
                case '3gnet':
                    networkType = NetworkType._3g;
                    break;
                case NetworkTypeText._2g:
                    networkType = NetworkType._2g;
                    break;
                default:
                    networkType = NetworkType.unknown;
            }
            return networkType;
        };
        Object.defineProperty(Browser.prototype, "isLiuHai", {
            get: function () {
                if (this._isLiuHai === undefined) {
                    if (!this.isBrowser || this.isWXGame) {
                        if(window.innerWidth > window.innerHeight)
                        {

                            this._isLiuHai = window.innerHeight / window.innerWidth <= 0.5;
                        }
                        else
                        {

                            this._isLiuHai = window.innerWidth / window.innerHeight <= 0.5;
                        }
                    }
                }
                return this._isLiuHai;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "isWXGame", {
            /** 是否是微信小游戏 */
            get: function () {
                return Laya.Browser.onMiniGame;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "isWXGameSubDomain", {
            /** 是否是微信小游戏子域 */
            get: function () {
                if (this._isWXGameSubDomain === undefined) {
                    this._isWXGameSubDomain = this.isWXGame && (window['wx'].getSharedCanvas ? true : false);
                }
                return this._isWXGameSubDomain;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "isBrowser", {
            get: function () {
                return typeof window === 'object' && typeof document === 'object' && !this.isWXGame;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "isMobile", {
            get: function () {
                return Laya.Browser.onMobile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "isNative", {
            get: function () {
                return window['isConchApp'] ? true : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "language", {
            /** "zh" */
            get: function () {
                if (this._language)
                    return this._language;
                if (this.isWXGame) {
                    this._language = window['wx'].getSystemInfoSync().language;
                }
                else if (this.isBrowser) {
                    this._language = navigator.languages[1].toLowerCase();
                }
                else {
                    this._language = BrowserLanguage.CHINESE;
                }
                return this._language;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Browser.prototype, "languageCode", {
            /** "zh-cn" */
            get: function () {
                if (this.isBrowser) {
                    this._languageCode = navigator.languages[0].toLowerCase();
                }
                else {
                    this._languageCode = "zh-cn";
                }
                return this._languageCode;
            },
            enumerable: true,
            configurable: true
        });
        return Browser;
    }());
    Engines.Browser = Browser;
    var BrowserType;
    (function (BrowserType) {
        BrowserType["BROWSER_TYPE_WECHAT"] = "wechat";
        BrowserType["BROWSER_TYPE_WECHAT_GAME"] = "wechatgame";
        BrowserType["BROWSER_TYPE_WECHAT_GAME_SUB"] = "wechatgamesub";
        BrowserType["BROWSER_TYPE_BAIDU_GAME"] = "baidugame";
        BrowserType["BROWSER_TYPE_BAIDU_GAME_SUB"] = "baidugamesub";
        BrowserType["BROWSER_TYPE_QQ_PLAY"] = "qqplay";
        BrowserType["BROWSER_TYPE_ANDROID"] = "androidbrowser";
        BrowserType["BROWSER_TYPE_IE"] = "ie";
        BrowserType["BROWSER_TYPE_QQ"] = "qqbrowser";
        BrowserType["BROWSER_TYPE_MOBILE_QQ"] = "mqqbrowser";
        BrowserType["BROWSER_TYPE_UC"] = "ucbrowser";
        BrowserType["BROWSER_TYPE_UCBS"] = "ucbs";
        BrowserType["BROWSER_TYPE_BAIDU_APP"] = "baiduboxapp";
        BrowserType["BROWSER_TYPE_BAIDU"] = "baidubrowser";
        BrowserType["BROWSER_TYPE_MAXTHON"] = "maxthon";
        BrowserType["BROWSER_TYPE_OPERA"] = "opera";
        BrowserType["BROWSER_TYPE_OUPENG"] = "oupeng";
        BrowserType["BROWSER_TYPE_MIUI"] = "miuibrowser";
        BrowserType["BROWSER_TYPE_FIREFOX"] = "firefox";
        BrowserType["BROWSER_TYPE_SAFARI"] = "safari";
        BrowserType["BROWSER_TYPE_CHROME"] = "chrome";
        BrowserType["BROWSER_TYPE_LIEBAO"] = "liebao";
        BrowserType["BROWSER_TYPE_QZONE"] = "qzone";
        BrowserType["BROWSER_TYPE_SOUGOU"] = "sogou";
        BrowserType["BROWSER_TYPE_360"] = "360";
        BrowserType["BROWSER_TYPE_UNKNOWN"] = "unknown";
    })(BrowserType = Engines.BrowserType || (Engines.BrowserType = {}));
    var BrowserPlatform;
    (function (BrowserPlatform) {
        BrowserPlatform[BrowserPlatform["MOBILE_BROWSER"] = 100] = "MOBILE_BROWSER";
        BrowserPlatform[BrowserPlatform["DESKTOP_BROWSER"] = 101] = "DESKTOP_BROWSER";
        BrowserPlatform[BrowserPlatform["EDITOR_PAGE"] = 102] = "EDITOR_PAGE";
        BrowserPlatform[BrowserPlatform["EDITOR_CORE"] = 103] = "EDITOR_CORE";
        BrowserPlatform[BrowserPlatform["WECHAT_GAME"] = 104] = "WECHAT_GAME";
        BrowserPlatform[BrowserPlatform["QQ_PLAY"] = 105] = "QQ_PLAY";
        BrowserPlatform[BrowserPlatform["FB_PLAYABLE_ADS"] = 106] = "FB_PLAYABLE_ADS";
        BrowserPlatform[BrowserPlatform["BAIDU_GAME"] = 107] = "BAIDU_GAME";
        BrowserPlatform[BrowserPlatform["VIVO_GAME"] = 108] = "VIVO_GAME";
        BrowserPlatform[BrowserPlatform["OPPO_GAME"] = 100] = "OPPO_GAME";
    })(BrowserPlatform = Engines.BrowserPlatform || (Engines.BrowserPlatform = {}));
    var BrowserLanguage;
    (function (BrowserLanguage) {
        BrowserLanguage["ENGLISH"] = "en";
        BrowserLanguage["CHINESE"] = "zh";
        BrowserLanguage["FRENCH"] = "fr";
        BrowserLanguage["ITALIAN"] = "it";
        BrowserLanguage["GERMAN"] = "de";
        BrowserLanguage["SPANISH"] = "es";
        BrowserLanguage["DUTCH"] = "du";
        BrowserLanguage["RUSSIAN"] = "ru";
        BrowserLanguage["JAPANESE"] = "ja";
        BrowserLanguage["HUNGARIAN"] = "hu";
        BrowserLanguage["PORTUGUESE"] = "pt";
        BrowserLanguage["ARABIC"] = "ar";
        BrowserLanguage["NORWEGIAN"] = "no";
        BrowserLanguage["POLISH"] = "pl";
        BrowserLanguage["TURKISH"] = "tr";
        BrowserLanguage["UKRAINIAN"] = "uk";
        BrowserLanguage["ROMANIAN"] = "ro";
        BrowserLanguage["BULGARIAN"] = "bg";
        BrowserLanguage["UNKNOWN"] = "unknown";
    })(BrowserLanguage = Engines.BrowserLanguage || (Engines.BrowserLanguage = {}));
    var BrowserOS;
    (function (BrowserOS) {
        BrowserOS["IOS"] = "iOS";
        BrowserOS["ANDROID"] = "Android";
        BrowserOS["WINDOWS"] = "Windows";
        BrowserOS["MARMALADE"] = "Marmalade";
        BrowserOS["LINUX"] = "Linux";
        BrowserOS["BADA"] = "Bada";
        BrowserOS["BLACKBERRY"] = "Blackberry";
        BrowserOS["OSX"] = "OS X";
        BrowserOS["WP8"] = "WP8";
        BrowserOS["WINRT"] = "WINRT";
        BrowserOS["UNKNOWN"] = "Unknown";
    })(BrowserOS = Engines.BrowserOS || (Engines.BrowserOS = {}));
    var NetworkTypeText;
    (function (NetworkTypeText) {
        NetworkTypeText["wifi"] = "wifi";
        NetworkTypeText["_2g"] = "2g";
        NetworkTypeText["_3g"] = "3g";
        NetworkTypeText["_4g"] = "5g";
        NetworkTypeText["unknown"] = "unknown";
        NetworkTypeText["none"] = "none";
    })(NetworkTypeText = Engines.NetworkTypeText || (Engines.NetworkTypeText = {}));
    var NetworkType;
    (function (NetworkType) {
        NetworkType[NetworkType["none"] = 0] = "none";
        NetworkType[NetworkType["unknown"] = -1] = "unknown";
        NetworkType[NetworkType["wifi"] = 1] = "wifi";
        NetworkType[NetworkType["_2g"] = 2] = "_2g";
        NetworkType[NetworkType["_3g"] = 3] = "_3g";
        NetworkType[NetworkType["_4g"] = 4] = "_4g";
    })(NetworkType = Engines.NetworkType || (Engines.NetworkType = {}));
})(Engines || (Engines = {}));


window['Engine'] = Engine;
window['Engines'] = Engines;