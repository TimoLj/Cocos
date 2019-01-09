import { CommonMgr } from "../../manager/CommonMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemBound extends cc.Component {

    @property(cc.Node)
    nodLine: cc.Node = null

    private posEnd: cc.Vec2
    private isMine: boolean

    init(pB: cc.Vec2, pE: cc.Vec2, isMine: boolean = true){
        this.node.setPosition(pB);
        this.posEnd = pE;
        this.isMine = isMine
    }

    // onLoad () {}

    start () {
        this.node.zIndex = 5;
        let url: string,
            dis: number
        if(this.isMine){
            url = "picture/role/img_heart_line01"
            dis = -this.nodLine.width
        }else{
            url = "picture/role/img_heart_line02"
            dis = this.nodLine.width
            this.nodLine.setPosition(-this.nodLine.width, 0)
        }
        let sprite = this.nodLine.getComponent(cc.Sprite)
        CommonMgr.changeSprite(sprite, url);

        let ani = cc.moveBy(0.5, dis, 0);
        this.nodLine.runAction(ani);
        this.node.runAction(cc.moveTo(0.5, this.posEnd));
        setTimeout(()=>{
            if(cc.isValid) this.node.destroy();
        }, 500);
    }

    // update (dt) {}
}
