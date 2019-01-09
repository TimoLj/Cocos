import KBEEvent from "./core/Event";
import { KBEngineArgs, KBEngineApp } from "./core/KBEngine";
import UIMgr from "../manager/UIMgr";
import { Cache } from "../framework/cache";
import AccountMgr from "../manager/AccountMgr";
import { eNotifyEvent, eLayer, eRole, eProc, eGameState, eNetState } from "../manager/DefMgr";
import { Notify } from "../framework/notify";
import { CommonMgr } from "../manager/CommonMgr";
import { UserMgr } from "../manager/UserMgr";
import { GameSet } from "../module/map/mapDef";
import { Util } from "../framework/util";
import { Plat } from "../framework/plat";
import { GameMgr } from "../manager/GameMgr";

export class Result {
    public proc = 0;
    public code = 0;
    public msg = "";
    public data = {};
    public time = Date.now();
	constructor(proc, err){
		this.proc = proc;
        this.code = err ? 1001 : 0;
        this.msg = err;
	}
}

export class Kbe{
    private static _username = null
    private static _password = null
    private static _account = null
    private static _connectState : number = 0
    private static _offlineCheck : number = 0
    private static _reconnTimes : number = 0
    private static _lastSend = 20 //首次等20s，让客户端完成登录再发心跳
    private static LAST_SEND = 3 //默认3s一次心跳
    
    private static _waitMsg = [];//由于网络原因发送失败的消息
    private static _gameProc = [2004, 2005, 2007, 2008, 2012, 2013, 2014, 2015, 2016, 2020];//只有这部分协议需要同步

    public static init() {
        this.initServerApp()
        this.installEvents();
    }

    public static initAccount(account){
        this._account = account;
    }

    public static resetLastSend(){
        this._lastSend = this.LAST_SEND
    }

    private static installEvents(){
        KBEEvent.Register("onCreateAccountResult", this, this.onCreateAccountResult.bind(this))
        KBEEvent.Register("onLoginFailed", this, this.onLoginFailed.bind(this))
        KBEEvent.Register("onReloginBaseappSuccessfully", this, this.onReloginBaseappSuccessfully.bind(this))
        KBEEvent.Register("OnNetworkError", this, this.OnNetworkError.bind(this))
        KBEEvent.Register("onSocketClosed", this, this.onSocketClosed.bind(this))
        KBEEvent.Register("onConnectionState", this, this.onConnectionState.bind(this))
        KBEEvent.Register("onInitAccount", this, this.onInitAccount.bind(this))
    }

    private static initServerApp():void {
        cc.log("init Server App")
        let args = new KBEngineArgs();
        // args.address='127.0.0.1'
        args.address='192.168.0.103'
        args.address = "123.206.177.39"
        args.port = 20013;

        args.clientType=5
        KBEngineApp.Destroy();
        KBEngineApp.Create(args)
    }

    public static onRegister(username, password){
        this._username = username
        this._password = password
        KBEngineApp.app.CreateAccount(username, password, "")
    }

    public static onLogin(username, password){
        this._username = username
        this._password = password
        KBEngineApp.app.Login(username, password, "")
    }

    private static onCreateAccountResult(err, datas) {
        cc.log("onCreateAccountResult", err, datas)
        if(err){
            UIMgr.Instance().alert("提示", err, "确定");
			return;
		}

        UIMgr.Instance().alert("提示", "注册成功", "确定", () => {
            Cache.set(Cache.CK_USERNAME, this._username);
            Cache.set(Cache.CK_PASSWORD, this._password);
            AccountMgr.Instance().AddOneAccount(this._username, this._password);
            this.onLogin(this._username, this._password);
            let a: cc.Node = cc.find("Canvas/pnlRegister"),
                b: cc.Node = cc.find("Canvas/pnlAccount");
            if(a) a.destroy();
            if(b) b.destroy();
        });
    }

    private static onLoginFailed(failcode){
        cc.log("onLoginFailed", failcode)
        if(KBEngineApp.app.getServerErrorsName(failcode) == "SERVER_ERR_NOT_FOUND_ACCOUNT"){
            Cache.remove(Cache.CK_USERNAME);
            Cache.remove(Cache.CK_PASSWORD);
        }
        UIMgr.Instance().alert("提示", KBEngineApp.app.getServerErrorsDesc(failcode), "确定");
    }

    private static reconnctServer(){
        cc.log("reloginBaseapp")
        KBEngineApp.app.ReloginBaseapp()
        this._reconnTimes += 3;
    }
    
    private static onSocketClosed(){
        this._connectState = arguments[0] ? 0 : 2
        this._reconnTimes = 3
        this._lastSend = this.LAST_SEND
    }

