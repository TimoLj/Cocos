import Entity from "../core/Entity";
import {RegisterScript} from "../core/ExportEntity";
import KBEEvent from "../core/Event";
import { Kbe, Result } from "../Kbe";
import { Notify } from "../../framework/notify";
import { eNotifyEvent, eProc } from "../../manager/DefMgr";
import { UserMgr } from "../../manager/UserMgr";
import { Socket } from "../../framework/socket";

export class Account extends Entity
{
    __init__(){
        super.__init__()
        Kbe.initAccount(this)
    }

    //系统接口
    onInitAccount(err, uid, nick, gender, role, binding, data, core, state, time){
        cc.log("onInitAccount", arguments)
        KBEEvent.Fire("onInitAccount", err, uid, nick, gender, role, binding, data, core, state, time);
    }
    
    //用户接口
    onInitPlayer(err, uid, nick, gender){
        cc.log("onInitPlayer", arguments)
        var result = new Result(eProc.userinfo, err)
        result.data["nick"] = nick
        result.data["gender"] = gender
        Socket.onMsg(result);

    }

    onInvite(err, uid, nick, gender, invite){
        cc.log("onInvite", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.invite : eProc.invited, err)
        result.data["uid"] = uid;
        result.data["nick"] = nick;
        result.data["gender"] = gender;
        result.data["invite"] = JSON.parse(invite);
        Socket.onMsg(result);
    }

    onResponseInvite(err, uid, state, nick, gender, isOppoOnline){
        cc.log("onResponseInvite", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.response : eProc.responsed, err)
        result.data["state"] = state;
        result.data["PsvID"] = uid;
        result.data["PsvNick"] = nick;
        result.data["PsvGender"] = gender;
        cc.log(isOppoOnline)
        result.data["isOppoOnline"] = isOppoOnline;
        Socket.onMsg(result);
    }
    
    onSelectRole(err, uid, myrole, opporole){
        cc.log("onSelectRole", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.select : eProc.selected, err)
        result.data["myrole"] = myrole;
        result.data["opporole"] = opporole;
        Socket.onMsg(result);
    }

    onReset(err, uid){
        cc.log("onReset", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.reset : eProc.reseted, err)
        Socket.onMsg(result);
    }
    
    onAchieve(err, uid){
        cc.log("onAchieve", arguments)
        var result = new Result(eProc.achieve, err)
        Socket.onMsg(result);
    }
    
    onOppoOnline(err, uid){
        cc.log("onOppoOnline", arguments)
        Notify.emit(eNotifyEvent.ConnectState, 1);
        UserMgr.StateObj["isOppoOnline"] = 1;
    }

    onOppoOffline(err, uid){
        cc.log("onOppoOffline", arguments)
        Notify.emit(eNotifyEvent.ConnectState, 0);
        UserMgr.StateObj["isOppoOnline"] = 0;
    }
    //留言接口
    onBoard(err, uid){
        cc.log("onBoard", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.board : eProc.boarded, err)
        Socket.onMsg(result);
    }
    
    onBoardMine(err, uid, list){
        cc.log("onBoardMine", arguments)
        cc.log(JSON.parse(list))
        cc.log(JSON.parse(list).nick1, JSON.parse(list).words1)
        var result = new Result(eProc.myboard, err)
        result.data["list"] = JSON.parse(list);
        Socket.onMsg(result);
    }

    onBoardList(err, uid, list){
        cc.log("onBoardList", arguments)
        var result = new Result(eProc.boardlist, err)
        result.data["list"] = JSON.parse(list);
        Socket.onMsg(result);
    }

    //碎片接口
    onChipGive(err, uid, chip){
        cc.log("onChipGive", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.givechip : eProc.givechiped, err)
        result.data = JSON.parse(chip)
        Socket.onMsg(result);
    }
    
    onChipDraw(err, uid){
        cc.log("onChipDraw", arguments)
        var result = new Result(eProc.drawchip, err)
        Socket.onMsg(result);
    }
    
    onChipCompose(err, uid){
        cc.log("onChipCompose", arguments)
        var result = new Result(eProc.compose, err)
        Socket.onMsg(result);
    }

    //地图接口
    onReady(err, uid, curDungeon){
        cc.log("onReady", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.ready2 : eProc.readied, err)
        result.data["curDungeon"] = curDungeon;
        Socket.onMsg(result);
    }
    onCancelReady(err, uid){
        cc.log("onCancelReady", arguments)
        var result = new Result(UserMgr.getUid() == uid ? eProc.unready : eProc.unreadied, err)
        Socket.onMsg(result);
    }
    onMatch(err, uid){
        cc.log("onMatch", arguments)
        var result = new Result(eProc.match, err)
        Socket.onMsg(result);
    }
    onInitMap(err, uid){
        cc.log("onInitMap", arguments)
        var result = new Result(eProc.initmap, err)
        Socket.onMsg(result);
    }

    onOperate(err, uid, type, value){
        Kbe.resetLastSend()
        // cc.log("onOperate", arguments)
        if(type == 1){
            var result = new Result(eProc.move, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 4){
            var result = new Result(eProc.fixhole, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 5){
            var result = new Result(eProc.killmonster, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 2){
            var result = new Result(eProc.fire, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 3){
            var result = new Result(eProc.markmap, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 7){
            var result = new Result(eProc.hurt, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 10){
            var result = new Result(eProc.crtwave, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 11){
            var result = new Result(eProc.firering, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 12){
            var result = new Result(eProc.pickchip, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 13){
            var result = new Result(eProc.door, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 15){
            var result = new Result(eProc.godweapon, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }else if(type == 16){
            var result = new Result(eProc.sacrifice, err)
            result.data = JSON.parse(value)
            Socket.onMsg(result);
        }
    }
    onGiveup(err, uid){
        cc.log("onGiveup", arguments)
        var result = new Result(eProc.giveup, err)
        Socket.onMsg(result);
    }
    onRefuse(err, uid){
        cc.log("onRefuse", arguments)
        var result = new Result(eProc.refuse, err)
        Socket.onMsg(result);
    }
    onExit(uid, type, delay){
        cc.log("onExit", arguments)
        var result = new Result(eProc.exit, "")
        result.data["delay"] = delay;
        result.data["type"] = type;
        Socket.onMsg(result);
    }
    onSuccess(err, uid, isNeedBoard, base, param){
        cc.log("onSuccess", arguments)
        var result = new Result(eProc.succ, err)
        result.data["needBoard"] = isNeedBoard || 0;
        result.data["base"] = JSON.parse(base);
        result.data["param"] = JSON.parse(param);
        Socket.onMsg(result);
    }

}
RegisterScript("Account", Account);
// Kbe.initAccount(new )Account()