import { BattleMgr } from "./BattleMgr";
import { Notify } from "../Frame/Notify";
import { Actor } from "./Actor";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    robotPlace: cc.Node = null;
    @property(cc.Node)
    enemyPlace: cc.Node = null;
    @property(cc.Node)
    bulletPlace: cc.Node = null;

    mBattleMgr: BattleMgr;

    // onLoad () {}

    start () {
        let a = 1;
        for(let key in this.node.children){
            let value = this.node.children[key];
            a++;
            value.zIndex = a*10; 
        }

        this.mBattleMgr = new BattleMgr();

        setTimeout(()=>{
            this._createEntityAtBegin();
        }, 300)

        this._addEvent();
    }



    update (dt) {
        let timeLine = 1;
        if(this.mBattleMgr){
            this.mBattleMgr.update(timeLine);
        }




    }

    onDestroy() {
        this._removeEvent();
    }

    _addEvent() {
        Notify.on(Notify.eventType.createAlly, this._createAlly, this);
        Notify.on(Notify.eventType.createEnemy, this._createEnemy, this);
        Notify.on(Notify.eventType.createBullet, this._createBullet, this);
    }

    _removeEvent() {
        Notify.off(Notify.eventType.createEnemy, this._createAlly);
        Notify.off(Notify.eventType.createEnemy, this._createEnemy);
        Notify.off(Notify.eventType.createEnemy, this._createBullet);
    }

    _createAlly(info) {
        let unit = info[0] as Actor;
        let self = this;
        cc.loader.loadRes(unit.mData.Model, cc.Prefab, (err, res)=>{
            let a = cc.instantiate(res);
            a.getComponent("nodActor").init(unit);
            self.robotPlace.addChild(a);
        }) 
        cc.log(unit)
    }

    _createEnemy(info) {
        let unit = info[0] as Actor;
        let self = this;
        cc.loader.loadRes(unit.mData.Model, cc.Prefab, (err, res)=>{
            let a = cc.instantiate(res);
            a.getComponent("nodActor").init(unit);
            self.enemyPlace.addChild(a);
        }) 
    }

    _createBullet(info) {
        let unit = info[0] as Actor;
        let self = this;
        cc.loader.loadRes(unit.mData.Model, cc.Prefab, (err, res)=>{
            let a = cc.instantiate(res);
            a.getComponent("nodActor").init(unit);
            self.bulletPlace.addChild(a);
        }) 
    }

    _createEntityAtBegin() {
        this.mBattleMgr.createAlly(10001, 1, { x: 200, y: 200})
    }

}
