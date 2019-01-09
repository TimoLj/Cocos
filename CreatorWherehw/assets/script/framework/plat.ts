import {Util} from "./util"
import {Cache} from "./cache"

export class Plat{
    public static gameId = "1001";
    public static mappingId = "1001"
    public static version = "1.0.0";
    public static regionId = 0;
    public static subChannel = "";

    public static mode = function(){
        return "debug";    
    }
    
    public static channel = function(){
        if (cc.sys.isNative){
            // 客户端版本
            if (cc.sys.os == cc.sys.OS_ANDROID){
                // 安卓
                jsb.reflection.callStaticMethod("com/dygame/common/DYCommon", "channelName", "(Ljava/lang/String;)Ljava/lang/String;", "");
            }else{
                return "000000";
            }
        }else if (cc.sys.isBrowser){
            // 浏览器版本
            if (cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT || cc.sys.browserType == "mqqbrowser"){
                // return "111267"   
                return "000000";
            }else{
                // return "000433";
                return "000000";
            }
        }
        return "000000";
    }
    
    public static plat = function(){
        if (cc.sys.isNative){
            switch(cc.sys.platform){
            case cc.sys.WIN32 : return "win32"
            case cc.sys.LINUX : return "linux"
            case cc.sys.MACOS : return "mac"
            case cc.sys.ANDROID : return "android"
            case cc.sys.IPHONE : 
            case cc.sys.IPAD : return "ios"
            default: 
                return "unknown"
            }
        }
        return "web";
    }
    
    public static isInitSucc = function(){//sdk是否初始化成功
        if(this.channel() == "000433"){
            this.subChannel = window["ZMUserInfo"].common.sdkindx;
            return window["ZMUserInfo"].isInitSucc;
        }
    
        return true;
    }
    
    public static accountParam = function(){//sdk提供的name和token，用于生成account账号
        if(this.channel() == "000433"){
            let data = {
                name  : window["ZMUserInfo"].userdata.uid,
                token : window["ZMUserInfo"].userdata.sign,
                param : window["ZMUserInfo"].userdata.t,
            };
            return data;
        }
    
        if(this.channel() == "000000"){
            let data = {};
            data["name"] = Cache.get(Cache.CK_USERNAME, Util.uuid());
            data["token"] = Cache.get(Cache.CK_PASSWORD, Util.uuid());
            data["param"] = "";
            return data;
        }
    }
}



  // <!-- 防止index.html被浏览器缓存 begin -->
  // <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  // <meta http-equiv="Pragma" content="no-cache" />
  // <meta http-equiv="Expires" content="0" />
  // <!-- 防止index.html被浏览器缓存 over -->