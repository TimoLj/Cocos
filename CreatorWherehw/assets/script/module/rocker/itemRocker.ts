import { MoveControl } from "../map/moveControl";
import { Notify } from "../../framework/notify";
import { eNotifyEvent } from "../../manager/DefMgr";

const {ccclass, property} = cc._decorator;
let DirectionType = cc.Enum({
                        Four: 3,
                        Eight: 8,
                        All: 0
                    });

@ccclass
export default class itemRocker extends cc.Component {
    @property({
        displayName : "摇杆背景节点",
        type : cc.Node
    })
    nodBg: cc.Node = null;
    @property({
        displayName : "摇杆节点",
        type : cc.Node
    })
    nodPole: cc.Node = null;
    @property({
        displayName: "方向类型",
        type: DirectionType,
    })
    directionType = DirectionType.Four;

    private isControl: boolean = false;
    private mDire = null;

    onLoad () {}

    start () {
        this._initRockerTouchEvent();
    }

    update (dt) {
        if(this.isControl){
            Notify.emit(eNotifyEvent.MoveOrder, this.mDire);
        }
    }

    private _initRockerTouchEvent() {   // 对nodBg的监听事件
        this.nodBg.on(cc.Node.EventType.TOUCH_START, this._rockerTouchStartEvent, this);
        this.nodBg.on(cc.Node.EventType.TOUCH_MOVE, this._rockerTouchMoveEvent, this);
        this.nodBg.on(cc.Node.EventType.TOUCH_END, this._rockerTouchEndEvent, this);
        this.nodBg.on(cc.Node.EventType.TOUCH_CANCEL, this._rockerTouchCancel, this);
    }

    private _rockerTouchStartEvent(event: cc.Event.EventTouch) {
        // 获取触摸点坐标，并转换成触摸区域的相对坐标(以触摸点的锚点为基准)
        let touchPos = this.nodBg.convertToNodeSpaceAR(event.getLocation());
        // 获取触摸点到圆心的距离(圆心为锚点)
        let dis = this._getDis(touchPos, cc.v2(0, 0))
        // 圆半径
        let mRadius = this.nodBg.width/2;
        // 判断位置是否超出触摸范围，摇杆跟随移动
        if(mRadius>dis){
            this.nodPole.setPosition(touchPos);
            return true;
        }        
        return false;
    }

    private _rockerTouchMoveEvent(event: cc.Event.EventTouch) {
        let touchPos = this.nodBg.convertToNodeSpaceAR(event.getLocation());
        let dis = this._getDis(touchPos, cc.v2(0,0));
        let mRadius = this.nodBg.width/2;

        if(mRadius>dis){
            this.nodPole.setPosition(touchPos);
        }
        else{
            // 保证摇杆在背景圈内
            let posNew = cc.v2();
            posNew.x = Math.cos(this._getRadian(touchPos)) * mRadius;
            posNew.y = Math.sin(this._getRadian(touchPos)) * mRadius;
            this.nodPole.setPosition(posNew);
        }
        if(dis>mRadius*2/3){
            this.isControl = true;
            let dire = this._judgeDire(touchPos);
            this.mDire = dire;
            Notify.emit(eNotifyEvent.MoveOrder, dire);
        }
    }

    private _rockerTouchEndEvent(event) {
        this.nodPole.setPosition(this.nodBg.getPosition());
        this.isControl = false;
    }

    private _rockerTouchCancel(event) {
        this.nodPole.setPosition(this.nodBg.getPosition());
        this.isControl = false;
    }

    // 计算距离
    private _getDis(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x-pos2.x, 2) + Math.pow(pos1.y-pos2.y, 2));
    }

    // 计算弧度
    private _getRadian(point) {
        return this._getAngle(point) * Math.PI /180;
    }

    // 计算角度
    private _getAngle(point) {
        return Math.atan2(point.y, point.x) * 180 / Math.PI;
    }

    // 判断方向
    private _judgeDire(point) {
       return MoveControl.mouseMove(point.x, point.y);
    }

}
