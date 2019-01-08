import { Unit } from "./Unit";
import { Actor } from "./Actor";
import { eUnitType, eUnitGroup } from "./BattleDef";
import { BattleMgr } from "./BattleMgr";
import { Common } from "../frame/common";

export class Bullet extends Unit {
    mCreator: Actor;
    mTarget: Actor;
    mBulletID : number;
    mType: number = eUnitType.mNull;
    mScale: number = 1;
    mHitList: object = {};
    mBattleMgr: BattleMgr;

    isIntensify: boolean;           // 子弹是否被技能或者芯片加强
    isHitDie: boolean;              // 击中后是否消失
    mHitCount: number = 1;          // 最大击中数
    isPierce: boolean = false;      // 子弹是否穿透
    mPierceCount: number = 0;       // 子弹穿透数量
    isSplit: boolean = false;       // 子弹是否分裂
    mSplitCount: number = 0;        // 子弹分裂数量
    isPop: boolean = false;         // 子弹是否弹射
    mPopCount: number = 0;          // 子弹弹射数量

    constructor(creator: Actor, target: Actor, bulletID: number, isIntensify: boolean){
        super();

        this.mCreator = creator;
        this.mTarget = target;
        this.mBulletID = bulletID;
        this.mBattleMgr = this.mCreator.mBattleMgr;
        if(creator.mGroup == eUnitGroup.mAlly){
            this.mType = eUnitGroup.mAllyBullet;
        }
        else if(creator.mGroup == eUnitGroup.mEnemy){
            this.mType = eUnitGroup.mEnemyBullet;
        }

        // 读取配置表 赋值






    }


    public onUpdate(dt: any) {  // 更新所有组件




    }  

    public onLaterUpdate(dt: any) {




    }

    public onUnitCollider(collider: Unit) {  // 碰撞
        if(this.mIsDead) return; // 子弹是否死亡
        if(collider.mUID == this.mCreator.mUID) return; // 碰撞体是否是自身

        let curCollider = collider as Actor;
        if(this.mHitList[curCollider.mUID]) return; // 是否是被攻击过的对象
        if(!curCollider.mIsChoose) return;  // 是否是能被选取的对象

        this.mHitList[curCollider.mUID] = curCollider;






        if(this.isHitDie || Common.procnt(this.mHitList)>=this.mHitCount) { // 判定子弹击中后死亡
            this.mIsDead = true;
        }
    }
}