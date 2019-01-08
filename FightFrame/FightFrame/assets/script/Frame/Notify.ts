import { Common } from "./common";

export class Notify {
    static eventObj = new Object();

    static on (type: number, callback, target) {
        if(Notify.eventObj[type] === undefined){
            Notify.eventObj[type] = [];
        }
        Notify.eventObj[type].push({ 
            callback: callback, 
            target: target
        })
    }

    static off (type: number, callback) {
        let arr = Notify.eventObj[type];
        if(arr === undefined) return;

        for(let key in arr){
            let value = arr[key]
            if(value && value.callback === callback){
                value = undefined;
                break;
            }
        }
    }


    static emit(type: number, ...args){
        let arr = Notify.eventObj[type];
        if(arr === undefined) return;
        for(let key in arr){
            let value = arr[key]
            if(value) value.callback.call(value.target, args);
        }
    }

    static offType (type) {
        delete Notify.eventObj[type];
    }

    static clear () {
        Notify.eventObj = {};
    }

    static eventType =  {
        createAlly :    1001,
        createEnemy :   1002,
        createBullet :   1003,
    }


}
