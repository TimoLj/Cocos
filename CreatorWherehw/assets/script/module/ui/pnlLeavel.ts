import { CommonMgr } from "../../manager/CommonMgr";
import { Notify } from "../../framework/notify";
import { eNotifyEvent, eProc, eRole, eGameState, Def } from "../../manager/DefMgr";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import UIMgr from "../../manager/UIMgr";
import { GameMgr } from "../../manager/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlLeavel extends cc.Component {


    @property(cc.Node)
    btnReady: cc.Node = null;

    @property(cc.Node)
    nodTime: cc.Node = null;

    @property(cc.Label)
    lblLeavleMsg: cc.Label = null;

    @property(cc.Node)
    nod4Test: cc.Node = null;

    @property(cc.Sprite)
    sprLeavle: cc.Sprite = null;

    @property(cc.Label)
    myready: cc.Label = null;

    @property(cc.Label)
    oppoready: cc.Label = null;

    @property(cc.Label)
    mynick: cc.Label = null;

    @property(cc.Label)
    opponick: cc.Label = null;

    @property(cc.Sprite)
    myspr: cc.Sprite = null;

    @property(cc.Sprite)
    oppospr: cc.Sprite = null;

    @property(cc.SpriteFrame)
    orion: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    merope: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    spfConn: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    spfUnConn: cc.SpriteFrame = null;

    @property(cc.Sprite)
    sprOppoNetState: cc.Sprite = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    nodSelect: cc.Node = null;


    refreshTime: number = Def.RoundRefresh;//每20小时刷新一关，测试用小数据

    remainTime: number = 0;//剩余时间

    mCurDungeon: number = 0;

    timer: number = -1;

    mAni: cc.Animation;

    onLoad() {
        GameMgr.changeGameState(eGameState.Prepare);
        Socket.reg(eProc.match, (pram) => {
            this.nodSelect.active = false;
            UserMgr.getUser().param.curDungeon = this.mCurDungeon;
            this.enterGame(pram);
        }, this);
        Socket.reg(eProc.ready2, (pram) => {
            cc.log("ready", pram);
            if (pram.code != 0) {
                UIMgr.Instance().alert("", pram.msg, "返回");
                return;
            }
            this.nodSelect.active = false;
            UserMgr.getUser().param.curDungeon = this.mCurDungeon;
            this.onReadyChange(true);
        }, this);
        Socket.reg(eProc.unready, (pram) => {
            if (pram.code != 0) {
                UIMgr.Instance().alert("", pram.msg, "返回");
                return;
            }

        }, this);
        Notify.on(eNotifyEvent.MateIsReadied, this.onMateRedyChange, this);
        Notify.on(eNotifyEvent.ConnectState, this.onChgConnState, this);
    }

    start() {
        this.mCurDungeon = UserMgr.CurrentLeavel();
        this.mAni = this.getComponent(cc.Animation);
        var aniState = this.mAni.play();
        aniState.wrapMode = cc.WrapMode.Default;
        this.nodSelect.active = false;
        cc.log(UserMgr.StateObj)
        if (UserMgr.StateObj["oppoState"] == 1) {
            this.isReady(true, this.oppoready);
        }
        else {
            this.isReady(false, this.oppoready);
        }

        if (UserMgr.StateObj["isOppoOnline"] == 1) {
            this.sprOppoNetState.spriteFrame = this.spfConn;
        }
        else {
            this.sprOppoNetState.spriteFrame = this.spfUnConn;
        }
        this.onReadyChange(UserMgr.StateObj["state"] == 1);
        this.mynick.string = UserMgr.getUserNick();
        this.opponick.string = UserMgr.getUser()["param"].oppoNick;
        UIMgr.Instance().showGender(this.mynick, UserMgr.getUser()["gender"]);
        UIMgr.Instance().showGender(this.opponick, UserMgr.getUser()["param"]["oppoGender"]);
        if (UserMgr.getUser().role == eRole.Orion) {
            this.myspr.spriteFrame = this.orion;
            this.oppospr.spriteFrame = this.merope;
        }
        else {
            this.myspr.spriteFrame = this.merope;
            this.oppospr.spriteFrame = this.orion;
        }
        //-------显示关卡和计时-----分隔符
        //cc.log("dg", this.mCurDungeon);
        if (UserMgr.GetNextUnlock() >= 1 && UserMgr.GetNextUnlock() <= 7) {
            this.title.string = `第${this.mCurDungeon}幕`;
            this.remainTime = this.getRemainTime();//剩余时间/秒
            if (this.remainTime <= 0) {
                this.nodTime.active = false;
                this.sprLeavle.setState(0);
                return;
            }
            this.nodTime.active = true;
            this.sprLeavle.setState(1);//灰
            this.lblLeavleMsg.string = "第" + (this.mCurDungeon - 1) + "幕完成，距离下关开启还有" + this.decorateTime(this.remainTime);
            this.timer = setInterval(() => {
                this.remainTime = this.remainTime - 1;
                if (this.remainTime <= 0) {
                    this.nodTime.active = false;
                    this.sprLeavle.setState(0);
                    clearInterval(this.timer);
                    return;
                }
                this.nodTime.active = true;
                this.sprLeavle.setState(1);//灰
                this.lblLeavleMsg.string = "第" + (this.mCurDungeon - 1) + "幕完成，距离下关开启还有" + this.decorateTime(this.remainTime);
            }, 1000);
        }
        else if (UserMgr.GetNextUnlock() == 0) {
            this.title.string = "序幕";
            this.nodTime.active = false;
            this.sprLeavle.setState(0);
        }
        else if (UserMgr.GetNextUnlock() == 8) {
            this.lblLeavleMsg.node.active = false;
            this.title.string = `第${this.mCurDungeon}幕`;
            this.nodTime.active = false;
            this.sprLeavle.setState(0);
            this.nodSelect.active = true;
        }
    }

    onDestroy() {
        clearInterval(this.timer);
        Socket.unreg(eProc.match);
        Socket.unreg(eProc.ready2);
        Socket.unreg(eProc.unready);
        Notify.off(eNotifyEvent.MateIsReadied, this.onMateRedyChange);
        Notify.off(eNotifyEvent.ConnectState, this.onChgConnState);
    }

    onClickReady() {

        if (this.remainTime > 0) {
            UIMgr.Instance().toast("等待倒计时结束才可以进入关卡");
            return;
        }
        var req = Socket.result(eProc.ready2);
        req.data["uid"] = UserMgr.getUser().binding;
        req.data["curDungeon"] = this.mCurDungeon;
        Socket.send(req);
    }

    onClickBack() {

        if (UserMgr.StateObj["state"] == 1) {
            var pro = Socket.result(eProc.unready);
            pro.data["uid"] = UserMgr.getUser().binding;
            Socket.send(pro);
            this.onReadyChange(false);
        }
        //UIMgr.Instance().DestroyUI(UIMgr.pnlLeavel);
        var aniState2 = this.mAni.play();
        aniState2.wrapMode = cc.WrapMode.Reverse;
        let self = this;
        setTimeout(() => {
           UIMgr.Instance().showHMI("prefab/ui/pnlStart", ()=>{
               self.node.destroy();
           })
        }, aniState2.duration * 1000);
    }

    onClickRight() {
        if (this.mCurDungeon == 7) {
            return;
        }
        this.mCurDungeon = this.mCurDungeon || 1;
        this.mCurDungeon = this.mCurDungeon + 1;
        this.title.string = `第${this.mCurDungeon}幕`;
    }

    onClickLeft() {
        if (this.mCurDungeon == 1) {
            return;
        }
        this.mCurDungeon = this.mCurDungeon || 1;
        this.mCurDungeon = this.mCurDungeon - 1;
        this.title.string = `第${this.mCurDungeon}幕`;
    }

    onClickTest() {
        //CommonMgr.alert("", "由于这是个测试按钮，点击了这个按钮后不要乱点击或者重启或者掉线，不然会出bug的。", "确定");
        this.remainTime = 0;
    }

    private onChgConnState(pram) {
        if (pram[0] == 1) {
            this.sprOppoNetState.spriteFrame = this.spfConn;
        }
        else {
            this.sprOppoNetState.spriteFrame = this.spfUnConn;
        }
    }

    private enterGame(param) {
        if (param['code'] != 0) return;
        let self = this;
        //cc.log(UserMgr.getUser().role)
        let canvas = cc.find("Canvas");
        CommonMgr.loadRes("prefab/map/pnlGameInter", cc.Prefab, (err, res) => {
            let a: cc.Node = cc.instantiate(res);
            if (UserMgr.getUser().role == eRole.Orion) {
                a.getComponent("pnlGameInter").init(false, true, param.time);
            } else {
                a.getComponent("pnlGameInter").init(true, true, param.time);
            } 
            canvas.addChild(a);
            self.node.destroy();
            UserMgr.StateObj["state"] = 2;
            UserMgr.StateObj["oppoState"] = 2;
        });
    }

    private isReady(p: boolean, lbl: cc.Label) {
        if (p) {
            lbl.string = "已准备";
            lbl.node.color = cc.color(80, 110, 0, 255);
        }
        else {
            lbl.string = "未准备";
            lbl.node.color = cc.color(120, 120, 120, 255);
        }
    }
    //返回秒
    private getRemainTime() {
        if (UserMgr.GetNextUnlock() == 0 || UserMgr.GetNextUnlock() == 1) {
            return 0;
        }
        //秒
        var interval = Math.floor(CommonMgr.currentTime() / 1000 - UserMgr.getUser().param.passTime / 1000);//上一次过关到现在的时间间隔
        //秒
        var temp = Math.floor(this.refreshTime * 3600);//总时间
        return temp - interval;
    }

    private decorateTime(pram) {
        var h, m, s;
        h = Math.floor(pram / 3600);
        m = Math.floor(pram / 60) - h * 60;
        s = pram - h * 3600 - m * 60;
        return h + "时" + m + "分" + s + "秒";
    }

    private onReadyChange(parm: boolean) {
        this.isReady(parm, this.myready);
        UserMgr.StateObj["state"] = 0;
        if (parm) {
            UserMgr.StateObj["state"] = 1;
        }
        this.btnReady.active = !parm;
    }

    private onMateRedyChange(pram) {
        if (pram[0]) {
            //this.lblMateReady.string = "对方已准备";
            this.isReady(true, this.oppoready);
        }
        else {
            //this.lblMateReady.string = "对方未准备";
            this.isReady(false, this.oppoready);
        }
    }
}
