import { Socket } from "../framework/socket";
import { eProc, eNotifyEvent } from "./DefMgr";
import { ConfigMgr } from "./ConfigMgr";
import UIMgr from "./UIMgr";
import { Notify } from "../framework/notify";

export class UserMgr {
    private static _user = null;

    public static StateObj: Object = new Object();

    public static setUser(user) {
        this._user = user;
    }

    public static getUser() {
        return this._user;
    }

    public static initPartner(info, isInviter = false){
        UserMgr._user.param.oppoNick = info.PsvNick;
        UserMgr._user.param.oppoGender = info.PsvGender;
        UserMgr._user.binding = info.PsvID;
        if(isInviter) UserMgr._user.param.isInviter = 1;
    }

    public static getUserNick() {
        return this._user.nick;
    }

    public static getUserUid() {
        return this._user.uid;
    }

    public static getOtherUid() {
        return this._user.binding;
    }

    public static getUid() {
        return this._user ? this._user.uid : "";
    }

    public static HasUser() {
        return this.getUser().nick != "";
    }

    public static AddChip(chipID) {
        //cc.log("add chip", chipID);
        this._user.base.chip = this._user.base.chip || new Object();
        this._user.base.chip[chipID] = (this._user.base.chip[chipID] + 1) || 1;
        if (this._user.base.chip[chipID] >= 100) {
            if (this._user.base["chipAtlas"])//如果合成过
            {
                this._user.base.chip[chipID] = 99;
            }
            else {
                this._user.base.chip[chipID] = 100;
            }
        }
    }

    public static DeletChip(chipID) {
        if (!this._user.base.chip[chipID]) {
            return;
        }
        this._user.base.chip[chipID] = this._user.base.chip[chipID] - 1;
        if (this._user.base.chip[chipID] <= 0) {
            delete this._user.base.chip[chipID];
        }
    }

    public static ReadChipNum(chipID) {
        if (!this._user.base.chip[chipID]) {
            return 0;
        }
        return this._user.base.chip[chipID];
    }

    public static ReadAchievePrg(id) {
        this._user.base.achieve = this._user.base.achieve || new Object();
        if (!this._user.base.achieve[id]) {
            return 0;
        }
        return this._user.base.achieve[id];
    }

    public static AddAchievePrg(id: number, prg?: number) {
        prg = prg || 1;
        this._user.base.achieve = this._user.base.achieve || new Object();
        this._user.base.achieve[id] = (this._user.base.achieve[id] + prg) || prg;
    }

    public static onGetAchieve(achieveID: number, progress?: number) {

        var achieveCfg = ConfigMgr.getAll("Achieve");
        if (this.ReadAchievePrg(achieveID) >= achieveCfg[achieveID]["Times"]) {
            // cc.log("成就以前完成过");
            return;
        }

        var req = Socket.result(eProc.achieve);
        req.data["id"] = achieveID;
        Socket.send(req);

        UserMgr.AddAchievePrg(achieveID, progress);

        if (this.ReadAchievePrg(achieveID) >= achieveCfg[achieveID]["Times"]) {

            var str = `恭喜完成成就${achieveCfg[achieveID]["Name"]}`;
            UIMgr.Instance().toast(str);
        }
    }

    public static DeletReceivedChip(uuid) {
        if (!this._user.base.receivedChip[uuid]) {
            cc.log("ReceivedChip不存在：", uuid);
            return;
        }
        delete this._user.base.receivedChip[uuid];
    }

    //接下来要过的那一关
    public static CurrentLeavel() {
        this._user.param.dungeon = this._user.param.dungeon || 0;
        if (this._user.param.dungeon == 8) {
            return this._user.param.curDungeon;
        }
        return this._user.param.dungeon;
    }

    //下一步解锁第几关(等于8时表示第七关已解锁)
    public static GetNextUnlock() {
        this._user.param.dungeon = this._user.param.dungeon || 0;
        return this._user.param.dungeon;
    }

    public static OnExitGame() {
        this.StateObj["state"] = 0;
        this.StateObj["oppoState"] = 0;
    }

    //解除绑定
    public static UnBind() {
        UserMgr.StateObj["oppoState"] = 0;
        UserMgr.StateObj["state"] = 0
        this._user.binding = "";
        for (let key in this._user.param) {
            delete this._user.param[key];
        }
        this._user.role = 0;
        cc.log("after reset：", this.getUser());
    }
    public static onPassLeavel() {
        if (UserMgr.getUser().param.dungeon == 8) {
            Notify.emit(eNotifyEvent.succ);
            return;
        }
        var last = UserMgr.getUser().param.dungeon || 0;
        UserMgr.getUser().param.dungeon = last + 1;
        Notify.emit(eNotifyEvent.succ);
        //UserMgr.getUser().param.passTime = new Date().getTime();
    }
    private static initData() {

    }
}