    private static OnNetworkError(){
        this._connectState = 2
    }

    private static onConnectionState(){

    }

    private static createUser(uid, nick, gender, role, binding, data, core){
        var base = JSON.parse(data)
        var user = {
            uid,
            username : this._username,
            password : this._password,
            nick,
            gender,
            role,
            binding,

            base : base,
            invite : base["invite"] || {},
            param : JSON.parse(core),
        }
        return user;
    }

    private static enterGame(param) {
        cc.log("enter game");
        CommonMgr.loadRes("prefab/map/pnlGameInter", cc.Prefab, (err, res) => {
            let a: cc.Node = cc.instantiate(res);
            if (UserMgr.getUser().role == eRole.Orion) {
                a.getComponent("pnlGameInter").init(false, false, param);
            } else {
                a.getComponent("pnlGameInter").init(true, false, param);
            }
            CommonMgr.addNode(a, eLayer.LAYER_NORMAL);
        })
    }

    private static onInitAccount(err, uid, nick, gender, role, binding, data, core, state, time){
        this._connectState = 1
        CommonMgr.updateNow(parseInt(time))
        state = JSON.parse(state)
        Cache.set(Cache.CK_USERNAME, this._username);
        Cache.set(Cache.CK_PASSWORD, this._password);
        var user = this.createUser(uid, nick, gender, role, binding, data, core);
        UserMgr.setUser(user);
        this.loadHMI(state);
        UIMgr.Instance().closeMask();
    }

    private static loadHMI(msg){
        UserMgr.StateObj = msg;
        cc.log(UserMgr.StateObj)
        let gameState = GameMgr.getGameState(),
            pnlStart = "prefab/ui/pnlStart",
            NetState = msg.selfState,
            canvas = cc.find("Canvas");
        if(gameState == eGameState.Register){
            UIMgr.Instance().showHMI(pnlStart, ()=>{
                let a = cc.find("pnlRigister", canvas)
                if(cc.isValid(a)) a.destroy() 
            })
        }
        else if(gameState == eGameState.Login){
            UIMgr.Instance().showHMI(pnlStart, ()=>{
                let a = cc.find("pnlAccount", canvas);
                if(a) a.destroy();
            })
        }
        else if(gameState == eGameState.Main){   // 退出游戏重连，网络保持的状态和本地状态是否一致 
            Notify.emit(eNotifyEvent.GetUser, msg);   
            if(NetState == eNetState.Normal){
                if(!cc.find("pnlStart", canvas)){
                    UIMgr.Instance().showHMI(pnlStart)
                }
            }else{
                this.recoverGame(msg)
            }
        }
        else if(gameState == eGameState.Prepare){
            this.recoverGame(msg);
        }
        else if(gameState == eGameState.Gaming){
            Notify.emit(eNotifyEvent.reConnect, msg);
        }
        else if(gameState == eGameState.Message){

        }
    }

    private static recoverGame(msg) {
        let NetState = msg.selfState,
        NetOppoState = msg.oppoState;

        if(NetState == eNetState.Prepare){  // 离线时为准备状态
            if(NetOppoState == eNetState.Gaming || NetOppoState == eNetState.Prepare){ // 队友已经入游戏或者为已准备状态，直接进入游戏
                Kbe.enterGame(msg);
            }else{
                UIMgr.Instance().showHMI("prefab/ui/pnlLeavel");
            }
        }
        else if(NetState == eNetState.Gaming){
            if(NetOppoState == eNetState.Gaming){
                Kbe.enterGame(msg);
            }else{
                UIMgr.Instance().showHMI("prefab/ui/pnlLeavel");
            }
        }
    }

    private static onReloginBaseappSuccessfully(){
        cc.log("onReloginBaseappSuccessfully", arguments)
        this._connectState = 1
        this._offlineCheck = 0
        this._reconnTimes = 1
        this._lastSend = this.LAST_SEND
        this.syncOfflineMsg();
    }
    

    public static destroy(){
        KBEEvent.DeregisterObject(this)
    }

    public static update(dt){
        if(this._connectState == 2){
            this._offlineCheck += dt
            var time = Math.min(10, this._reconnTimes)
            if(this._offlineCheck > time){
                this._offlineCheck = 0
                this.reconnctServer()
            }
        }
    }

    public static sendMsg(msg){
        if(this._connectState == 1) {
            this.send(msg);
        }else if(this._connectState == 2){
            if(this._gameProc.indexOf(msg.proc) < 0) return;
            this._waitMsg.push(msg);
        }
    }

