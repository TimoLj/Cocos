import { Notify } from "../../../framework/notify";
import { eNotifyEvent, eProc } from "../../../manager/DefMgr";
import { Socket } from "../../../framework/socket";
import { UserMgr } from "../../../manager/UserMgr";
import UIMgr from "../../../manager/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class itemInvition extends cc.Component {

    @property(cc.Label)
    lblName: cc.Label = null;

    @property(cc.Label)
    lblID: cc.Label = null;

    // btnDuration: number = 400;//

    inviterUser: Object = null;
    interactable: boolean = true;

    public init(pram) {
        this.inviterUser = pram;
        this.lblID.string = "ID " + pram.uid;
        this.lblName.string = "昵称 " + pram.nick;
        //this.btnAccept.node.on("click", this.onClickAccept, this);
    }


    onClickAccept() {
        if (!this.interactable) {
            return;
        }
        this.interactable = false;
        UIMgr.Instance().alertSelect("", "同意后将和对方账号绑定", "确定", "取消", () => {
            cc.log("inviter", this.inviterUser);
            let responseData = {
                PsvID : UserMgr.getUid(),
                PsvNick : UserMgr.getUser().nick,
                PsvGender : UserMgr.getUser()["gender"],
            }
            Notify.emit(eNotifyEvent.Response, 1, this.inviterUser, responseData);//发送给本地，暂时不能删除本地的所有邀请条目，因为不一定能绑定成功

            var req = Socket.result(eProc.response);
            var u = UserMgr.getUser();
            req.data["uid"] = this.inviterUser["uid"];//主动方ID，必须要有，不然无法把消息发送给对方
            req.data["PsvNick"] = UserMgr.getUser().nick;//被动方昵称
            req.data["PsvID"] = UserMgr.getUid();//被动方ID，即自己的ID
            req.data["PsvGender"] = UserMgr.getUser()["gender"];//被动方性别
            req.data["state"] = 1;
            Socket.send(req);
        }, () => { });
        setTimeout(() => {
            this.interactable = true;
        }, 500);
    }

    onClickConfuse() {
        //把本地UserMgr.getUser().invite里相应键值删除
        if (!this.interactable) {
            return;
        }
        this.interactable = false;
        UIMgr.Instance().alertSelect("", "确定拒绝对方邀请吗？", "确定", "取消", () => {
            Notify.emit(eNotifyEvent.Response, 0, this.inviterUser);//发送给本地

            var req = Socket.result(eProc.response);
            req.data["uid"] = this.inviterUser["uid"];
            req.data["state"] = 0;
            Socket.send(req);
        }, () => { });
        setTimeout(() => {
            this.interactable = true;
        }, 500);
    }
}
