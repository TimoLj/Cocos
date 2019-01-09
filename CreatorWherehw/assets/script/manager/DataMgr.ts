import { CommonMgr } from "./CommonMgr";
import { Def } from "./DefMgr";
import { Util } from "../framework/util";
import { Crypto } from "../framework/crypto";

var DEFAULT_CORE = {
	index : 0,
	state : 0,

	package : {},
};

export class DataMgr{
	private static _base = null;
	private static _core = null;
	private static _sign = {};
	private static _modifyData = {};//存储改变的部分数据
	private static _modifyBuff = {};//当改变的部分数据正处于提交远端同步过程中，不知成功与否，新产生的改变数据存于此
	private static _modifySign = {};

	private static _mem = {};//内存数据
	private static _memSign = {};//内存数据签名
	
	private static _waitModify = false;//true表示mModifyData的数据正在同步的过程中，还未结束
	private static _waitSave = false;//true表示有同步请求过来，但当前正在同步，所以暂时搁置，等当前同步结束（不管成功与否），立刻再同步一次

	public static setMem(key, value){
		this._mem[key] = value;
		this._memSign[key] = Crypto.xor("cos" + value);
	}

	public static getMem(key){
		var value = this._mem[key];
		if(typeof value == "undefined") return value;
		
		var mi = Crypto.xor("cos"+ value);
		if(mi != this._memSign[key]) {
			throw new Error("mem get {?}".format(key));
		}
		return value;
	}
	
	public static initBase(base){
		this._base = base;
		this.signFunc(this._sign, "base", this._base);
	}
	
	public static initCore(core){
		this._core = core;
		this.signFunc(this._sign, "core", this._core);
	}
	
	public static resetCore(){
		this.set("core", Util.clone(DEFAULT_CORE));
	}
	
	public static unique(){
		return this.add("core.index", 1);
	}

	public static isDataInit(){
		return this.get("core.state") != 0;
	}
	
	public static dataInitComplete(){
		this.set("core.state", 1);
	}
	public static resetSign(){
		this._sign = {};
		this._modifySign = {};
		this._modifyData = {};
		this._modifyBuff = {};
		this.signFunc(this._sign, "base", this._base);
		this.signFunc(this._sign, "core", this._core);
	}
	
	private static signFunc(sign, signKey, value){
		var func = function(signKey, value){
			if(value === null || value === undefined) return;
			if(typeof value != "object"){
				sign[signKey] = Crypto.xor("cos" + value);
			}else{
				for(let key in value){
					func(signKey + "." + key, value[key]);
				}
			}
		}
		func(signKey, value);
	}
	
	private static checkSign(sign, signKey, value){
		var func = function(signKey, value){
			if(value === null || value === undefined) return;
			if(typeof value != "object"){
				var mi = Crypto.xor("cos"+ value);
				if(mi != sign[signKey]) {
					throw new Error("data get {?}".format(signKey));
				}
			}else{
				for(let key in value){
					func(signKey + "." + key, value[key]);
				}
			}
		}
	
		func(signKey, value);
	}
	
	public static set(keyStr, value){
		if(!keyStr) {
			throw new Error("data set {?}".format(keyStr));
		}
		
		var keys = keyStr.split(".");
	
		var data = null;
		if(keys[0] == "base"){
			data = this._base;
		}else if(keys[0] == "core"){
			data = this._core;
		}else{
			throw new Error("data set {?} illegal".format(keyStr));
		}
	
		for (var i = 1; i < keys.length-1; i++) {
			if(i < keys.length-1){
				if(typeof data[keys[i]] != "object" || data[keys[i]] === null){
					data[keys[i]] = {};
				}
			}
			data = data[keys[i]];
		}
	
		if(value === null || value === undefined){//删除该值
			if(keys.length <= 1){
				if(keys[0] == "base"){
					this._base = value;
				}else if(keys[0] == "core"){
					this._core = value;
				}
			}else{
				delete data[keys[keys.length-1]];
			}
			this.mergeDiffData(this._waitModify ? this._modifyBuff : this._modifyData, keyStr, value);
			return;
		}
	
		if(keys.length <= 1){
			if(keys[0] == "base"){
				this._base = value;
			}else if(keys[0] == "core"){
				this._core = value;
			}
		}else{
			data[keys[keys.length-1]] = value;
		}
	
		this.signFunc(this._sign, keyStr, value);
		this.mergeDiffData(this._waitModify ? this._modifyBuff : this._modifyData, keyStr, value);//差异化部分另外存储
		return value;
	}
	
