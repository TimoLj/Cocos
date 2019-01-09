import { eProc, eNotifyEvent } from "../../manager/DefMgr";
import { Notify } from "../../framework/notify";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemSign extends cc.Component {

    private isGood: boolean;
    private pos = null;

    init(isGood, pos) {
        this.isGood = isGood;
        this.pos = pos;
        this.node.x = pos.x;
        this.node.y = pos.y;
    }

    onLoad () {}

    start () {
        if(this.isGood){
            let ani2 = cc.moveBy(0.3, -120, 110);
            this.node.runAction(ani2);
        }else{
            let ani1 = cc.moveBy(0.3, 0, 160);    
            this.node.runAction(ani1);
        }
        Notify.on(eNotifyEvent.PickUpUI, this._pickUpUI, this);
    }

    // update (dt) {}

    onDestroy() {
        Notify.off(eNotifyEvent.PickUpUI, this._pickUpUI);
    }

    onClick() {
        if(this.isGood){
            Notify.emit(eNotifyEvent.Sign, true);
        }else{
            Notify.emit(eNotifyEvent.Sign, false)
        }
        this._ani();
    }


    private _ani() {
        let p = this.node.getParent();
        let a = cc.find("itemSignGood", p);
        let b = cc.find("itemSignBad", p);
        a.runAction(cc.moveBy(0.3, 120, -110));
        b.runAction(cc.moveBy(0.3, 0, -160));

        setTimeout(() => {
            a.destroy();
            b.destroy();
            // cc.find("nodMask1", p).getComponent(cc.Button).interactable = true;
        }, 300);
    }

    private _ani1() {
        if(this.node.name == "good"){
            this.node.runAction(cc.moveBy(0.3, 120, -110));
        }
        else{
            this.node.runAction(cc.moveBy(0.3, 0, -160));
        }   
        setTimeout(() => { this.node.destroy() }, 300);
    }

    private _pickUpUI(){
        this._ani1();
    }
}
