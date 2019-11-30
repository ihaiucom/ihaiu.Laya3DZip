

interface _writeFileObject
{
  /**
   * 要写入的文件路径
   */
  filePath: string;

  /**
   * 要写入的文本或二进制数据
   */
  data: string | ArrayBuffer;

  /**
   * 指定写入文件的字符编码
   */
  encoding?: string;

  

  /**
   * 接口调用成功的回调函数
   */
  success?: (res: any) => void;

  /**
   * 接口调用失败的回调函数
   */
  fail?: (result: _writeFileFailObject) => void;

  /**
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete?: (res: any) => void;

}

interface _writeFileFailObject
{
  /**
   * fail no such file or directory, open ${filePath}
   * 指定的 filePath 所在目录不存在
   * 
   * fail permission denied, open ${dirPath}
   * 指定的 filePath 路径没有写权限
   */
  errMsg: string;
}


interface _copyFileObject
{
  /**
   * 源文件路径，只可以是普通文件
   */
  srcPath: string;

  /**
   * 目标文件路径
   */
  destPath: string;

  /**
   * 接口调用成功的回调函数
   */
  success?: (res: any) => void;

  /**
   * 接口调用失败的回调函数
   */
  fail?: (result: _copyFileFailObject) => void;

  /**
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete?: (res: any) => void;


}

interface _copyFileFailObject
{
  /**
   * fail permission denied, copyFile ${srcPath} -> ${destPath}
   * 指定目标文件路径没有写权限
   * 
   * fail no such file or directory, copyFile ${srcPath} -> ${destPath}
   * 源文件不存在，或目标文件路径的上层目录不存在
   */
  errMsg: string;
}


interface _unlinkFileObject {
  /**
   * 要读取的文件的路径
   * 必填
   */
  filePath: string;

  /**
   * 接口调用成功的回调函数
   */
  success?: (res: any) => void;

  /**
   * 接口调用失败的回调函数
   */
  fail?: (result: _unlinkFileFailObject) => void;

  /**
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete?: (res: any) => void;
}

interface _unlinkFileFailObject
{

  /**
   * fail permission denied, open ${path}
   * 指定的 path 路径没有读权限
   * 
   * fail no such file or directory ${path}
   * 文件不存在
   * 
   * fail operation not permitted, unlink ${filePath}
   * 传入的 filePath 是一个目录
   */
  errMsg: string;
}


/**
 * 一个可以监听下载进度变化事件，以及取消下载任务的对象
 * 基础库 1.4.0 开始支持，低版本需做兼容处理。
 */
interface DownloadTask
{
  /**中断下载任务 */
  abort();

  /** 监听下载进度变化事件 */
  onProgressUpdate(callback: Function );

  /** 取消监听下载进度变化事件 */
  offProgressUpdate(callback: (result: _DownloadTaskProgressUpdateResultObject)=>{});

  /** 监听 HTTP Response Header 事件。会比请求完成事件更早 */
  onHeadersReceived(callback: Function);

  /** 取消监听 HTTP Response Header 事件 */
  offHeadersReceived(callback: Function);
}

interface _DownloadTaskProgressUpdateResultObject
{
  /** 下载进度 */
  progress: number;
  /** 已经下载的数据长度 */
  totalBytesWritten: number;
  /** 预期需要下载的数据总长度 */
  totalBytesExpectedToWrite: number;
}


interface _readFileObject {
  /**
   * 要读取的文件的路径
   * 必填
   */
  filePath: string;

  /**
   * 指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容
   */
  encoding?: string;

  /**
   * 接口调用成功的回调函数
   */
  success?: (res: _readFileSuccessObject) => void;

  /**
   * 接口调用失败的回调函数
   */
  fail?: (result: _readFileFailObject) => void;

  /**
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete?: () => void;
}


interface _readFileSuccessObject 
{
  /**
   * 文件内容
   */
  data: string | ArrayBuffer;
}

interface _readFileFailObject 
{
  /**
   * fail no such file or directory, open ${filePath}
   * 指定的 filePath 所在目录不存在
   * 
   * fail permission denied, open ${dirPath}
   * 指定的 filePath 路径没有写权限
   */
  errMsg: string;
}


interface _mkdirObject {
  /**
   * 创建的目录路径
   * 必填
   */
  dirPath: string;

  /**
   * 是否在递归创建该目录的上级目录后再创建该目录。如果对应的上级目录已经存在，则不创建该上级目录。如 dirPath 为 a/b/c/d 且 recursive 为 true，将创建 a 目录，再在 a 目录下创建 b 目录，以此类推直至创建 a/b/c 目录下的 d 目录。
   * 默认值 false
   */
  recursive?: boolean;

  /**
   * 接口调用成功的回调函数
   */
  success?: (res: any) => void;

  /**
   * 接口调用失败的回调函数
   */
  fail?: (result: _mkdirFailObject) => void;

  /**
   * 接口调用结束的回调函数（调用成功、失败都会执行）
   */
  complete?: () => void;
}


interface _mkdirFailObject 
{
  /**
   * fail no such file or directory ${dirPath} 
   * 上级目录不存在
   * 
   * fail permission denied, open ${dirPath}
   * 指定的 filePath 路径没有写权限
   * 
   * fail file already exists ${dirPath}
   * 有同名文件或目录
   */
  errMsg: string;
}


/**
 * InnerAudioContext 实例，可通过 wx.createInnerAudioContext 接口获取实例。
 */
interface InnerAudioContext
{
  /**
   * 音频资源的地址，用于直接播放。2.2.3 开始支持云文件ID
   */
  src: string;

  /**
   * 开始播放的位置（单位：s），默认为 0
   */
  startTime: number;

