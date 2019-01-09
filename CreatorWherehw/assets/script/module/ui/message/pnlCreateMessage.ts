import { UserMgr } from "../../../manager/UserMgr";
import { Cache } from "../../../framework/cache";
import { Socket } from "../../../framework/socket";
import { eProc, eLayer, eGameState } from "../../../manager/DefMgr";
import { GameSet } from "../../map/mapDef";
import { CommonMgr } from "../../../manager/CommonMgr";
import UIMgr from "../../../manager/UIMgr";
import { GameMgr } from "../../../manager/GameMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class pnlCreateMessage extends cc.Component {
    @property(cc.Label)
    lblPlayer1: cc.Label = null;
    @property(cc.Label)
    lblPlayer2: cc.Label = null;
    @property(cc.Label)
    lblContent: cc.Label = null;
    @property(cc.EditBox)
    edbBox: cc.EditBox = null;
    @property(cc.Label)
    btnCreate: cc.Label = null;

    private isMine: boolean = false;
    private isOther: boolean = false;
    private isRestart: boolean = false

    init(isRestart){
        this.isRestart = isRestart;
    }
    // onLoad () {}

    start () {
        GameMgr.changeGameState(eGameState.Message);
        this.lblPlayer1.string = UserMgr.getUserNick();
        this.lblPlayer2.string = UserMgr.getUser()["param"].oppoNick;
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        this.lblContent.string = `在${year}.${month}.${day}日 完成 \n WHEREHW`;
        this.node.zIndex = eLayer.LAYER_NORMAL;
        Socket.reg(eProc.boarded, this._boarded, this);
    }

    update (dt) {
        if(this.isMine && this.isOther) {
            this.node.destroy();
            GameSet.changeMusic("audio/bgm_jyc"); 
        }
    }

    onDestroy() {
        Socket.unreg(eProc.boarded);
    }

    private _boarded(){
        this.isOther = true; 
    }

    onClick(event: cc.Event.EventTouch) {
        switch(event.target.name){
            case "btnCreate":
                if(!this.edbBox.string){
                    UIMgr.Instance().alert("", "留言内容不能为空,请重新留言", "确认");
                    return;
                }
                let result = Socket.result(eProc.board);
                result["data"]["palyer1"] = UserMgr.getUserNick();
                result["data"]["player2"] = UserMgr.getUser()["param"]["oppoNick"];
                result["data"]["words"] = this.edbBox.string;
                this.btnCreate.string = "等待对方留言";
                Socket.send(result);
                this.isMine = true;
                this.node.destroy();
                break;
            case "close":
                this.node.destroy();
                GameSet.changeMusic("audio/bgm_jyc");  
                break;
            // default:
        }
    }
}
