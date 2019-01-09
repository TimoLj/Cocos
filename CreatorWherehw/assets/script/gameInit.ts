const { ccclass, property } = cc._decorator;

import { GameMgr } from "./manager/GameMgr";
import { Cache } from "./framework/cache";
import { Plat } from "./framework/plat";
import { Audio } from "./framework/audio";
import { Notify } from "./framework/notify";
import { eNotifyEvent, eProc, eRole, eGameState, eNetState, eLayer } from "./manager/DefMgr";
import { ConfigMgr } from "./manager/ConfigMgr";
import { Socket } from "./framework/socket";
import { DataMgr } from "./manager/DataMgr";
import { UserMgr } from "./manager/UserMgr";
import { CommonMgr } from "./manager/CommonMgr";
import UIMgr from "./manager/UIMgr";
import { GameSet } from "./module/map/mapDef";
import AccountMgr from "./manager/AccountMgr";
import { Kbe } from "./kbengine/Kbe";

@ccclass
export default class gameInit extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    onLoad() {

        cc.game.addPersistRootNode(this.node);
        cc.log("=======================");
        cc.log("LOAD FRAMEWORK");

        // DataMgr.setMem("uid", Util.genCode(8));
        window["ms"] = {};
    window["ms"].data = DataMgr;
        window["ms"].user = UserMgr;

        // this._initSocket();

        Kbe.init()
        let username = Cache.get(Cache.CK_USERNAME);
        if (username) {
            // Socket.init(() => {
            //     let password = Cache.get(Cache.CK_PASSWORD);
            //     if (username) {
            //         let req = Socket.result(eProc.login);
            //         req.data["username"] = username;
            //         req.data["password"] = password;
            //         Socket.send(req);//发送登陆消息
            //     }
            // })
            // cc.log(username)
            UIMgr.Instance().loadMask(10);
            setTimeout(()=>{
                Kbe.onLogin(username, Cache.get(Cache.CK_PASSWORD))
            }, 1000)
        } else {
            UIMgr.Instance().showHMI("prefab/ui/Account/pnlAccount", ()=>{
                cc.find("pnlStart", this.node).destroy();
            });
        }
        ConfigMgr.init("config", () => {
            GameMgr.initGame();
            // this.nodGameScene.getComponent("gameScene").resetUI();
        });

        // ms.i18n = require("LanguageData");
        // ms.i18n.init("zh");
        this._preload();

