import UIMgr from "../../../manager/UIMgr";
import { Socket } from "../../../framework/socket";
import { eProc, eLayer, eGameState } from "../../../manager/DefMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import { GameMgr } from "../../../manager/GameMgr";
import { Kbe } from "../../../kbengine/Kbe";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlLoginVistor extends cc.Component {

    @property(cc.EditBox)
    edbUserName: cc.EditBox = null;
    @property(cc.EditBox)
    edbPwd: cc.EditBox = null;
    @property(cc.EditBox)
    edbCfm: cc.EditBox = null;

    onLoad() {
        GameMgr.changeGameState(eGameState.Register);
    }

    public onClickBack() {
        let self = this;
        UIMgr.Instance().showHMI("prefab/ui/Account/pnlAccount", ()=>{
            self.node.destroy();
        })
    }

    public onClickRegister() {
        var unPatt = /^[\da-z]{5,10}$/i;
        var pwdPatt = /^[\da-z]{4,20}$/i;
        cc.log(this.edbUserName.string, this.edbPwd.string)
        if (!unPatt.test(this.edbUserName.string) || !pwdPatt.test(this.edbPwd.string)) {
            UIMgr.Instance().alert("", "用户名或者密码格式错误！", "确定");
            return;
        }
        if (this.edbPwd.string != this.edbCfm.string) {
            UIMgr.Instance().alert("提示", "密码不一致", "确定");
            return;
        }
        Kbe.onRegister(this.edbUserName.string, this.edbPwd.string);
        return;
        Socket.init(() => {
            var req = Socket.result(eProc.register);
            req.data["username"] = this.edbUserName.string;
            req.data["password"] = this.edbPwd.string;
            Socket.send(req);
        });
    }
}