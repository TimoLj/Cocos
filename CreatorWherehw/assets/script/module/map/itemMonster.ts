import { CommonMgr } from "../../manager/CommonMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemMonster extends cc.Component {

    init(url, pos){
        let pic = this.node.getComponent(cc.Sprite);
        CommonMgr.changeSprite(pic, url);
        this.node.setPosition(pos)
        this.node.opacity = 0;
    }


    onLoad () {

    }

    start () {
        this.node.runAction(cc.fadeIn(0.3));
        this.node.runAction(cc.scaleTo(0.4, 1.2))
        setTimeout(()=>{
            this.node.runAction(cc.fadeOut(0.2));
            setTimeout(()=>{ this.node.destroy() }, 200);
        }, 1000)
    }

    // update (dt) {}
}