    private static send(msg){
        this._lastSend = this.LAST_SEND
        if(msg.proc == eProc.login){
            this.onLogin(msg.data.username, msg.data.password)
        }else if(msg.proc == eProc.register){
            this.onRegister(msg.data.username, msg.data.password)
        }else if(msg.proc == eProc.onekeyreg){
            this.onRegister(Util.genCode(8), Util.genCode(8))
        }
        
        else if(msg.proc == eProc.userinfo){
            this._account.BaseCall("onInitPlayer", Plat.plat(), msg.data.nick, msg.data.gender)
        }else if(msg.proc == eProc.invite){
            this._account.BaseCall("onInvite", parseInt(msg.data.uid))
        }else if(msg.proc == eProc.response){
            this._account.BaseCall("onResponseInvite", parseInt(msg.data.uid), msg.data.state)
        }else if(msg.proc == eProc.select){
            this._account.BaseCall("onSelectRole", msg.data.myrole, msg.data.opporole)
        }else if(msg.proc == eProc.reset){
            this._account.BaseCall("onReset")
        }else if(msg.proc == eProc.achieve){
            this._account.BaseCall("onAchieve", msg.data.id)
        }

        else if(msg.proc == eProc.board){
            this._account.BaseCall("onBoard", msg.data.words)
        }else if(msg.proc == eProc.myboard){
            this._account.BaseCall("onBoardMine")
        }else if(msg.proc == eProc.boardlist){
            this._account.BaseCall("onBoardList")
        }else if(msg.proc == eProc.boardlike){
            this._account.BaseCall("onBoardLike", msg.data.id)
        }
        
        else if(msg.proc == eProc.givechip){
            this._account.BaseCall("onChipGive", msg.data.uid, msg.data.id)
        }else if(msg.proc == eProc.drawchip){
            this._account.BaseCall("onChipDraw", msg.data.uuid + "")
        }else if(msg.proc == eProc.delchip){
            this._account.BaseCall("onChipRefuse", msg.data.uuid + "")
        }else if(msg.proc == eProc.compose){
            this._account.BaseCall("onChipCompose")
        }

        else if(msg.proc == eProc.ready2){
            this._account.BaseCall("onReady", msg.data.curDungeon)
        }else if(msg.proc == eProc.unready){
            this._account.BaseCall("onCancelReady")
        }else if(msg.proc == eProc.initmap){
            this._account.BaseCall("onInitMap", JSON.stringify(msg.data))
        }else if(msg.proc == eProc.operate){
            if(typeof(msg.data.value) == "object"){
                this._account.BaseCall("onOperate", msg.data.type, JSON.stringify(msg.data.value), msg.data.state ? 1 : 0)
            }else{
                this._account.BaseCall("onOperate", msg.data.type, msg.data.value + "", msg.data.state ? 1 : 0)
            }
        }else if(msg.proc == eProc.giveup){
            this._account.BaseCall("onGiveup")
        }else if(msg.proc == eProc.refuse){
            this._account.BaseCall("onRefuse")
        }else if(msg.proc == eProc.exit){
            cc.log(msg)
            this._account.BaseCall("onExit")
        }else if(msg.proc == eProc.succ){
            this._account.BaseCall("onSuccess")
        }

//type 0: initmap, 1: move, 2: fire, 3: markmap, 4: fixhole, 5: killmonster, 6: giveup, 7: hurt, 8: pickwood
//9: nightsee, 10: crtwave, 11: firering, 12: pickchip, 13: door, 14: clickGame, 15: godweapon
        else if(msg.proc == eProc.move){
            this._account.BaseCall("onOperate", 1, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.fixhole){
            this._account.BaseCall("onOperate", 4, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.killmonster){
            this._account.BaseCall("onOperate", 5, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.fire){
            this._account.BaseCall("onOperate", 2, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.markmap){
            this._account.BaseCall("onOperate", 3, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.hurt){
            this._account.BaseCall("onOperate", 7, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.crtwave){
            this._account.BaseCall("onOperate", 10, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.firering){
            this._account.BaseCall("onOperate", 11, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.pickchip){
            this._account.BaseCall("onOperate", 12, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.door){
            this._account.BaseCall("onOperate", 13, JSON.stringify(msg.data), 1)
        }else if(msg.proc == eProc.godweapon){
            this._account.BaseCall("onOperate", 15, JSON.stringify(msg.data), 1)
        }
    }

    public static syncOfflineMsg(){
        if(this._waitMsg.length <= 0) return;
        var temp = this._waitMsg;
        this._waitMsg = [];

        if (!GameSet.showGameState()) return;
        //游戏内的行为，游戏外的消息就不用发了
        for(let msg of temp){ 
            this.sendMsg(msg);
        }
    }
}