        cc.log("LOAD FRAMEWORK FINISHED");
        cc.log("=======================");
        // cc.game.pause();
        // cc.director.preloadScene("homeScene");
        // cc.director.preloadScene("worldScene");
    }


    _preload() {
        // ms.loader.loadRes("prefab/battle/pnlBattle");
        // ms.loader.loadRes("prefab/main/pnlMain");
    }

    _initData() {

    }

    _initSocket() {
        Socket.reg(eProc.register, this._register, this);   // 注册
        Socket.reg(eProc.login, this._login, this); // 登录
        Socket.reg(eProc.onekeyreg, this._onekeyreg, this); // 有课登录
        Socket.reg(eProc.reconn, this._reconn, this);   // 断线重连
        Socket.reg(eProc.offline, this._offline, this); //对方掉线
        Socket.reg(eProc.reback, this._reback, this); //对方重连
        Socket.reg(eProc.logout, (msg) => {
            //CommonMgr.alert("提示", "账号在其他地方登陆", "确定");
        }, this);

    }


    start() {
        if (cc.sys.isNative) {
            window["__errorHandler"] = function (file, line, error) {
                if (Plat.mode() == "debug") return;
                // Http.logError("GE_" + cc.sys.platform, error + "_" + file + ":" + line);
            }
        } else if (cc.sys.isBrowser) {
            window.onerror = function (msg, url, line, words, stack) {
                if (Plat.mode() == "debug") return;
                // Http.logError("GE_" + cc.sys.platform, msg, url, line + ":" + words, stack.stack);
            }
        }

        Notify.on(eNotifyEvent.PlayMusic, this.onPlayMusic, this);
        Notify.on(eNotifyEvent.StopMusic, this.onStopMusic, this);
        Notify.on(eNotifyEvent.PlayEffect, this.onPlayEffect, this);
    }

    update(dt) {
        CommonMgr.tick(dt);
        // Socket.checkOnline(dt);
        Kbe.update(dt)
    }

    onDestroy() {
        Notify.off(eNotifyEvent.PlayMusic, this.onPlayMusic);
        Notify.off(eNotifyEvent.StopMusic, this.onStopMusic);
        Notify.off(eNotifyEvent.PlayEffect, this.onPlayEffect);
    }

    private _register(msg) {
        cc.log("register")
        if (msg.code != 0) {
            UIMgr.Instance().alert("提示", msg.msg, "确定");
            return;
        }
        let self = this;
        UIMgr.Instance().alert("提示", "注册成功", "确定", () => {
            self.updateLoacl(msg)
            self.userInfo(msg);
            self.loadHMI(msg, ()=>{ cc.find("pnlRegister", this.node).destroy() })
        }); 
    }
     
    private _login(msg){
        cc.log("login")
        if (msg.code != 0) {
            UIMgr.Instance().alert("提示", msg.msg, "确定");
            Cache.remove(Cache.CK_USERNAME);
            return;
        }
        this.updateLoacl(msg)
        this.userInfo(msg); // 更新玩家信息
        this.loadHMI(msg);  // 加载对应界面
        if (msg.data.user.param["needBoard"]) {
            CommonMgr.loadRes("prefab/ui/message/pnlCreateMessage", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("pnlCreateMessage").init(true);
                CommonMgr.addNode(a, eLayer.LAYER_NORMAL)
            })
        }
    }

    private _onekeyreg(msg){
        cc.log("onekeyreg")
        if (msg.code != 0) {
            UIMgr.Instance().alert("提示", msg.msg, "确定");
        }
        this.updateLoacl(msg)
        this.userInfo(msg);
        let self = this;
        this.loadHMI(msg, ()=>{ cc.find("pnlAccount", self.node).destroy() })
    }

    private _reconn(msg){
        cc.log("reconn")
        if(msg.code != 0) return;
        this.updateLoacl(msg)
        Socket.syncOfflineMsg();
        this.loadHMI(msg);
        Socket.syncOfflineMsg();
    }

    private _offline(msg){
        if(msg.code != 0) return;
        cc.log(msg, "对方掉线!");
        Notify.emit(eNotifyEvent.ConnectState, 0);
        UserMgr.StateObj["isOppoOnline"] = 0;
    }

    private _reback(msg){
        if(msg.code != 0) return;
        cc.log(msg, "对方重连！");
        Notify.emit(eNotifyEvent.ConnectState, 1);
        UserMgr.StateObj["isOppoOnline"] = 1;
    }

    private enterGame(param) {
        let canvas = cc.find("Canvas");
        CommonMgr.loadRes("prefab/map/pnlGameInter", cc.Prefab, (err, res) => {
            let a: cc.Node = cc.instantiate(res);
            if (UserMgr.getUser().role == eRole.Orion) {
                a.getComponent("pnlGameInter").init(false, false, param);
            } else {
                a.getComponent("pnlGameInter").init(true, false, param);
            }
            canvas.addChild(a);
        })
    }

    private onPlayMusic(param) {
        var name = param[0];
        var loop = param[1] || true;

        var volumn = Cache.get(Cache.CK_AUDIO_MUSIC, 1);
        if (volumn <= 0) return;

        Audio.playMusic("audio/" + name, loop, volumn);
    }

    private onStopMusic() {
        cc.audioEngine.stopMusic();
    }

    private onPlayEffect(param) {
        let name = param[0];
        let loop = param[1] || false;

        var volumn = Cache.get(Cache.CK_AUDIO_EFFECT, 1);
        if (volumn <= 0) return;

        Audio.playEffect("audio/" + name, loop, volumn);
    }

    private loadHMI(msg, callBack?){
        let gameState = GameMgr.getGameState(),
        NetState = msg.data.state.state;
        if(gameState == eGameState.Main){   // 退出游戏重连，网络保持的状态和本地状态是否一致
            if(NetState == eNetState.Normal){
                if(callBack){
                    callBack();
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

    private recoverGame(msg) {
        let self = this,
        NetState = msg.data.state.state,
        NetOppoState = msg.data.state.oppoState;

        if(NetState == eNetState.Prepare){  // 离线时为准备状态
            if(NetOppoState == eNetState.Gaming || NetOppoState == eNetState.Prepare){ // 队友已经入游戏或者为已准备状态，直接进入游戏
                this.enterGame(msg);
            }else{
                UIMgr.Instance().showHMI("prefab/ui/pnlLeavel", ()=>{
                    self.node.destroy();
                });
            }
        }
        else if(NetState == eNetState.Gaming){
            if(NetOppoState == eNetState.Gaming){
                this.enterGame(msg);
            }else{
                UIMgr.Instance().showHMI("prefab/ui/pnlLeavel", ()=>{
                    self.node.destroy();
                });
            }
        }
    }

    private userInfo(msg) {
        Cache.set(Cache.CK_USERNAME, msg.data.user.username);
        Cache.set(Cache.CK_PASSWORD, msg.data.user.password);AccountMgr.Instance().AddOneAccount(msg.data.user.username, msg.data.user.password);
        UserMgr.setUser(msg.data.user);
        Notify.emit(eNotifyEvent.GetUser, msg);                   
        Socket.initSucc();
    }

    private updateLoacl(msg){
        CommonMgr.updateNow(msg.time);
        UserMgr.StateObj = msg.data.state;
    }


}
