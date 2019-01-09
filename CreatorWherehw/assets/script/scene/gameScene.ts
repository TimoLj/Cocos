import { CommonMgr } from "../manager/CommonMgr";
import { Socket } from "../framework/socket";
import { eProc, eNotifyEvent } from "../manager/DefMgr";
import { Notify } from "../framework/notify";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.loader.loadRes("prefab/map/itemMapDay");
        cc.loader.loadRes("prefab/map/itemMapNight");
        cc.loader.loadRes("audio/bgm_jyc")
        cc.loader.loadRes("prefab/map/itemView_day");
        cc.loader.loadRes("prefab/map/itemView_night");
        cc.loader.loadRes("prefab/animation/walkGirl_1");
        cc.loader.loadRes("prefab/animation/walkGirl_2");
        cc.loader.loadRes("prefab/animation/walkBoy");
        cc.loader.loadRes("prefab/animation/fire_blue");
        cc.loader.loadRes("prefab/animation/fire_red");

    }

    start () {
        cc.find("back", this.node).on("touchend", (event)=>{
            let a = cc.find("itemCreate", this.node);
            if(a) a.destroy();

            let b = cc.find("itemJoin", this.node)
            if(b) b.destroy();
        })

        // CommonMgr.loadRes("prefab/ui/message/pnlCreateMessage", cc.Prefab, (err, res)=>{
        //     let a = cc.instantiate(res);
        //     this.node.addChild(a);
        // })

        cc.loader.loadRes("audio/bgm_jyc", cc.AudioClip, (err, res)=>{
            cc.audioEngine.playMusic(res, true)
        })

        Notify.on(eNotifyEvent.SoundEffect, this._soundEffect, this);
    }

    // update (dt) {}

    onDestroy() {
        Notify.off(eNotifyEvent.SoundEffect, this._soundEffect)
    }

    onClick(event) {
        let self = this;
        switch(event.target.name){
            case "button_start":
            case "day":
                CommonMgr.loadRes(`prefab/map/itemMapDay`, cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemMap").init("day");
                    self.node.addChild(a);
                })
                CommonMgr.loadRes(`prefab/map/itemView_day`, cc.Prefab, (err, res)=>{
                    let a = cc.instantiate(res);
                    self.node.addChild(a);
                })
                break;

            case "night":
                CommonMgr.loadRes(`prefab/map/itemMapNight`, cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemMap").init("night");
                    self.node.addChild(a);
                })
                break;
            case "create":
                CommonMgr.loadRes("prefab/ui/itemCreate", cc.Prefab, (err,res)=>{
                    let a = cc.instantiate(res);
                    self.node.addChild(a);
                    a.y = -400;

                })
                break;
            case "join":
                CommonMgr.loadRes("prefab/ui/itemJoin", cc.Prefab, (err, res)=>{
                    let a = cc.instantiate(res);
                    self.node.addChild(a);
                    a.y = -400;
                })
                let result = Socket.result(eProc.ready);
                Socket.send(result);
                break;
        } 
    }

    private _soundEffect(param) {
        cc.loader.loadRes(param[0], cc.AudioClip, (err, res)=>{
            cc.audioEngine.playEffect(res, false);
        })
    }

}
