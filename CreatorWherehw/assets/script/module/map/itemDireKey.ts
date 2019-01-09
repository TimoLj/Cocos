import { Notify } from "../../framework/notify";
import { eNotifyEvent } from "../../manager/DefMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemDireKey extends cc.Component {

    @property(cc.Node)
    nodUp: cc.Node = null;
    @property(cc.Node)
    nodDown: cc.Node = null;
    @property(cc.Node)
    nodRight: cc.Node = null;
    @property(cc.Node)
    nodLeft: cc.Node = null;

    @property(cc.Node)
    nodUpDown: cc.Node = null;
    @property(cc.Node)
    nodDownDown: cc.Node = null;
    @property(cc.Node)
    nodRightDown: cc.Node = null;
    @property(cc.Node)
    nodLeftDown: cc.Node = null;

    private isRun: Boolean = false;
    private pos: cc.Vec2 = cc.v2();

    start () {
        this.nodUp.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{
            this.isRun = true;
            this.pos = cc.v2(0, -1);
            this.nodUpDown.active = true;
        })
        this.nodUp.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodUpDown.active = false;
        })
        this.nodUp.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodUpDown.active = false;
        })
        
        this.nodDown.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{
            this.isRun = true;
            this.pos = cc.v2(0, 1);
            this.nodDownDown.active = true;
        })
        this.nodDown.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodDownDown.active = false;
        })
        this.nodDown.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodDownDown.active = false;
        })
        
        this.nodRight.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{
            this.isRun = true;
            this.pos = cc.v2(1, 0);
            this.nodRightDown.active = true;
        })
        this.nodRight.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodRightDown.active = false;
        })
        this.nodRight.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodRightDown.active = false;
        })
        
        this.nodLeft.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{
            this.isRun = true;
            this.pos = cc.v2(-1, 0);
            this.nodLeftDown.active = true;
        })
        this.nodLeft.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodLeftDown.active = false;
        })
        this.nodLeft.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch)=>{
            this.isRun = false;
            this.nodLeftDown.active = false;
        })

    }

    update (dt) {
        if(this.isRun){
            Notify.emit(eNotifyEvent.MoveOrder, this.pos);
        }
    }
}
