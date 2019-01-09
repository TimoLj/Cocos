
import { eGender, eProc, eRole } from "../../manager/DefMgr";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import UIMgr from "../../manager/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlRole extends cc.Component {

    @property(cc.Label)
    lblMsg: cc.Label = null;


    @property(cc.Toggle)
    Orion: cc.Toggle = null;

    @property(cc.Toggle)
    Merope: cc.Toggle = null;

    canvas: cc.Node = null;

    role: number;

    start() {
        UIMgr.Instance().windowOpen(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
        var gender = UserMgr.getUser().gender;
        //默认角色与性别对应
        if (gender == eGender.Female) {
            this.Merope.isChecked = true;
            this.Orion.isChecked = false;
            this.role = eRole.Merope;
        }
        else {
            this.Orion.isChecked = true;
            this.Merope.isChecked = false;
            this.role = eRole.Orion;
        }
    }

    onClickRoleTg(arg: cc.Toggle) {
        let name = arg.target.name;
        if (name == "Orion") {
            this.role = eRole.Orion;
        }
        else if (name == "Merope") {
            this.role = eRole.Merope;
        }
    }

    onClickConfirm() {
        cc.find("btnStart", this.node.children[2]).getComponent(cc.Button).interactable = false;
        UserMgr.getUser().role = this.role;
        var req = Socket.result(eProc.select);
        req.data["uid"] = UserMgr.getUser().binding;
        req.data["myrole"] = this.role;//自己选择的角色
        if (this.role == eRole.Orion) {
            req.data["opporole"] = eRole.Merope;
        }
        else {
            req.data["opporole"] = eRole.Orion;
        }
        Socket.send(req);
        let self = this;
        UIMgr.Instance().showHMI("prefab/ui/pnlLeavel", ()=>{
            self.node.destroy();
        })
    }

    onClickClose() {
        UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node))
    }
}
