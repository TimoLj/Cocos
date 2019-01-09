import { CommonMgr } from "../../../manager/CommonMgr";
import { UserMgr } from "../../../manager/UserMgr";
import { eLayer } from "../../../manager/DefMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemGameState extends cc.Component {

    @property(cc.Label)
    lblInfo: cc.Label = null;
    @property(cc.Node)
    nodTimeLine: cc.Node = null;

    private timeLine: number = 0;
    private isRun: number;
    private isTimeRun: boolean = null;
    private timeMax: number = 30;


    init(txt: string, isChoose, isRun: number = 0, isTimeRun: boolean = false) {
        this.lblInfo.string = txt;
        this.isRun = isRun;
        this.isTimeRun = isTimeRun;
        if(isTimeRun){
            this.nodTimeLine.active = true;
        }
    }

    onLoad () {

    }

    start () {
        this.node.zIndex = eLayer.LAYER_NORMAL;
    }

    update (dt) {
        this.timeLine+=dt;
        if(this.isTimeRun){
            let rgbTimeLine = this.nodTimeLine.getComponent(cc.ProgressBar);
            rgbTimeLine.progress = (this.timeMax-this.timeLine)/this.timeMax;
        }
        if(!this.isRun)return;
        if(this.timeLine>=this.isRun) this.node.destroy();
    }
}
