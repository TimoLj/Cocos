import { Component } from "./Component";
import { Actor } from "../Battle/Actor";
import { eComponent, eActorState, eActionState } from "../Battle/BattleDef";
import { AttriComponent } from "./AttriComponent";
import { MoveComponent } from "./MoveComponent";

export class AIComponent extends Component {
    private mAttri: AttriComponent;
    private mMove: MoveComponent;

    mName = eComponent.AIComponent;
    mAtkMaxDis: number = 0; // 最大攻击距离
    mAtkMinDis: number = 0; // 最小攻击距离
    mOwner: Actor;

    constructor(owner: Actor) {
        super(owner)
        this.mOwner = owner;
        this.mAttri = owner.getComponent<AttriComponent>(eComponent.AttriComponent);
        this.mMove = owner.getComponent<MoveComponent>(eComponent.MoveComponent);
        
        this.mAtkMaxDis = this.mOwner.mData.AtkMax;
        this.mAtkMinDis = this.mOwner.mData.AtkMin;

    }

    update(dt) {
        if(this .mOwner.mIsDead) return;
        for(let value of this.mOwner.mActorState){
            if(value == eActorState.mStun) return;
        }

        this._changeAni();  // 改变单位动画状态

    }


    private _changeAni() {
        switch (this.mOwner.mActionState){
            case eActionState.mIdle:
                this._onIdle();
                break;
            case eActionState.mMove:
                this._onMove();
                break; 
            case eActionState.mPreAttack:

                break
            case eActionState.mAttack:

                break
            case eActionState.mDead:

                break;
        }
    }

    private _onIdle() {
        this.mMove.isStop(true);
    }

    private _onMove() {
        this.mMove.isStop(false);
    }

    private _findTarget() {
        let target = this.mOwner.mBattleMgr.mTargetAll; // 集火目标
        if(target && !target.mIsDead && target.mGroup != this.mOwner.mGroup){
            this.mOwner.mTarget = target;
            return;
        }

        if(this.mOwner.mTarget && !this.mOwner.mIsDead) return;

        


    }

}