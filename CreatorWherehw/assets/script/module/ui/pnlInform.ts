import { Cache } from "../../framework/cache";
import { Util } from "../../framework/util";
import { CommonMgr } from "../../manager/CommonMgr";
import { Notify } from "../../framework/notify";
import { eNotifyEvent, eProc, eGender } from "../../manager/DefMgr";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import UIMgr from "../../manager/UIMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlInform extends cc.Component {

    @property(cc.Node)
    btnGenrate: cc.Node = null;
    @property(cc.EditBox)
    edbName: cc.EditBox = null;

    //lblWarning: cc.Node;

    mGenderTemp: number = eGender.Male;
    mAniDur: number = 0.1;

    start() {
        this.btnGenrate.on("click", this.onClickGenrate, this);
        UIMgr.Instance().windowOpen(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node))
    }

    onClick(event) {
        let name = event.target.name;
        if(name == "BtnClose"){
            UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
        }
        else if(name == "btnGenrate"){
            this.btnGenrate.getComponent(cc.Button).interactable = false;
            this.onClickGenrate();
        }
    }

    onClickGenrate() {
        var patt = /^[\da-z\u4e00-\u9fa5]{1,7}$/i;
        if (this.edbName.string == "") {
            UIMgr.Instance().toast("昵称不能为空", 2);
            return;
        }
        if (!patt.test(this.edbName.string)) {
            UIMgr.Instance().toast("昵称格式不正确", 2);
            return;
        }
        let req = Socket.result(eProc.userinfo),
            strNic = this.edbName.string;
        req.data["nick"] = strNic;
        req.data["gender"] = this.mGenderTemp;
        Socket.send(req);
    }

    onClickTgcSex(arg: cc.Toggle) {
        if (arg.name == "tglMan<Toggle>") {
            this.mGenderTemp = eGender.Male;
        }
        else if (arg.name == "tglWman<Toggle>") {
            this.mGenderTemp = eGender.Female;
        }
        else {
            this.mGenderTemp = eGender.Other;
        }
    }

}