	private static mergeDiffData(modify, keyStr, value){//这部分合并存储的代码用于差异化远端同步
		if(value === null || value === undefined) value = "undefined";//空值没法序列化
		this.signFunc(this._modifySign, keyStr, value);
	
		if(keyStr == "base" || keyStr == "core"){
			for(let key in modify){
				if(key.split(".")[0] == keyStr){
					delete modify[key];
				}
			}
			modify[keyStr] = value;
			return;
		}
	
		for(let key in modify){
			if(key == keyStr){
				modify[keyStr] = value;
				return;
			}
	
			if(key.indexOf(keyStr+".") >= 0){
				delete modify[key];
				continue;
			}
	
			if(keyStr.indexOf(key+".") >= 0){
				var data = modify[key];
				if(typeof data != "object" || data === null){
					if(value === "null" || value === "undefined" || value === null || value === undefined) return;//防止前面的赋值被抹掉，这个删除无意义
					delete modify[key];
					modify[keyStr] = value;
					return;
				}
	
				var tempStr = keyStr.substr(key.length+1);
				var keys = tempStr.split(".");
				for (var i = 0; i < keys.length-1; i++) {
					if(typeof data[keys[i]] != "object" || data[keys[i]] === null){
						data[keys[i]] = {};
					}
					data = data[keys[i]];
				}
	
				if(value === "null" || value === "undefined" || value === null || value === undefined){
					delete data[keys[keys.length-1]];
				}else{
					data[keys[keys.length-1]] = value;
				}
				return;
			}
		}
		modify[keyStr] = value;
	}
	
	//更新值，只能更新number类的值
	public static add(keyStr, value){
		var data = this.get(keyStr);
		if(!data && data !== ""){
			data = 0;
		}else{
			if(typeof data != "number") {
				throw new Error("add error data={?}".format(JSON.stringify(data)));
			}
		}
		return this.set(keyStr, value+data);
	}
	
	public static get(keyStr){
		if(!keyStr) {
			throw new Error("data get {?}".format(keyStr));
		}
		var keys = keyStr.split(".");
	
		var data = null;
		if(keys[0] == "base"){
			data = this._base;
		}else if(keys[0] == "core"){
			data = this._core;
		}
	
		// 如果在 initSign 之前获取数据, 第一时间抛出
		if (!data){
			throw new Error("data get {?} illegal".format(keyStr));
		}
	
		for (var i = 1; i < keys.length; i++) {
			if(i < keys.length-1){
				if(typeof data[keys[i]] != "object" || data[keys[i]] === null) return;
			}
			data = data[keys[i]];
		}
	
		this.checkSign(this._sign, keyStr, data);
		return data || 0;
	}
	
	public static clear(keyStr){
		this.set(keyStr, null);
	}
	
	// 主要用于强制保存数据, 并回调是否下刷成功
	public static trySave(cb?){
		if(this._waitModify){//上一次同步还未结束，此次先不同步
			this._waitSave = true;
			cb && cb(true);
			return;
		}
	
		if(Object.getOwnPropertyNames(this._modifyData).length <= 0){//无差异数据
			cb && cb();
			return;
		}
		
		for(var key in this._modifyData){//提交前做校验
			this.checkSign(this._modifySign, key, this._modifyData[key]);
		}
	
		var func = function(err){
			if(err){
				for(let keyStr in this._modifyBuff){
					this.mergeDiffData(this._modifyData, keyStr, this._modifyBuff[keyStr]);
				}
				// CommonMgr.toast("存档失败，请检查网络", 2);
			}else{
				this._modifyData = this._modifyBuff;
			}
			this._waitModify = false;
			this._modifyBuff = {};
			cb && cb(err);
			if(this._waitSave){
				this._waitSave = false;
				this.trySave();
			}
		}
	
		this._waitModify = true;
		var md = JSON.stringify(this._modifyData);
		// Http.updateData(func, ms.mem.uid, md);
	}
	
	public static init(){    
		setInterval(this.trySave, Def.DEFAULT_FLUSH_STEP);
	}
}