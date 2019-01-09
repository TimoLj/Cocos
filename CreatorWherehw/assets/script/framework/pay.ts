import { Util } from "./util";

export class Pay{
    private static EVENT_INIT_SUCC = "EVENT_INIT_SUCC";
    private static EVENT_INIT_FAIL = "EVENT_INIT_FAIL";
    private static EVENT_PAY_SUCC = "EVENT_PAY_SUCC";
    private static EVENT_PAY_FAIL = "EVENT_PAY_FAIL";

    public static init(param, listener){
        var param = param || {};
    
        var tFuncListener = function(strEvent){
            console.log("tFuncListener in pay.init: {0}", strEvent);
            var et = JSON.parse(strEvent);
            et.param = JSON.parse(et.param);
    
            // et = {event:ms.login.EVENT_INIT_OK, param:{}}
            if (listener){
                listener(et);
            }
        }
    
    
        var strParam = JSON.stringify(param);
        var nListener = Util.pushInvoke(tFuncListener);
    
        if (cc.sys.isNative){
            // 客户端版本
            if (cc.sys.os == cc.sys.OS_ANDROID){
                // 安卓
                jsb.reflection.callStaticMethod("com/dygame/common/DYIAPMgr", "init", "(Ljava/lang/String;I)V", strParam, nListener);
            }
            else{
                // 其它版本
                setTimeout(function(){
                    var et = {}
                    et["event"] = this.EVENT_INIT_SUCC;
                    et["param"] = JSON.stringify({});
                    Util.popInvoke(nListener, JSON.stringify(et));
                }, 0.1);
            }
        }
        else if (cc.sys.isBrowser){
            // 浏览器版本
            // ms.root.scheduleOnce(function(){
            //     var et = {}
            //     et.event = ms.iap.EVENT_INIT_SUCC;
            //     et.param = JSON.stringify({});
            //     ms.util.popInvoke(nListener)(JSON.stringify(et));
            // }, 0.1);
        }
    }
        
    public static pay(param, listener){
        var param = param || {};
    
        var tFuncListener = function(strEvent){
            console.log("tFuncListener in DYIAPMgr.pay: {0}", strEvent);
    
            var et = JSON.parse(strEvent);
            et.param = JSON.parse(et.param);
    
            if (listener){
                listener(et);
            }
        }
    
        var strParam = JSON.stringify(param);
        var nListener = Util.pushInvoke(tFuncListener);
    
        if (cc.sys.isNative){
            // 客户端版本
            if (cc.sys.os == cc.sys.OS_ANDROID){
                // 安卓
                jsb.reflection.callStaticMethod("com/dygame/common/DYIAPMgr", "pay", "(Ljava/lang/String;I)V", strParam, nListener);
            }
            else{
                // 其它版本
                console.log("Not support on this native version, os = {0}", cc.sys.os);
            }
        }
        else if (cc.sys.isBrowser){
            // 浏览器版本
            if (cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT || cc.sys.browserType == "mqqbrowser"){
                // 调用微信的支付接口
                window["games51ToPayment"](param);
            }
            
            setTimeout(function(){
                var et = {}
                et["event"] = this.EVENT_PAY_SUCC;
                et["param"] = JSON.stringify({"game_id":10000});
    
                Util.popInvoke(nListener, JSON.stringify(et));
            }, 0.1);
        }
    }
}