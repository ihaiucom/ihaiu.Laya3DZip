function LayaExtendClass()
{
    Laya.Stage.prototype.sResize = new Signal();
    window['Vector2'] = Laya.Vector2;
    window['Vector3'] = Laya.Vector3;
    window['Vector4'] = Laya.Vector4;
    
}

function LayaExtendLogic()
{
    Laya.stage.on(Laya.Event.RESIZE, null, function()
    {
        Laya.stage.sResize.dispatch();
    });

    if(Laya.MiniSoundChannel && !Laya.MiniSoundChannel.__IsReplaceFun)
    {
        Laya.MiniSoundChannel.__IsReplaceFun = true;
        var SoundManager =  Laya.SoundManager;
        var MiniSound = Laya.MiniSound;
        var MiniSoundChannel = Laya.MiniSoundChannel;
        var MiniAdpter = Laya.MiniAdpter;
        var MiniFileMgr = Laya.MiniFileMgr;

        SoundManager.__soundChannelCache = new Map();

        SoundManager.getSoundChannelCache = function(url)
        {
            if(!SoundManager.__soundChannelCache.has(url))
            {
                return null;
            }

            var cacheList =  SoundManager.__soundChannelCache.get(url);
            if(cacheList.length == 0)
            {
                return null;
            }

            var channel = cacheList.shift();
            if(channel._audio)
            {
                return channel;
            }
            else
            {
                return null;
            }
        }

        
        SoundManager.addSoundChannelCache = function(channel)
        {
            var url = channel.url;
            var cacheList;
            if(!SoundManager.__soundChannelCache.has(url))
            {
                cacheList = [];
                SoundManager.__soundChannelCache.set(url, cacheList);
            }
            else
            {
                cacheList = SoundManager.__soundChannelCache.get(url);
            }
            cacheList.push(channel);
        };

        
        /** 预加载安装声音 */
        SoundManager.preloadSound = function(url, soundClass = null)
        {
            if (!SoundManager._isActive || !url) return null;
            if (SoundManager._muted) return null;

            url = Laya.URL.formatURL(url);
            if (url == SoundManager._bgMusic) 
            {
                if (SoundManager._musicMuted) return null;
            }
            
            var tSound;
            if (!soundClass) soundClass = SoundManager._soundClass;
            if (!tSound) {
                tSound = new soundClass();
                tSound.load(url);
            }

            var channel;
            channel = tSound.preloadSound();
            if (!channel) return null;
            channel.url = url;
            channel.volume = (url == SoundManager._bgMusic) ? SoundManager.musicVolume : SoundManager.soundVolume;

            return tSound;
        };

        MiniSound.prototype.preloadSound = function()
        {
            var tSound;
            if (this.url == Laya.SoundManager._bgMusic) 
            {
                    if (!MiniSound._musicAudio)
                            MiniSound._musicAudio = MiniSound._createSound();
                    tSound = MiniSound._musicAudio;
            } 
            else 
            {
                    if (MiniSound._audioCache[this.readyUrl]) 
                    {
                            tSound = MiniSound._audioCache[this.readyUrl]._sound;
                    } 
                    else 
                    {
                            tSound = MiniSound._createSound();
                    }
            }
            if (!tSound)
                    return null;

            if (MiniAdpter.autoCacheFile && MiniFileMgr.getFileInfo(this.url)) 
            {
                    var fileObj = MiniFileMgr.getFileInfo(this.url);
                    var fileMd5Name = fileObj.md5;
                    tSound.src = this.url = MiniFileMgr.getFileNativePath(fileMd5Name);
            } 
            else 
            {
                    tSound.src = this.url;
            }

            var channel = new MiniSoundChannel(tSound, this);
            channel.url = this.readyUrl;
            channel.loops = 1;
            channel.loop = false;
            channel.startTime = 0;
            tSound.stop();
            SoundManager.addSoundChannelCache(channel);
            return channel;

        }

        MiniSound.prototype.onCanPlaySrc = MiniSound.prototype.onCanPlay
        MiniSound.prototype.onCanPlay = function()
        {
            this.onCanPlaySrc();
            this.dispose();
        }





        SoundManager.playSoundSrc = Laya.SoundManager.playSound;
        SoundManager.playSound = function(url, loops = 1, complete = null, soundClass = null, startTime = 0)
        {
            if (!SoundManager._isActive || !url) return null;
            if (SoundManager._muted) return null;

            url = Laya.URL.formatURL(url);
            if (url == SoundManager._bgMusic) 
            {
                if (SoundManager._musicMuted) return null;
            }
            
            var channel =  SoundManager.getSoundChannelCache(url);
            if(!channel)
            {
                return SoundManager.playSoundSrc(url, loops, complete, soundClass, startTime);
            }

            channel.volume = (url == SoundManager._bgMusic) ? SoundManager.musicVolume : SoundManager.soundVolume;
            channel.completeHandler = complete;
            channel.play();
            return channel;
        };





        Laya.MiniSoundChannel.prototype.__onEndSrc = Laya.MiniSoundChannel.prototype.__onEnd;
        Laya.MiniSoundChannel.prototype.__onEnd = function(evt)
        {
            if (this.loops == 1) 
            {
                if (this.completeHandler) 
                {
                    Laya.systemTimer.once(10, this, this.__runComplete, [this.completeHandler], false);
                    this.completeHandler = null;
                }
                this.stop(false);
                this.event(Laya.Event.COMPLETE);

            }
            else
            {
                this.__onEndSrc(evt);
            }
        };

        Laya.MiniSoundChannel.prototype.stopSrc = Laya.MiniSoundChannel.prototype.stop;
        Laya.MiniSoundChannel.prototype.stop = function(isDispose = true)
        {
            this.isStopped = true;
            Laya.SoundManager.removeChannel(this);
            this.completeHandler = null;
            if (!this._audio)
                return;
            this._audio.stop();
            if(isDispose)
            {
                if (!this.loop) 
                {
                    this._audio.offEnded(null);
                    this._miniSound.dispose();
                    this._audio = null;
                    this._miniSound = null;
                    this._onEnd = null;
                }
            }
            else
            {
                SoundManager.addSoundChannelCache(this);
            }
        };

       
    }

}


window.LayaExtendClass = LayaExtendClass;
window.LayaExtendLogic = LayaExtendLogic;
