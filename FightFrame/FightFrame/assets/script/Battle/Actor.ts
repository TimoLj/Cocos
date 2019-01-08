import { Unit } from "./Unit";
import { eActionState, eRank, eAttackType, eUnitGroup, eComponent } from "./BattleDef";
import nodActor from "./nodActor";
import { BattleMgr } from "./BattleMgr";
import { AttriComponent } from "../Components/AttriComponent";
import { MoveComponent } from "../Components/MoveComponent";
import { SkillComponent } from "../Components/SkillComponent";
import { BuffComponent } from "../Components/BuffComponent";
import { AIComponent } from "../Components/AIComponent";

export class Actor extends Unit {
    mName: string;
    mType: number;
    mIcon: string;
    mLevel: number = 0;
    mBattleMgr: BattleMgr;
    mSkillList = new Array<number>();
    mActionState: number = eActionState.mIdle;     // 单位行动状态(待机 攻击准备 攻击中 移动 死亡)
    mActorState: Array<number>;             // 单位属性状态(眩晕...)
    mBehevior: nodActor;                    
    mScale: number = 1;
    mSpHarmAdd = new Array<number>();       // 伤害特殊加成
    mIsChoose: boolean = true;              // 能 否被选取
    mIsChosen: boolean = false;             // 是否 被选中
    mRank: number = eRank.mNormal;          // 单位级别
    isSummon: boolean = false;              // 是否是被召唤出
    mAttactType: number = eAttackType.mNone;// 攻击方式
    mTarget: Actor;                         // 攻击目标
    mOriginalData : any;                    // 原始数据
    mTimeLine: number = 0;                  // 时间线


    // 技能触发节点
    mCreatedEvent = new Array<any>();
    mActiveEvent = new Array<any>();
    mInAttackEvent = new Array<any>();
    mAfterAttackEvent = new Array<any>();
    mCritEvent = new Array<any>();
    mColliderEvent = new Array<any>();
    mBeforeHarmEvent = new Array<any>();
    mAfterHarmEvent = new Array<any>();
    mBeforeDieEvent = new Array<any>();
    mAfterKillEvent = new Array<any>();
    mEveryTimeEvent = new Array<any>();

    constructor(BMG: BattleMgr, data: any) {
        super();
        this.mBattleMgr = BMG;
        this._int(data);
        this.onCreatedEvent();
    }

    _int(data: any) {
        this.mType = data.Type;
        this.mName = data.Name;
        this.mIcon = data.Icon;
        this.mUID = data.UID;
        this.mSkillList = data.SkillList;
        this.mLevel = data.Level || 0;
        this.mAttactType = data.AttackType;
        this.mGroup = data.Group;
        this.mRank = data.Rank || eRank.mNormal;
        this.mScale = data.Scale;
        this.mData  = data.OriginalData;

        this.mComponents = {};
        this.addComponent(new AttriComponent(this, data));
        this.addComponent(new MoveComponent(this));
        this.addComponent(new SkillComponent(this));
        this.addComponent(new BuffComponent(this));
        this.addComponent(new AIComponent(this));
    }

    onCreatedEvent() {
        for(let value of this.mCreatedEvent){
            value();
        }
    }

    public onUpdate(dt: any) {
        if(this.mIsDead) return;
        this.mTimeLine += dt;

        // 更新所有组件
        for(const key in this.mComponents){
            if(this.mComponents.hasOwnProperty(key)){
                const value = this.mComponents[key];
                value.update(dt)
            }
        }
    }   
    
    
    public onLaterUpdate(dt: any) {


    }


    public onUnitCollider(collider: Unit) {
        let otherActor = collider as Actor;
        
        // for(let value of this.m)


    }

    setPos(pos) {
        let mMove = this.getComponent<MoveComponent>(eComponent.MoveComponent);
    }


}