import { ConfigMgr } from "./ConfigMgr";
import { Util } from "../framework/util";

export class DropMgr{

    public static dropBak(dropId){
        var items = {};
        var dropCfg = ConfigMgr.getById("Drop", dropId);

        for(let id of dropCfg.DropIds){
            let dropItemCfg = ConfigMgr.getById("DropItemCfg", id);
            let random = Util.random(1, 100);
            if (random > dropItemCfg.Rate) continue;

            let count = Util.random(dropItemCfg.Min, dropItemCfg.Max);
            // if(ThingMgr.isRichItem(dropItemCfg.ItemID)){
                // for (let i = 0; i < count; i++) {
                //     let richItem = ms.RoleMgr.makeObjItem(dropItemCfg.ItemID);
                //     items[richItem.id] = items[richItem.id] || {};
                //     items[richItem.id][richItem.uid] = richItem
                // }
            // }else{
            //     items[dropItemCfg.ItemID] = count;
            // }
        }


        return items;
    }

    public static drop(dropId, count){
        count = count || 3;

        var ret = [];
        var dropCfgs = ConfigMgr.getById("Drop", dropId);
        var rolls = [];
        var weight = 0;
        for(let key in dropCfgs){
            weight += dropCfgs[key].Weight;
            rolls.push(dropCfgs[key]);
        }

        for (let index = 0; index < count; index++) {
            let point = Util.random(1, weight);
            let temp = 0;
            let shake = -1;
            for(let index in rolls){
                temp += rolls[index].Weight;
                if(temp >= point){
                    shake = parseInt(index);
                    break;
                }
            }

            weight -= rolls[shake].Weight;
            ret.push(rolls[shake].ThingId);
            rolls.splice(shake, 1);
        }
        
        return ret;
    }
}