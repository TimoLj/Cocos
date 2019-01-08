import { Actor } from "./Actor";

const {ccclass, property} = cc._decorator;

@ccclass
export default class nodActor extends cc.Component {
    @property(cc.Node)
    nodEntity: cc.Node = null;

    private mActor: Actor;
    init(e: Actor) {
        this.mActor = e;
        this.mActor.mBehevior = this;
        this.node.scale = e.mScale;
        this.mActor.width = this.nodEntity.width * e.mScale;
        this.mActor.height = this.nodEntity.height * e.mScale;
    }

    onEnable() {

    }

    onLoad () {

    }

    start () {


    }

    update (dt) {
        if(this.mActor.mIsDead) return;



    }

    onDestroy() {

    }
}
