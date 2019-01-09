import { Socket } from "../../../framework/socket";
import { eProc } from "../../../manager/DefMgr";
import AccountMgr from "../../../manager/AccountMgr";
import { Kbe } from "../../../kbengine/Kbe";


const { ccclass, property } = cc._decorator;

@ccclass
export default class itemAccount extends cc.Component {

    @property(cc.Label)
    lblUserName: cc.Label = null;

    mData: Object = null;

    init(data) {
        //cc.log("act ", data);
        this.mData = data;
        this.lblUserName.string = "用户名" + data["UserName"];
    }

    onClickLogin() {
        Kbe.onLogin(this.mData['UserName'], this.mData['PWD'])
        return;
        Socket.init(() => {
            var req = Socket.result(eProc.login);
            req.data["username"] = this.mData["UserName"];
            req.data["password"] = this.mData["PWD"];
            Socket.send(req);
            cc.find("Canvas/pnlAccount").destroy();
        });
    }

    onClickDelet() {
        AccountMgr.Instance().RemoveOneAccount(this.mData["UserName"]);
        this.node.destroy();
    }
}