  /**
   * 是否自动开始播放，默认为 false
   */
  autoplay: boolean;

  /**
   * 是否循环播放，默认为 false
   */
  loop: boolean;

  /**
   * 是否遵循系统静音开关，默认为 true。当此参数为 false 时，即使用户打开了静音开关，也能继续发出声音。从 2.3.0 版本开始此参数不生效，使用 wx.setInnerAudioOption 接口统一设置。
   */
  obeyMuteSwitch: boolean;

  /**
   * 音量。范围 0~1。默认为 1
   * 基础库 1.9.90 开始支持，低版本需做兼容处理。
   */
  volume: number;

  /**
   * 当前音频的长度（单位 s）。只有在当前有合法的 src 时返回（只读）
   */
  readonly duration: number;

  /**
   * 当前音频的播放位置（单位 s）。只有在当前有合法的 src 时返回，时间保留小数点后 6 位（只读）
   */
  readonly currentTime: number;

  /**
   * 当前是是否暂停或停止状态（只读）
   */
  readonly paused: boolean;

  /**
   * 音频缓冲的时间点，仅保证当前播放时间点到此时间点内容已缓冲（只读）
   */
  readonly buffered: number;

  /**
   * 播放
   */
  play();

  /**
   * 暂停。暂停后的音频再播放会从暂停处开始播放
   */
  pause();

  /**
   * 停止。停止后的音频再播放会从头开始播放。
   */
  stop();

  /**
   * 跳转到指定位置
   */
  seek(position: number);

  /**
   * 销毁当前实例
   */
  destory();

  /**
   * 监听音频进入可以播放状态的事件。但不保证后面可以流畅播放
   */
  onCanplay(callback: Function);
  

  /**
   * 取消监听音频进入可以播放状态的事件
   */
  offCanplay(callback: Function);

  

  /**
   * 监听音频播放事件
   */
  onPlay(callback: Function);
  

  /**
   * 取消监听音频播放事件
   */
  offPlay(callback: Function);

  

  

  /**
   * 监听音频暂停事件
   */
  onPuase(callback: Function);
  

  /**
   * 取消监听音频暂停事件
   */
  offPause(callback: Function);

  
  

  /**
   * 监听音频停止事件
   */
  onStop(callback: Function);
  

  /**
   * 取消监听音频停止事件
   */
  offStop(callback: Function);

  

  /**
   * 监听音频自然播放至结束的事件
   */
  onEnded(callback: Function);
  

  /**
   * 取消监听音频自然播放至结束的事件
   */
  offEnded(callback: Function);
  

  

  /**
   * 监听音频播放进度更新事件
   */
  onTimeUpdate(callback: Function);
  

  /**
   * 取消监听音频播放进度更新事件
   */
  offTimeUpdate(callback: Function);
  

  

  /**
   * 监听音频播放错误事件
   */
  onError(callback: Function);
  

  /**
   * 取消监听音频播放错误事件
   */
  offError(callback: Function);

  

  /**
   * 监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
   */
  onWaiting(callback: Function);
  

  /**
   * 取消监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
   */
  offWaiting(callback: Function);



  /**
   * 监听音频进行跳转操作的事件
   */
  onSeeking(callback: Function);
  

  /**
   * 取消监听音频进行跳转操作的事件
   */
  offSeeking(callback: Function);

  


  /**
   * 监听音频完成跳转操作的事件
   */
  onSeeked(callback: Function);
  

  /**
   * 取消监听音频完成跳转操作的事件
   */
  offSeeked(callback: Function);






}


declare namespace wx 
{

  /** 文件管理器 */
  export class FileSystemManager
  {
      /** 创建目录 */
      mkdir(obj:_mkdirObject);

      /** 
       * 读取本地文件内容, 同步版本
       * @param filePath 要读取的文件的路径
       * @param encoding 指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容
       * @returns 文件内容
       * 
       * @错误 
       * fail no such file or directory, open ${filePath}
       * 指定的 filePath 所在目录不存在
       * 
       * fail permission denied, open ${dirPath}
       * 指定的 filePath 路径没有读权限
       */
      readFileSync(filePath:string , encoding:string ):string|ArrayBuffer;

      /** 
       * 读取本地文件内容
       * 
       */
      readFile(obj: _readFileObject);

      /**
       * 获取该小程序下的 本地临时文件 或 本地缓存文件 信息
       */
      getFileInfo(obj: _getFileInfoObject);

      /**
       * 删除文件
       */
      unlink(obj: _unlinkFileObject);

      /**
       * 删除文件, 同步版本
       * 
       * @错误
        * fail permission denied, open ${path}
        * 指定的 path 路径没有读权限
        * 
        * fail no such file or directory ${path}
        * 文件不存在
        * 
        * fail operation not permitted, unlink ${filePath}
        * 传入的 filePath 是一个目录
       */
      unlinkSync(filePath: string);

      /** 复制文件 */
      copyFile(obj:_copyFileObject);

      /**
       * 复制文件, 同步版本
       * @param srcPath 源文件路径，只可以是普通文件
       * @param destPath 接口调用成功的回调函数
       * 
       * @错误
      * fail permission denied, copyFile ${srcPath} -> ${destPath}
      * 指定目标文件路径没有写权限
      * 
      * fail no such file or directory, copyFile ${srcPath} -> ${destPath}
      * 源文件不存在，或目标文件路径的上层目录不存在
       */
      copyFileSync(srcPath: string, destPath: string);

      /** 写文件 */
      writeFile(obj:_writeFileObject);

      /** 写文件， 同步版 */
      writeFileSync(filePath:string , data:string|ArrayBuffer , encoding:string );

}
  
    /** 获取全局唯一的文件管理器 */
    export function getFileSystemManager():FileSystemManager;
}