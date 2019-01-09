import { Notify } from "../../../framework/notify";
import { eNotifyEvent } from "../../../manager/DefMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemBubble extends cc.Component {

    @property(cc.Label)
    lblCont: cc.Label = null;
    @property(Number)
    Duration: number = 3;

    private nodMaster: cc.Node = null;
    private timeLine: number = 0;

    init(cont: string, nodMaster: cc.Node){
        this.lblCont.string = cont;
        this.nodMaster = nodMaster;
        this.node.x = this.nodMaster.x;
        let mapScale = this.nodMaster.getParent().getScale();
        this.node.y = this.nodMaster.y+this.nodMaster.children[1].height/(2*mapScale)+this.node.children[0].height/(2*mapScale);
        this.node.opacity = 0;
    }


    // onLoad () {}

    start () {
        this.node.runAction(cc.fadeIn(0.5));
        Notify.on(eNotifyEvent.ChangeActor, this._changeActor, this);
    }

    update (dt) {
        this.timeLine+=dt;
        if(this.timeLine>=this.Duration) this.node.destroy();
        if(cc.isValid(this.node)){
            if(!cc.isValid(this.nodMaster)){
                this.node.destroy();
            }else{
                this.node.x = this.nodMaster.x;
                this.node.y = this.nodMaster.y+this.nodMaster.children[1].height/2+this.node.children[0].height/2;
            }
        }
    }

    onDestroy() {
        Notify.off(eNotifyEvent.ChangeActor, this._changeActor);
    }

    private _changeActor(param) {
        this.nodMaster = param[0];
    }
}
