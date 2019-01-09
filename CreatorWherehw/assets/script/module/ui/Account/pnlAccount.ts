import UIMgr from "../../../manager/UIMgr";
import { Socket } from "../../../framework/socket";
import { eProc, eGameState } from "../../../manager/DefMgr";
import AccountMgr from "../../../manager/AccountMgr";
import { GameMgr } from "../../../manager/GameMgr";
import { Kbe } from "../../../kbengine/Kbe";
import { Util } from "../../../framework/util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    btnBack: cc.Node = null;
    @property(cc.EditBox)
    edbUserName: cc.EditBox = null;
    @property(cc.EditBox)
    edbPwd: cc.EditBox = null;

    onLoad() {
        GameMgr.changeGameState(eGameState.Login);
    }

    onClickOneKeyLogin() {
        cc.log(Util.genCode(5), Util.genCode(8))
        Kbe.onRegister(Util.genCode(5), Util.genCode(8));
        return
        Socket.init(() => {
            var req = Socket.result(eProc.onekeyreg);
            Socket.send(req);
        })
    }

    onClickRegister() {
        UIMgr.Instance().showHMI("prefab/ui/Account/pnlRegister", ()=>{
            this.node.destroy();
        });
    }

    onClickBack() {
        UIMgr.Instance().showHMI("prefab/ui/pnlStart", ()=>{
            this.node.destroy();
        });
    }

    onClickHisAcount() {
        let acountList = AccountMgr.Instance().GetAccountList();
        UIMgr.Instance().pnlList("历史账号(最多存八个)", this.adapter(acountList), "prefab/ui/Account/itemAccount", this.node);
    }

    onClickLogin() {
        var unPatt = /^[\da-z]{5,10}$/i;
        var pwdPatt = /^[\da-z]{4,20}$/i;
        if (!unPatt.test(this.edbUserName.string) || !pwdPatt.test(this.edbPwd.string)) {
            UIMgr.Instance().alert("", "用户名或密码格式有误", "确定");
            return;
        }
        Kbe.onLogin(this.edbUserName.string, this.edbPwd.string);
        return;
        Socket.init(() => {
            var req = Socket.result(eProc.login);
            req.data["username"] = this.edbUserName.string;
            req.data["password"] = this.edbPwd.string;
            cc.log("登陆", req);
            Socket.send(req);
            this.edbUserName.string = "";
            this.edbPwd.string = "";
        });
    }

    private adapter(actList: Object) {
        var result = new Object();
        for (let key in actList) {
            // result["UserName"] = key;
            // result["PWD"] = actList[key];
            result[key] = new Object();
            result[key]["UserName"] = key;
            result[key]["PWD"] = actList[key];
        }
        return result;
    }
}
