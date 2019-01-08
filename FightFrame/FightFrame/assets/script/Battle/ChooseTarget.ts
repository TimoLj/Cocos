import { eTargetType, eSortType, eComponent, eAttackType, eAttri } from "./BattleDef";
import { Actor } from "./Actor";
import { AttriComponent } from "../Components/AttriComponent";

class ChooseTarget {
    static ChooseDic = {
        [eTargetType.mAlly]: ChooseTarget.GetAlly, 

  
  

    }

    static GetAlly(actor: Actor, num: number, sort) {
        if(!num) cc.error(`num is error!`);
    

    }



    private static sertActor(list: Array<Actor>, sortType: number, actor: Actor){
        switch(sortType){
            case eSortType.mNormal:     // 默认排序
                return list;
            case eSortType.mLifeUp:     // 血量递增
                return ChooseTarget.sortByLife(list, 1);
            case eSortType.mLifeDown:
                return ChooseTarget.sortByLife(list, -1);
            case eSortType.mLifePerUp:
                return ChooseTarget.sortByLisfPer(list, 1);
            case eSortType.mLifePerDown:
                return ChooseTarget.sortByLisfPer(list, -1);
            case eSortType.mDisUp:
                return ChooseTarget.sortByDis(list, 1, actor);
            case eSortType.mDisDown:
                return ChooseTarget.sortByDis(list, -1, actor);
            default: // 随机排序
                return ChooseTarget.sortByRand(list);
        }
    }

    private static sortByLife(list: Array<Actor>, dire: number) { 
        function by(a: Actor, b: Actor){
            let mAttriA = a.getComponent<AttriComponent>(eComponent.AttriComponent);
            let mAttriB = b.getComponent<AttriComponent>(eComponent.AttriComponent);

            let aLife = mAttriA.get(eAttri.hp);
            let bLife = mAttriB.get(eAttri.hp);

            return aLife > bLife ? -dire : dire;
        }
        return list.sort(by)
    }

    private static sortByLisfPer(list: Array<Actor>, dire: number) {
        function by(a: Actor, b: Actor){
            let mAttriA = a.getComponent<AttriComponent>(eComponent.AttriComponent);
            let mAttriB = b.getComponent<AttriComponent>(eComponent.AttriComponent);

            let aLife = mAttriA.get(eAttri.hp)/mAttriA.get(eAttri.hpMax);
            let bLife = mAttriB.get(eAttri.hp)/mAttriB.get(eAttri.hpMax);

            return aLife > bLife ? -dire : dire;
        }
        return list.sort(by)
    }

    private static sortByDis(list: Array<Actor>, dire: number, actor: Actor) {
        function by(a: Actor, b: Actor) {
            let disA = Math.abs(Math.sqrt(Math.pow(a.x-actor.x, 2) + Math.pow(a.y-actor.y, 2)));
            let disB = Math.abs(Math.sqrt(Math.pow(b.x-actor.x, 2) + Math.pow(b.y-actor.y, 2)));

            return disA > disB ? -dire : dire
        }
        return list.sort(by);
    }

    private static sortByRand(list: Array<Actor>) {
        function by() {
            return Math.random() * 100 < 50 ? 1 : -1;
        }
        return list.sort(by);    
    }

    private static isChoose(list: Array<Actor>) {
        let listNew = new Array<Actor>();
        for(let value of list){
            if(!value.mIsDead && value.mIsChoose){
                listNew.push(value);
            }
        }
        return listNew;
    }

}