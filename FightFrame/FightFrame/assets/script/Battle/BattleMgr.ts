import { Actor } from "./Actor";
import { Bullet } from "./Bullet";
import { eUnitGroup } from "./BattleDef";
import { Notify } from "../Frame/Notify";
import { ConfigMgr } from "../Frame/ConfigMgr";

export class BattleMgr {
    mAllyList: Array<Actor> = new Array<Actor>();
    mEnemyList: Array<Actor> = new Array<Actor>();
    mBulletList: Array<Bullet> = new Array<Bullet>();

    mActorUID: number = 0;
    mTargetAll: Actor = null;

    constructor() {
        this._addEvent();
    }

    _addEvent() {   // 建立消息监听事件

    }

    _removeEvent() {    // 删除消息监听事件

    }

    createAlly(type: number, RID: number, pos: object) {
        let info = ConfigMgr.getById("Actor", type);
        let data = {
            Name : info.Name,
            AttackType : info.AttackType,
            RID : RID,
            UID : this.mActorUID++,
            SkillList : info.Skills,
            Group : eUnitGroup.mAlly,
            Scale : info.Scale,
            OriginalData : info,
        }

        let actor = new Actor(this, data);
        actor.setPos(pos);
        this.mAllyList.push(actor); 
        Notify.emit(Notify.eventType.createAlly, actor);

        return actor;
    }

    createEnemy(type: number, rank: number, pos) {
        let info;
        let data = {
            Name : info.Name,
            AttackType : info.AttackType,
            RID : type,
            UID : this.mActorUID++,
            skillList : info.Skills,
            Group : eUnitGroup.mAlly,
            Rank : rank,
            OriginalData : info,
        }
        let actor = new Actor(this, data);
        actor.setPos(pos);
        this.mEnemyList.push(actor);
        Notify.emit(Notify.eventType.createEnemy, actor);

        return actor;
    } 

    createBullet(creator: Actor, target: Actor, BulletID: number, isIntensify: boolean) {
        let bullet = new Bullet(creator, target, BulletID, isIntensify);
        bullet.mUID = this.mActorUID++;
        this.mBulletList.push(bullet);
        Notify.emit(Notify.eventType.createBullet, bullet);

        return bullet;
    }

    getAllyList() {
        return this.mAllyList;
    }

    getEnemyList() {
        return this.mEnemyList;
    }

    resetAll() {
        this.mAllyList = [];
        this.mEnemyList = [];
        this.mBulletList = [];
    }

    resetAlly() {
        this.mAllyList = [];
    }

    resetEnemy() {
        this.mEnemyList = [];
    }
    
    resetBullet() {
        this.mBulletList = [];
    }

    update(dt) {
        for(let value of this.mAllyList){
            value.onUpdate(dt);
        }

        for(let value of this.mEnemyList){
            value.onUpdate(dt);
        }

        for(let value of this.mBulletList){
            value.onUpdate(dt);
        }

        // 移除死亡角色
        for(let key in this.mAllyList){
            let value =  this.mAllyList[key];
            if(value.mIsDead) this.mAllyList.splice(Number(key));
        }

        for(let key in this.mEnemyList){
            let value = this.mEnemyList[key];
            if(value.mIsDead) this.mEnemyList.splice(Number(key));
        }

        for(let key in this.mBulletList){
            let value = this.mBulletList[key];
            if(value.mIsDead) this.mBulletList.splice(Number(key))
        }
    }


}