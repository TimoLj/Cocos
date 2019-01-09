import { Socket } from "../../../framework/socket";
import { eProc, eGender, eNotifyEvent } from "../../../manager/DefMgr";
import { UserMgr } from "../../../manager/UserMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import { Notify } from "../../../framework/notify";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    lblCont1: cc.Label = null;
    @property(cc.Label)
    lblCont2: cc.Label = null;
    @property(cc.Label)
    lblPlayer1: cc.Label = null;
    @property(cc.Label)
    lblPlayer2: cc.Label = null;
    @property(cc.Label)
    lblID1: cc.Label = null;
    @property(cc.Label)
    lblID2: cc.Label = null;
    @property(cc.Label)
    lblTime: cc.Label = null;
    @property(cc.Label)
    lblZan: cc.Label = null;
    @property(cc.Node)
    nodPraise: cc.Node = null;
    @property(cc.Node)
    nodPraised: cc.Node = null;
    @property(cc.Sprite)
    sprSex1: cc.Sprite = null;
    @property(cc.Sprite)
    sprSex2: cc.Sprite = null;


    private info = null;
    private zanCount: number = null;
    private isZan: boolean;

    init(data, isZan){
        this.info = data;
        this.isZan = isZan;
    }

    start () {
        let info = this.info;
        this.lblCont1.string = info.words1;
        this.lblCont2.string = info.words2; 
        this.lblPlayer1.string = info.nick1;
        this.lblPlayer2.string = info.nick2;
        this.lblID1.string = info.uid1;
        this.lblID2.string = info.uid2;
        this.lblZan.string = info.zan;
        let time = new Date(info.time)
        this.lblTime.string = `${time.getFullYear()}.${time.getMonth()+1}.${time.getDay()}`;
        this.changePic(this.sprSex1, info.gender1);
        this.changePic(this.sprSex2, info.gender2);

        let user = UserMgr.getUser();
        if(user.base.like && user.base.like[this.info.id]){
            this.nodPraised.active = true;
        }
        if(this.isZan){
            this.nodPraised.active = true;
        }else{
            this.nodPraised.active =  false;
        }
        this.zanCount = Number(this.info.zan);
    }

    // update (dt) {}

    onClick(event) {
        switch(event.target.name){
            case "close":
                this.node.destroy();
                break;
            case "praise":
                this.nodPraised.active = true;
                let result1 = Socket.result(eProc.boardlike);
                result1['data']["id"] = this.info.id;
                result1["data"]["count"] = 1;
                Socket.send(result1);
                this.zanCount++;
                this.lblZan.string = `${this.zanCount}`;
                Notify.emit(eNotifyEvent.Praise, this.info.id, 1)
                break;

            case "praised":
                this.nodPraised.active = false;
                let result2 = Socket.result(eProc.boardlike);
                result2["data"]["id"] = this.info.id;
                result2["data"]["count"] = -1;
                Socket.send(result2);
                this.zanCount--;
                this.lblZan.string = `${this.zanCount}`;
                Notify.emit(eNotifyEvent.Praise, this.info.id, -1)
                break;
        }
    }
    private changePic(sprite: cc.Sprite, sex: number) {
        let url: string;
        if(sex == eGender.Male){
            url = "picture/role/male";
        }
        else if(sex == eGender.Female){
            url = "picture/role/female";
        }
        else{
            url = "picture/role/neutral";
        }
        CommonMgr.changeSprite(sprite, url);
    }

}
