import { eProc } from "../manager/DefMgr";
import { Cache } from "./cache";
import { Plat } from "./plat";
import { UserMgr } from "../manager/UserMgr";
import { GameSet } from "../module/map/mapDef";
import UIMgr from "../manager/UIMgr";
import { Kbe } from "../kbengine/Kbe";
import KBEEvent from "../kbengine/core/Event";

export class Socket{
    private static _ws = null;
    private static _isInit = false;
    private static _isReconn = true;
    private static _notifyFuncs = {};
    private static _initCold = Date.now();
    private static _coldTime = 1000;//断线重连尝试的时间间隔
    private static _waitMsg = [];//由于网络原因发送失败的消息
    private static _gameProc = [2003, 2004, 2005, 2007, 2008, 2012, 2013, 2014, 2015, 2016];

    public static init(cb){
        this.initWs(() => {
            // let username = Cache.get(Cache.CK_USERNAME);
            // let password = Cache.get(Cache.CK_PASSWORD);
            // if(username){
            //     let req = this.result(eProc.login);
            //     req.data["username"] = username;
            //     req.data["password"] = password;
            //     this.send(req);
            // }else{
            //     let req = this.result(eProc.register);
            //     req.data["plat"] = Plat.plat();
            //     this.send(req);
            // }
            // let username = Cache.get(Cache.CK_USERNAME);
            // let password = Cache.get(Cache.CK_PASSWORD);
            // if (username) {
            //     let req = Socket.result(eProc.login);
            //     req.data["username"] = username;
            //     req.data["password"] = password;
            //     //cc.log("发送登陆消息", username, "  ", password);
            //     Socket.send(req);//发送登陆消息
            // }
            // else {
            //     UIMgr.Instance().ShowUI(UIMgr.pnlAccount);//进入账户界面
            // }
            cb();
        });
    }

    private static initWs(cb){
        this._initCold = Date.now();
        this._ws = new WebSocket("ws://132.232.13.38:10014");

        this._ws.onopen = (event) => {
            cc.log("ws is readying...");
            cb();
        };

        this._ws.onmessage = (event) => {
            // cc.log("response text msg: " + event.data);
            this.onMsg(JSON.parse(event.data));
        };

        this._ws.onerror = (event) => {
            cc.log("Send Text fired an error");
            // this.reconn();
        };

        this._ws.onclose = (event) => {
            cc.log("WebSocket instance closed.");
            if(this._isReconn){
                this.reconn();
            }else{
                this._isReconn = true;
            }
        };
    }

    public static send(msg){
        Kbe.sendMsg(msg);
        return;
        if(this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify(msg));
        }else{
            if(msg.proc != eProc.reconn){
                this._waitMsg.push(msg);
            }

            if(this._ws.readyState === WebSocket.CLOSING || this._ws.readyState === WebSocket.CLOSED){
                cc.log("WebSocket instance wasn't ready...");
                this.reconn();
            }else if(this._ws.readyState === WebSocket.CONNECTING){
                cc.log("WebSocket instance is connecting...");
                cc.log(msg)
            }
        }
    }

    public static initSucc(){
        this._isInit = true;
    }

    private static reconn(){
        if(!this._isInit) return;
        if(this._ws.readyState === WebSocket.OPEN || this._ws.readyState === WebSocket.CONNECTING) return;
        if(Date.now() - this._initCold > this._coldTime){
            this.initWs(() => {
                this.send(this.result(eProc.reconn));
            });
        }
    }

    public static close(){
        // this._isInit = false;
        // this._isReconn = false;
        // this._ws.close();
        KBEEvent.Fire("onSocketClosed", 1);
    }

    public static checkOnline(dt){
        this.reconn();
    }

    public static syncOfflineMsg(){
        if(this._waitMsg.length <= 0) return;
        var temp = this._waitMsg;
        this._waitMsg = [];

        if(!GameSet.showGameState()) return;
        //游戏内的行为，游戏外的消息就不用发了
        for(let msg of temp){ 
            if(this._gameProc.indexOf(msg.proc) < 0) continue;
            this.send(msg);
        }
    }

    public static reg(proc, func, target){
        this._notifyFuncs[proc] = { func, target };
    }

    public static unreg(proc){
        delete this._notifyFuncs[proc];
    }

    public static result(proc){
        var obj = {
            proc : proc,
            uid : UserMgr.getUid(),
            data : {},
            time : Date.now()
        };
        return obj;
    }

    public static onMsg(msg){
        // if(msg.code != 0){
        //     CommonMgr.alert("提示", msg.msg, "确定");
        //     cc.log("socket err msg={?}".format(JSON.stringify(msg)));
        //     return;
        // }

        var item = this._notifyFuncs[msg.proc];
        if(item){
            item.func.call(item.target, msg);
        }else{
            //cc.log("socket call err msg={?}".format(JSON.stringify(msg)));
        }
    }
}
