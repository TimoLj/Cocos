import { CommonMgr } from "../../manager/CommonMgr";
import { Notify } from "../../framework/notify";
import { eNotifyEvent, eProc, eLayer, eGameState } from "../../manager/DefMgr";
import { Socket } from "../../framework/socket";
import { GameSet, mapRound } from "./mapDef";
import UIMgr from "../../manager/UIMgr";
import { UserMgr } from "../../manager/UserMgr";
import { GameMgr } from "../../manager/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlGameInter extends cc.Component {
    @property(cc.Node)
    nodCont: cc.Node = null;
    @property(cc.Button)
    btn1: cc.Button = null;
    @property(cc.Node)
    nodMask2: cc.Node = null;
    @property(cc.Label)
    lblName: cc.Label = null;
    @property(cc.Node)
    nodHeartLeft_bottom = null
    @property(cc.Node)
    nodHeartRight_bottom = null
    @property(cc.Node)
    nodHeartLeft: cc.Node = null;
    @property(cc.Node)
    nodHeartRight: cc.Node = null;
    @property(cc.Label)
    lblDis: cc.Label = null;
    @property(cc.Node)
    nodLine: cc.Node = null;
    @property(cc.Node)
    nodLifeContHave: cc.Node = null;
    @property(cc.Node)
    nodButton1: cc.Node = null;
    @property(cc.Node)
    nodButton2: cc.Node = null;

    private mPattern: boolean = null;
    private timeLine: number = 0;

    private isSpeedUpLeft: boolean = false;
    private isSpeedUpRight: boolean = false;

    init(pattern: boolean, isNew: boolean, info) {
        this.mPattern = pattern;
        let self = this;
        let num: number = UserMgr.CurrentLeavel();
        if (pattern) {
            CommonMgr.loadRes("prefab/map/itemDayBg", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                self.nodCont.addChild(a);
            })  // 添加地图底层
            CommonMgr.loadRes(mapRound[num].day, cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemMap").init(true, isNew, info);
                self.nodCont.addChild(a);
            })
            CommonMgr.loadRes("prefab/map/itemView_day", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                self.nodCont.addChild(a, 20);
            })
            for(let k in this.nodLifeContHave.children){
                let v = this.nodLifeContHave.children[k];
                CommonMgr.changeSprite(v.getComponent(cc.Sprite), "picture/role/img_life_girl");
            }
        } else {
            CommonMgr.loadRes("prefab/map/itemNightBg", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                self.nodCont.addChild(a);
            })
            CommonMgr.loadRes(mapRound[num].night, cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemMap").init(false, isNew, info);
                self.nodCont.addChild(a);
            })
            CommonMgr.loadRes("prefab/map/itemView_night", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                self.nodCont.addChild(a, 20);
            })
            for(let k in this.nodLifeContHave.children){
                let v = this.nodLifeContHave.children[k];
                CommonMgr.changeSprite(v.getComponent(cc.Sprite), "picture/role/img_life_boy");
            }
        }
    }

    onLoad() {
        cc.loader.loadRes("audio/bgm_night", cc.AudioClip, (err, res) => {
            cc.audioEngine.playMusic(res, true);
            if (!GameSet.showMusicState()) GameSet.pauseMusic();
        })

        if (!this.mPattern) {
            this.lblName.string = "夜视仪";
        } else {
            this.nodLine.active = false;
            this.nodMask2.active = false;
        }
        GameMgr.changeGameState(eGameState.Gaming);
        GameSet.gameStart();
    }

    start() {
        this.node.zIndex = eLayer.LAYER_NORMAL;
        cc.find("nodMask1", this.node).zIndex = 10;
        this.nodHeartLeft.zIndex = 10
        this.nodHeartRight.zIndex = 10
        this.nodHeartLeft_bottom.zIndex = 10
        this.nodHeartRight_bottom.zIndex = 10

        Socket.reg(eProc.giveup, this._giveUp, this);
        Socket.reg(eProc.exit, this._exit, this);
        Socket.reg(eProc.refuse, this._refuse, this);
        Notify.on(eNotifyEvent.heartLeft, this._heartLeft, this);
        Notify.on(eNotifyEvent.heartRight, this._heartRight, this);


        this._heartBounce(this.nodHeartLeft, 1);
        this._heartBounce(this.nodHeartRight, 1);
        // this._maskBounce();

        this.nodButton2.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{
            Notify.emit(eNotifyEvent.Active, 1);
            cc.find("nodMask2", this.node).active = true;
        })
        this.nodButton2.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            cc.find("nodMask2", this.node).active = false;
            if(this.mPattern) this.nodButton2.active = false;
            setTimeout(() => { Notify.emit(eNotifyEvent.Active, 0) });
        })

        if(this.mPattern) this.nodButton2.active = false;
    }

    update(dt) {
        this.timeLine += dt;
    }

    onDestroy() {
        Socket.unreg(eProc.giveup);
        Socket.unreg(eProc.exit);
        Socket.unreg(eProc.refuse);
        Notify.off(eNotifyEvent.heartLeft, this._heartLeft);
        Notify.off(eNotifyEvent.heartRight, this._heartRight);
    }

    onClick(event) {
        switch (event.target.name) {
            case "set":
                UIMgr.Instance().showHMI("prefab/ui/itemSet")
                break;
            case "nodButton1":    // 标记
                this.btn1.interactable = false;
                this.nodButton1.active = true;
                setTimeout(()=>{ this.nodButton1.active = false;}, 100)
                setTimeout(() => {
                    this.btn1.interactable = true;
                }, 310);
                if (cc.find("itemSignGood", this.node) || cc.find("itemSignBad", this.node)) {
                    cc.find("itemSignGood", this.node).runAction(cc.moveBy(0.3, 120, -110));
                    cc.find("itemSignBad", this.node).runAction(cc.moveBy(0.3, 0, -160));
                    setTimeout(() => {
                        cc.find("itemSignGood", this.node).destroy();
                        cc.find("itemSignBad", this.node).destroy();
                    }, 310);
                    return;
                }

                CommonMgr.loadRes("prefab/map/itemSignGood", cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemSign").init(true, cc.find("nodMask1", this.node).getPosition());
                    this.node.addChild(a);
                })
                CommonMgr.loadRes("prefab/map/itemSignBad", cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemSign").init(false, cc.find("nodMask1", this.node).getPosition());
                    this.node.addChild(a);
                })
                break;

            case "closeSocket":
                Socket.close();
                break;

            case "succ":
                let result = Socket.result(eProc.succ);
                Socket.send(result);
                break;
        }
    }

    private _giveUp(param) {
        if (param["code"] != 0) return;
        CommonMgr.loadRes("prefab/ui/map/itemIsGiveUp", cc.Prefab, (err, res) => {
            let a: cc.Node = cc.instantiate(res);
            this.node.addChild(a);
        })
    }

    private _exit(param) {
        cc.log(param)
        if (param["code"] != 0) return;
        GameSet.gameOut();
        let data = param["data"];
        if (data["isDie"]) {
            CommonMgr.loadRes("prefab/ui/map/itemInfoDie", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                if(data["sender"] == UserMgr.getUser().uid){
                    a.getComponent("itemOut").init("你已达到死亡上限，游戏结束！");
                }
                this.node.addChild(a);
            })
            return;
        }
        if (data["type"]==1) {
            let a = cc.find("Canvas/itemGameState")
            if(a) a.destroy()
            CommonMgr.loadRes("prefab/ui/map/itemGameState", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemGameState").init("投票成功,游戏结束", undefined);
                cc.find("Canvas/pnlGameInter/set").getComponent(cc.Button).interactable = false;
                this.node.addChild(a);
            })
        } 
        else if(data["type"] == 2){ 
            if(!cc.isValid(this.node)) return;
            CommonMgr.loadRes("prefab/ui/map/itemOut", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                this.node.addChild(a);
                setTimeout(() => {
                    if(cc.isValid(this.node)) this.node.destroy()
                }, data["delay"] * 1000);
            })
        }
    }

    private _refuse(param) {
        if (param["code"] != 0) return;
        cc.find("Canvas/itemGameState").destroy();
        CommonMgr.loadRes("prefab/ui/map/itemGameState", cc.Prefab, (err, res) => {
            let a = cc.instantiate(res);
            a.getComponent("itemGameState").init("对方选择继续战斗", true, 2);
            cc.find("Canvas").addChild(a);
        })
    }

    // private _playAni(actor: cc.Node, speed: number = 1) {
    //     let ani1 = cc.moveBy(0.7, 0, 3);
    //     let ani2 = cc.moveBy(0.8, 0, -3);
    //     let ani3 = cc.scaleTo(0.7, 1.2, 1.2);
    //     let ani4 = cc.scaleTo(0.8, 1, 1);
    //     let aniStep1 = cc.spawn(ani1, ani3);
    //     let aniStep2 = cc.spawn(ani2, ani4);
    //     let ani = cc.repeatForever(cc.sequence(aniStep1, aniStep2));
    //     if (!cc.isValid(actor)) return;
    //     actor.y = 600;
    //     actor.scale = 1;
    //     actor.stopAllActions();
    //     actor.runAction(cc.speed(ani, speed));
    // }

    private _heartBounce(actor: cc.Node, speed: number = 1) {
        let ani1 = cc.fadeIn(0.5);
        let ani2 = cc.fadeOut(0.5);
        if(!cc.isValid(actor)) return;
        actor.runAction(cc.show());
        actor.stopAllActions();
        actor.runAction(cc.repeatForever(cc.sequence(ani1, ani2)));
    }

    // private _maskBounce(speed: number = 1) {
    //     // let ani = cc.easeInOut()
    //     let ani1 = cc.moveBy(1, this.nodBounce.width, 0).easing(cc.easeQuadraticActionInOut());
    //     let ani2 = cc.moveBy(1, -this.nodBounce.width, 0).easing(cc.easeQuadraticActionInOut());
    //     let ani3 = cc.moveBy(1, this.nodBounce.width, 0).easing(cc.easeQuadraticActionInOut());
    //     let ani4 = cc.moveBy(1, -this.nodBounce.width, 0).easing(cc.easeQuadraticActionInOut());
    //     this.nodMaskBounce.runAction(cc.repeatForever(cc.sequence(ani1, ani2)));
    //     this.nodBounce.runAction(cc.repeatForever(cc.sequence(ani4, ani3)));
    // }

    private _heartLeft(param) {
        if (!this.isSpeedUpLeft) {
            this._heartBounce(this.nodHeartLeft, 1.5);
            this.isSpeedUpLeft = true;
            setTimeout(() => {
                this.isSpeedUpLeft = false;
                this._heartBounce(this.nodHeartLeft, 1);
            }, 3000)
        }
        if (param[0]){
            // this.lblDis.string = param[0];
            this.numberChangeLow(Number(this.lblDis.string), param[0], 600, 10, this.lblDis)
        } 
        if(param[1]) return;
        CommonMgr.loadRes("prefab/map/maskBounce", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemBound").init(this.nodHeartLeft.getPosition(), this.nodHeartRight.getPosition());
            this.node.addChild(a);
        })
    }

    private _heartRight(param) {
        if (!this.isSpeedUpRight) {
            this._heartBounce(this.nodHeartRight, 1.5);
            this.isSpeedUpRight = true;
            setTimeout(() => {
                this.isSpeedUpRight = false;
                this._heartBounce(this.nodHeartRight, 1);
            }, 3000);
        }
        if (param[0]) {
            this.numberChangeLow(Number(this.lblDis.string), param[0], 600, 5, this.lblDis)
        }
        if(param[1]) return;
        CommonMgr.loadRes("prefab/map/maskBounce", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemBound").init(this.nodHeartRight.getPosition(), this.nodHeartLeft.getPosition(), false);
            this.node.addChild(a);
        })
    }

    private numberChangeLow(startNum: number, endNum: number, time: number, count: number, label: cc.Label) {
        for(let i = 0; i < count; i++){
            if(i == count-1){
                setTimeout(()=>{
                    label.string = endNum.toString();
                }, time)
            }
            setTimeout(()=>{
                label.string = Math.floor(startNum + (endNum-startNum)/count * i).toString();
            }, time/count*(i+1))
        }
    }


}
