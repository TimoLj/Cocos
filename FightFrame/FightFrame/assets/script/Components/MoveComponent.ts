import { Component } from "./Component";
import { eComponent, eAttri, eMoveType, eActorState, BATTLE_FRAME } from "../Battle/BattleDef";
import { Unit } from "../Battle/Unit";
import { AttriComponent } from "./AttriComponent";
import { Actor } from "../Battle/Actor";

export class MoveComponent extends Component{
    mName = eComponent.MoveComponent;
    private mParam: MoveParam;
    private mMove:  Move; 
    private mIsMove: boolean = true;
    mOwner: Actor

    constructor(owner: Actor){
        super(owner);
        this.mParam = new MoveParam();
        
        let mMove = owner.getComponent<AttriComponent>(eComponent.AttriComponent);
        this.mParam.vv = mMove.get(eAttri.moveSpd);
        this.mParam.g = owner.mData.Gravity || 0;
        this.mParam.rotation = owner.rotation;
        switch (owner.mData.MoveType){
            case eMoveType.mLine:
                this.mMove = new LineMove(this.mParam);
                break;
        }
        return this;
    }

    update(dt) {
        if(this.mOwner.mIsDead || !this.mIsMove) return;

        for(let value of this.mOwner.mActorState){
            if(value == eActorState.mStun) return;  // 单位进入晕眩状态停止移动
        }

        this.mMove.step(dt/BATTLE_FRAME);
        this.mOwner.x = this.mParam.x;
        this.mOwner.y = this.mParam.y;
    }

    isStop(judge: boolean){
        this.mIsMove = !judge;
    }

    setPos(x: number, y: number) {
        this.mParam.x = x;
        this.mParam.y = y;
    }

    setVv(vv: number) {
        this.mParam.vv = vv;
    }

    setGrivity(g: number) {
        this.mParam.g = g;
    }
}


class MoveParam {
    t = 0;  // 运动时刻
    x = 0;  // 水平位置
    y = 0;  // 垂直位置
    vv = 0; // 速度矢量
    vx = 0; // 水平速度
    vy = 0; // 垂直速度
    g = 0;  // 加速度
    rotation = 0;   // 角度
}

export interface Move {
    param: MoveParam;
    step(dt: number);
}


class LineMove implements Move{
    param: MoveParam;
    constructor(p: MoveParam){
        this.param = p;

        let rotation = this.param.rotation;
        this.param.vx = this.param.vv * Math.cos(rotation/180 * Math.PI);
        this.param.vy = this.param.vv * Math.sin(rotation/180 * Math.PI);
    }

    
    step(dt: number) {
        this.param.vy += this.param.g;
        this.param.x += this.param.vx;
        this.param.y += this.param.vy;
    }
}
