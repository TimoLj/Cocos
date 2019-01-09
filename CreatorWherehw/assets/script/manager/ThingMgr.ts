import { DataMgr } from "./DataMgr";
import { eNotifyEvent, eThingType } from "./DefMgr";
import { Notify } from "../framework/notify";
import { ConfigMgr } from "./ConfigMgr";

export class ThingMgr{
	public static getPackage(){
		return DataMgr.get("core.package");
	}
	
	public static clearPackage(){
		DataMgr.clear("core.package");
		Notify.emit(eNotifyEvent.ThingChange);
		Notify.emit(eNotifyEvent.RichChange);
	}
	
	public static getItemByType(type){
		var ret = {};
		var bag = DataMgr.get("core.package");
		for(let key in bag){
			var itemCfg = ConfigMgr.getById("Thing", key);
			if(itemCfg.Type != type) continue;
			if(!bag[key]) continue;
			ret[key] = bag[key];
		}
		return ret;
	}
	
	public static getItemByTypes(types){
		var ret = {};
		for(let type of types){
			Object.assign(ret, this.getItemByType(type));
		}
		return ret;
	}
	
	public static getItem(id){
		return DataMgr.get("core.package." + id) || 0;
	}
	
	public static addItem(items, value){
		if(typeof items == "object"){
			for(let key in items){
				if(DataMgr.get("core.package." + key)){
					DataMgr.add("core.package." + key, items[key]);
				}else{
					DataMgr.set("core.package." + key, items[key]);
				}
			}
		}else{
			if(DataMgr.get("core.package." + items)){
				DataMgr.add("core.package." + items, value);
			}else{
				DataMgr.set("core.package." + items, value);
			}
		}
		Notify.emit(eNotifyEvent.ThingChange);
	}
	
	public static setItem(items, value){
		if(typeof items == "object"){
			for(let key in items){
				DataMgr.set("core.package." + key, items[key]);
			}
		}else{
			DataMgr.set("core.package." + items, value);
		}
		Notify.emit(eNotifyEvent.ThingChange);
	}
	
	public static reduceItem(items, value){
		if(typeof items == "object"){
			for(let key in items){
				DataMgr.add("core.package." + key, -items[key]);
			}
		}else{
			DataMgr.add("core.package." + items, -value);
		}
	
		Notify.emit(eNotifyEvent.ThingChange);
	}
	
	
	public static getRich = function(type, id){//type 是对应Thing表中的ID
		return DataMgr.get("core.package.{?}.{?}".format(type, id));
	}
	
	public static saveRich = function(rich){
		DataMgr.set("core.package.{?}.{?}".format(rich.type, rich.id), rich);
		Notify.emit(eNotifyEvent.RichChange);
	}
	
	public static reduceRich = function(rich){
		DataMgr.clear("core.package.{?}.{?}".format(rich.type, rich.id));
		Notify.emit(eNotifyEvent.RichChange);
	}
	
	public static isEnough = function(items, value){
		if(!items) return true;
	
		if(typeof items == "object"){
			var things = DataMgr.get("core.package");
			for(let key in items){
				if(items[key] <= 0) continue;
				if(things[key] && things[key] >= items[key]) continue;
				return false;
			}
		}else{
			var count = DataMgr.get("core.package." + items) || 0;
			if(count < value) return false;
		}
		return true;
	}
	
	public static isRichType = function(id){
		var item = ConfigMgr.getById("Thing", id);
		if(item.Type == eThingType.chip) return true;
		if(item.Type == eThingType.equip) return true;
		return false;
	}
	
	public static packageWeight = function(){
		return 100;
	}
}
