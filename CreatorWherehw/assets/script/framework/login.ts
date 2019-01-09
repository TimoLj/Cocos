import {Util} from "./util"

export class Login{
	private static EVENT_INIT_SUCC 	= "EVENT_INIT_SUCC";
	private static EVENT_INIT_FAIL     = "EVENT_INIT_FAIL";
	private static EVENT_LOGIN_SUCC    = "EVENT_LOGIN_SUCC";
	private static EVENT_LOGIN_FAIL    = "EVENT_LOGIN_FAIL";
	private static EVENT_LOGOUT_SUCC   = "EVENT_LOGOUT_SUCC";
	private static EVENT_LOGOUT_FAIL   = "EVENT_LOGOUT_FAIL";

	public static init(param, listener){
		var param = param || {};
	
		var tFuncListener = function(strEvent){
			cc.log("tFuncListener in login.init: {0}", strEvent);
			var et = JSON.parse(strEvent);
			et.param = JSON.parse(et.param);
	
			listener && listener(et);
		}
	
	
		var strParam = JSON.stringify(param);
		var nListener = Util.pushInvoke(tFuncListener);
	
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "init", "(Ljava/lang/String;I)V", strParam, nListener);
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
			setTimeout(function(){
				var et = {}
				et["event"] = this.EVENT_INIT_SUCC;
				et["param"] = JSON.stringify({});
				Util.popInvoke(nListener, JSON.stringify(et));
			}, 0.1);
		}
	}
	
	public static login(param, listener){
		var param = param || {};
	
		var tFuncListener = function(strEvent){
			cc.log("tFuncListener in DYLoginMgr.login: {0}", strEvent);
			var et = JSON.parse(strEvent);
			et.param = JSON.parse(et.param);
	
			listener && listener(et);
		}
	
		var strParam = JSON.stringify(param);
		var nListener = Util.pushInvoke(tFuncListener);
	
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "login", "(Ljava/lang/String;I)V", strParam, nListener);
			}else{
				setTimeout(function(){
					var et = {}
					et["event"] = this.EVENT_LOGIN_SUCC;
					et["param"] = JSON.stringify({
						token : "",
						name : "",
						param : ""
					});
					Util.popInvoke(nListener, JSON.stringify(et));
				}, 0.1);
			}
		}else if (cc.sys.isBrowser){
			// 浏览器版本
			setTimeout(function(){
				var et = {}
				et["event"] = this.EVENT_LOGIN_SUCC;
				et["param"] = JSON.stringify({
					token : Util.getParam("token"),
					name : Util.getParam("openId"),
					param : ""
				});
				Util.popInvoke(nListener, JSON.stringify(et));
			}, 0.1);
		}
	}
	
	public static enter(param, listener){
		var param = param || {};
		var strParam = JSON.stringify(param);
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "enter", "(Ljava/lang/String;I)V", strParam, 0);
			}
		}else if (cc.sys.isBrowser){

		}
	}
	
	public static updateEvent(eventName, param){
		param = param || {};
		param.eventName = eventName;
		var strParam = JSON.stringify(param);
		
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "updateEvent", "(Ljava/lang/String;I)V", strParam, 0);
			}
		}else if (cc.sys.isBrowser){
			
		}
	}
	
	public static regLogout(param, listener){
		var param = param || {};
	
		var tFuncListener = function(strEvent){
			console.log("tFuncListener in DYLoginMgr.regLogout: {0}", strEvent);
			var et = JSON.parse(strEvent);
			et.param = JSON.parse(et.param);
	
			listener && listener(et);
		}
	
		var strParam = JSON.stringify(param);
		var nListener = Util.pushInvoke(tFuncListener);
	
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "regLogout", "(Ljava/lang/String;I)V", strParam, nListener);
			}
		}else if (cc.sys.isBrowser){

		}
	}
	
	public static logout = function(param){
		var param = param || {};
	
		var strParam = JSON.stringify(param);
		if (cc.sys.isNative){
			// 客户端版本
			if (cc.sys.os == cc.sys.OS_ANDROID){
				// 安卓
				jsb.reflection.callStaticMethod("com/dygame/common/DYLoginMgr", "logout", "(Ljava/lang/String;I)V", strParam, 0);
			}
		}else if (cc.sys.isBrowser){
			
		}
	}
}


