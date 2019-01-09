import { CommonMgr } from "../../manager/CommonMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemChip extends cc.Component {

    init(posN: cc.Vec2, pos: cc.Vec2, isMine: boolean) {
        this.node.x = posN.x;
        this.node.y = posN.y;
        this.node.name = `${pos.x}-${pos.y}`;
        let a = this.node.getComponent(cc.Sprite)
        if(isMine){
            CommonMgr.changeSprite(a, "picture/chip/chip1");
        }else{
            CommonMgr.changeSprite(a, "picture/chip/chip2");
        }
    }


    // onLoad () {}

    start () {

    }

    // update (dt) {}

}
