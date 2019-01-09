import { Notify } from "../../framework/notify";
import { eNotifyEvent, eGender, eProc, eRole, eLayer, eTimeConst, eGameState } from "../../manager/DefMgr";
import { CommonMgr } from "../../manager/CommonMgr";
import { Cache } from "../../framework/cache";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import UIMgr from "../../manager/UIMgr";
import { GameMgr } from "../../manager/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlStart extends cc.Component {

    canvas: cc.Node = null;
    @property(cc.Node)
    btnGameTip: cc.Node = null;
    @property(cc.Node)
    btnGO: cc.Node = null;
    @property(cc.Node)
    nodUserInfo: cc.Node = null;
    @property(cc.Label)
    lblTitle: cc.Label = null;
    @property(cc.Node)
    btnApply: cc.Node = null;
    @property(cc.Node)
    btnMsgBoard: cc.Node = null;
    @property(cc.Node)
    btnSetting: cc.Node = null;
    @property(cc.Node)
    btnAchieve: cc.Node = null;
    @property(cc.Node)
    btnGameTips: cc.Node = null;
    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Label)
    lblID: cc.Label = null;
    @property(cc.Label)
    lblMateName: cc.Label = null;
    @property(cc.Label)
    lblMateID: cc.Label = null;
    @property(cc.Label)
    lblUserName: cc.Label = null;
    @property(cc.Label)
    lblPwd: cc.Label = null;
    @property(cc.Label)
    lblNoPT: cc.Label = null;

    private mResponseData = {};
    private mBtnTime: number;//从点击按钮到生成UI遮罩会有时间延迟，为了防止在这段时间内再此点击，设置一段时间禁止接收点击消息

    private data = null;
    private isNeedLogin: boolean = true;

    //public static MateReadied: boolean = false;

    onLoad() {
        GameMgr.changeGameState(eGameState.Main);
    }

    //在start之前确保userdata有值
    start() { 
        //主动方选择角色后接收消息
        Socket.reg(eProc.selected, (pram) => {
            cc.log("select", pram);
            cc.log(UserMgr.getUser().role)
            UserMgr.getUser().role = pram.data.opporole;
            var str, iconPath;
            if (UserMgr.getUser().role == eRole.Orion) {
                str = `已与<color=#FFE295>${UserMgr.getUser()["param"].oppoNick}</c>完成匹配，你将成为<color=#FFE295>Merope</c>`;
                iconPath = "texture/merope";
            }
            else {
                str = `已与<color=#FFE295>${UserMgr.getUser()["param"].oppoNick}</c>完成匹配，你将成为<color=#FFE295>Orion</c>`;
                iconPath = "texture/orion";
            }
            UIMgr.Instance().toast(str, 2.5, null, iconPath);
        }, this);

    //用户注册昵称后接收此消息
        Socket.reg(eProc.userinfo, (pram) => {
            if (pram.code != 0) {
                UIMgr.Instance().alert("提示", pram.msg, "确定");
                cc.log("socket err msg={?}".format(JSON.stringify(pram)));
                return;
            }
            cc.log("userinfo", pram);
            this.title();
            this.btnGO.active = true;
            this.isNeedLogin = false;
            this.nodUserInfo.active = true;
            this.nodUserInfo.scaleX = 0;
            this.nodUserInfo.runAction(cc.scaleTo(0.2, 1, 1));
            UserMgr.getUser().nick = pram.data.nick;
            UserMgr.getUser().gender = pram.data.gender;
            this.lblID.string = this.decorateIDStr(UserMgr.getUserUid());
            this.lblName.string = this.decorateNameStr(pram.data.nick, pram.data.gender);

            let pnlInform = cc.find("Canvas/pnlInform")
            if(pnlInform) UIMgr.Instance().windowClose(cc.find("nodMain", pnlInform), cc.find("BtnClose", pnlInform), cc.find("UIMask", pnlInform));
            UIMgr.Instance().showGender(this.lblName, pram.data.gender);

        }, this)

    //当被动方同意邀请时，主动方接收此消息
        Socket.reg(eProc.responsed, (pram) => {
            cc.log("responsed 主动方接收", pram);//主动
            if (pram.code != 0) {
                UIMgr.Instance().alert("提示", pram.msg, "确定");
                cc.log("socket err msg={?}".format(JSON.stringify(pram)));
                return;
            }
            if (pram.data.state == 0) {
                return;
            }
            let userInfo = pram.data; 

            var str = "已与" + userInfo.PsvNick + "绑定成功";
            UIMgr.Instance().toast(str, 2);
            this.lblMateName.string = userInfo.PsvNick;
            this.lblMateID.string = userInfo.PsvID;
            UIMgr.Instance().showGender(this.lblMateName, userInfo.PsvGender);
            //还是有可能出现概率非常小的bug，A发邀请给B，B发邀请给C，B在处理A的邀请时，C同意了B的邀请，在B接收到C发送的Socket前B点击了同意A的邀请，那么出现
            //绑定混乱的情况
            this.lblNoPT.node.active = false;
            this.btnApply.active = false;
            UserMgr.StateObj["isOppoOnline"] = 1;
            UserMgr.getUser()["param"]["oppoNick"] = userInfo.PsvNick;
            UserMgr.getUser().binding = userInfo.PsvID;
            UserMgr.getUser()["param"]["oppoGender"] = userInfo.PsvGender;
            UserMgr.getUser()["param"]["isInviter"] = 1;
            this.title();
            // Cache.set(Cache.CK_LEAVEL, 1);//关卡信息
            // Cache.set(Cache.CK_ISINVITER, 1);
            //UserMgr.getUser()

        }, this);

    //收到邀请时接收此消息。全局监听
        Socket.reg(eProc.invited, (pram) => {
            this.btnApply.active = true;

            //如果接收到一个列表里面没有的邀请
            if (!UserMgr.getUser().invite.hasOwnProperty(pram.data.uid)) {
                //更新列表
                UserMgr.getUser().invite = pram.data.invite;
                Notify.emit(eNotifyEvent.BeInvited, pram);
                UIMgr.Instance().toast("收到新的邀请", 2);
            }
            //cc.log(pram);
        }, this);

    //对方准备后接收此消息
        Socket.reg(eProc.readied, (pram) => {
            UserMgr.StateObj["oppoState"] = 1;
            Notify.emit(eNotifyEvent.MateIsReadied, true);
        }, this);

        Socket.reg(eProc.unreadied, (pram) => {
            cc.log("取消准备");
            UserMgr.StateObj["oppoState"] = 0;
            Notify.emit(eNotifyEvent.MateIsReadied, false);
        }, this);

        Socket.reg(eProc.reset, (pram) => {
            //cc.log("reste", pram);
            this.lblMateID.string = "";
            this.lblNoPT.node.active = true;
            this.lblMateName.string = "";
            UIMgr.Instance().showGender(this.lblMateName, -1);
            UserMgr.UnBind();
            this.title();
        }, this);

        Socket.reg(eProc.reseted, (pram) => {
            cc.log("reseted ");
            this.lblMateID.string = "";
            this.lblNoPT.node.active = true;
            this.lblMateName.string = "";
            Notify.emit(eNotifyEvent.Reseted);
            UIMgr.Instance().showGender(this.lblMateName, -1);
            UIMgr.Instance().toast("对方和你解除匹配了！！！");
            UserMgr.UnBind();
            this.title();
        }, this);

        Socket.reg(eProc.givechiped, (pram) => {
            //cc.log("收到碎片", pram);
            UserMgr.getUser().base.receivedChip[pram.data.uuid] = pram.data;
            Notify.emit(eNotifyEvent.ReceiveChip, pram);
        }, this);

        Notify.on(eNotifyEvent.DealResponse, this.onDealResponse, this);
        Notify.on(eNotifyEvent.GetUser, this.onGetUser, this);
        Notify.on(eNotifyEvent.succ, this.onSucc, this);
        Notify.on(eNotifyEvent.Response, this.onResponse, this);

        this.mBtnTime = eTimeConst.BtnDur;
        this.canvas = cc.find("Canvas");
        this.showUser(false);
        this.btnApply.active = false;
        if (UserMgr.getUser()) {
            this.onGetUser();
        }
        // let result2 = Socket.result(eProc.boardlist)
        // Socket.send(result2)
    }

    onDestroy() {
        Socket.unreg(eProc.select);
        Socket.unreg(eProc.userinfo);
        Socket.unreg(eProc.responsed);
        Socket.unreg(eProc.invited);
        Socket.unreg(eProc.readied);
        Socket.unreg(eProc.unreadied);
        Socket.unreg(eProc.reset);
        Socket.unreg(eProc.reseted);
        Socket.unreg(eProc.givechiped);
        Notify.off(eNotifyEvent.DealResponse, this.onDealResponse);
        Notify.off(eNotifyEvent.GetUser, this.onGetUser);
        Notify.off(eNotifyEvent.succ, this.onSucc);
        //cc.log("startPnl destory");
    }

    onResponse(param){
        this.mResponseData = param[3];
    }

    onClick(event: cc.Button){
        let name = event.target.name;
        let self = this;
        switch(name){
            case "btnGO":   // 开始游戏
                this.btnGO.getComponent(cc.Button).interactable = false;
                if(this.isNeedLogin){
                    UIMgr.Instance().showHMI("prefab/ui/pnlInform", ()=>{
                        this.btnGO.getComponent(cc.Button).interactable = true;
                    })
                }else{
                    this.onClickGOBtn();
                }
                break;
            case "btnMsgBoard":     // 留言板
                this.btnMsgBoard.getComponent(cc.Button).interactable = false;
                CommonMgr.loadRes("prefab/ui/message/itemMessage", cc.Prefab, (err, res) => {
                    let a: cc.Node = cc.instantiate(res);
                    CommonMgr.addNode(a, eLayer.LAYER_NORMAL);
                    this.btnMsgBoard.getComponent(cc.Button).interactable = true;
                })
                break;
            case "btnAchieve":  // 成就
                this.btnMsgBoard.getComponent(cc.Button).interactable = false;
                UIMgr.Instance().showHMI("prefab/ui/Achieve/pnlAchieve", ()=>{
                    this.btnMsgBoard.getComponent(cc.Button).interactable = true;
                })
                break;
            case "btnSettings": // 设置
                this.btnSetting.getComponent(cc.Button).interactable = false;
                UIMgr.Instance().showHMI("prefab/ui/itemSet", ()=>{
                    this.btnSetting.getComponent(cc.Button).interactable = true;
                })
                break;
            case "btnApply":    // 邀请列表
                this.btnApply.getComponent(cc.Button).interactable = false;
                UIMgr.Instance().showHMI("prefab/ui/Invition/pnlInvition", ()=>{
                    this.btnApply.getComponent(cc.Button).interactable = true;
                })
                break;
            case "btnGameTip":  // 游戏引导界面
                this.btnGameTip.getComponent(cc.Button).interactable = false;
                UIMgr.Instance().showHMI("prefab/ui/pnlGameTip", ()=>{
                    this.btnGameTip.getComponent(cc.Button).interactable = true;
                })
                break;
            case "clear":
                Cache.remove(Cache.CK_FIRSTENTER);
                break;
        }
    }

    //当有用户数据的时候
    onGetUser() {
        //cc.log("onGetUser call");
        this.lblUserName.string = "用户名 " + UserMgr.getUser().username;
        this.lblPwd.string = "密    码 " + UserMgr.getUser().password;
        if (Cache.get(Cache.CK_FIRSTENTER) == undefined) {
            //CommonMgr.alert("", "游戏须知xxxxx", "确定", () => { Cache.set(Cache.CK_FIRSTENTER, 1) });
            // UIMgr.Instance().ShowUI(UIMgr.pnlGameTip);
            UIMgr.Instance().showHMI("prefab/ui/pnlGameTip");
            Cache.set(Cache.CK_FIRSTENTER, 1)
        }
        //未填信息
        if (UserMgr.getUser().nick == "") {
            this.showUser(false);
        }
        //已填信息
        else {
            var usert = UserMgr.getUser();
            //this.nodHasUser.active = true;
            this.showUser(true);
            this.lblName.string = this.decorateNameStr(UserMgr.getUser().nick);
            // cc.log("lbl name", this.lblName);
            UIMgr.Instance().showGender(this.lblName, UserMgr.getUser()["gender"]);
            this.lblID.string = this.decorateIDStr(UserMgr.getUser().uid);
            var user = UserMgr.getUser();
            if (Object.keys(user.invite).length > 0) {
                this.btnApply.active = true;
            }
            else {
                this.btnApply.active = false;
            }
            if (UserMgr.getUser().binding == "") {
                this.lblMateID.string = "";
                this.lblMateName.string = "";
                this.lblNoPT.node.active = true;
                UIMgr.Instance().showGender(this.lblMateName, -1);
            }
            else {
                this.lblNoPT.node.active = false;
                this.lblMateID.string = this.decorateIDStr(UserMgr.getUser().binding);
                this.lblMateName.string = this.decorateNameStr(UserMgr.getUser()["param"].oppoNick);
                UIMgr.Instance().showGender(this.lblMateName, UserMgr.getUser()["param"]["oppoGender"]);
            }

        }
    }

    onSucc() {
        this.title();
    }

    showUser(boolValue) {
        if (boolValue) {
            this.nodUserInfo.scaleX = 1;
            this.isNeedLogin = false;
            this.nodUserInfo.active = true
            this.title();
        }
        else {
            this.nodUserInfo.scaleX = 0;
            this.isNeedLogin = true;
        }
    }

    title() {
        // cc.log("title", UserMgr.GetNextUnlock());
        if (UserMgr.GetNextUnlock() <= 7 && UserMgr.GetNextUnlock() >= 1) {
            this.lblTitle.string = "第 " + UserMgr.CurrentLeavel() + " 幕";
        }
        else if (UserMgr.GetNextUnlock() == 8) {
            this.lblTitle.string = "通关";
        }
        else {
            this.lblTitle.string = "序幕";
        }
    }

    decorateIDStr(IDStr) {
        return "ID：" + IDStr;
    }

    decorateNameStr(NameStr, gender?: eGender) {
        let str = NameStr;
        return str;
    }

    ///-----------------------------------------------------分隔符
    onClickGOBtn() {
        let self = this;
        //未匹配
        if (UserMgr.getUser().binding == "") {
            // UIMgr.Instance().ShowUI(UIMgr.pnlMatch, false, null, () => {
            // });
            UIMgr.Instance().showHMI("prefab/ui/pnlMatch", ()=>{
                self.btnGO.getComponent(cc.Button).interactable = true;
            })
            return;
        }

        //已匹配，已选择角色
        if (UserMgr.getUser().role != 0) {
            // UIMgr.Instance().ShowUI(UIMgr.pnlLeavel, false, null, () => {
            // });
            UIMgr.Instance().showHMI("prefab/ui/pnlLeavel", ()=>{
                self.btnGO.getComponent(cc.Button).interactable = true;
            })
            return;
        }

        //已匹配，未选择角色
        if (UserMgr.getUser().param.isInviter) {
            // UIMgr.Instance().ShowUI(UIMgr.pnlRole, false, null, () => {
            // })
            UIMgr.Instance().showHMI("prefab/ui/pnlRole", ()=>{
                self.btnGO.getComponent(cc.Button).interactable = true;
            })
            return;
        }
        else {
            UIMgr.Instance().toast("等待对方选择角色", 2);
            this.btnGO.getComponent(cc.Button).interactable = true;
        }

    }

    onDealResponse(pram) {
        cc.log(pram)
        // UserMgr.StateObj = pram;
        if (Object.keys(UserMgr.getUser().invite).length <= 0) this.btnApply.active = false;
        if (pram[0] == 1) {
            let str = "已与" + pram[1]["nick"] + "绑定成功";
            UIMgr.Instance().toast(str, 2);
            UserMgr.getUser().binding = pram[1]["uid"];
            UserMgr.getUser()["param"]["oppoNick"] = pram[1]["nick"];
            UserMgr.getUser()["param"]["oppoGender"] = pram[1]["gender"]
            this.lblMateName.string = this.decorateNameStr(pram[1]["nick"]);
            UIMgr.Instance().showGender(this.lblMateName, pram[1]["gender"]);
            this.lblMateID.string = this.decorateIDStr(UserMgr.getUser().binding);
            this.lblNoPT.node.active = false;
            this.title();
        }
    }

}
