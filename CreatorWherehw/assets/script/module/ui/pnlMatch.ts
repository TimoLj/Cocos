
import { eProc } from "../../manager/DefMgr";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import UIMgr from "../../manager/UIMgr";
import { Util } from "../../framework/util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    edbTargetID: cc.EditBox = null;
    @property(cc.Node)
    btnInvite: cc.Node = null;
    @property(cc.Node)
    btnClose: cc.Node = null;
    @property(cc.Label)
    lblMyID: cc.Label = null;

    onLoad() {
        Socket.reg(eProc.invite, (param) => {
            this.edbTargetID.string = "";
            if (param.code == 0) {
                //CommonMgr.alert("", "邀请已发出", "确定", () => { UIMgr.Instance().HideUI(UIMgr.pnlMatch) });
                UIMgr.Instance().toast("邀请已发出", 2);
                // UIMgr.Instance().windowOpen(cc.find("nodMain", this.node), this.btnClose, cc.find("UIMask", this.node));
            }
            else {
                //CommonMgr.alert("", param.msg, "确定");
                UIMgr.Instance().toast(param.msg, 2);
            }
        }, this);
    }

    onDestroy() {
        Socket.unreg(eProc.invite);
    }

    start() {
        this.lblMyID.string = "我的ID：" + UserMgr.getUid();
        UIMgr.Instance().windowOpen(cc.find("nodMain", this.node), this.btnClose, cc.find("UIMask", this.node))
    }

    onClick(event) {
        let name = event.target.name;
        if(name == "BtnClose"){
            UIMgr.Instance().windowClose(cc.find("nodMain", this.node), this.btnClose, cc.find("UIMask", this.node))
        }
        else if(name == "btnInvite"){
            this.onClickInvite()
        }
    }

    onClickInvite() {
        Util.setBtnClickInterval(this.btnInvite.getComponent(cc.Button), 500);
        if (this.edbTargetID.string == UserMgr.getUid()) {
            UIMgr.Instance().toast("暂不支持一个人玩哦！快去邀请小伙伴吧！", 2);
            return;
        }
        if (this.edbTargetID.string == "") {
            UIMgr.Instance().toast("ID不能为空", 1.5);
            return;
        }
        var req = Socket.result(eProc.invite);
        req.data["testFiled"] = 10086;
        req.data["uid"] = this.edbTargetID.string;
        Socket.send(req);
    }

}
