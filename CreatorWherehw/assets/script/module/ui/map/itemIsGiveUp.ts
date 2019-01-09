import { Socket } from "../../../framework/socket";
import { eProc } from "../../../manager/DefMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import UIMgr from "../../../manager/UIMgr";
import { GameSet } from "../../map/mapDef";
import { UserMgr } from "../../../manager/UserMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemIsGiveUp extends cc.Component {

    @property(cc.ProgressBar)
    pgbTimeLine: cc.ProgressBar = null;

    private timeLine: number = 0;
    private timeMax: number = 30;

    // onLoad () {}

    start () {

    }

    update (dt) {
        this.timeLine += dt;
        this.pgbTimeLine.progress = (this.timeMax-this.timeLine)/this.timeMax;
        if(this.pgbTimeLine.progress<=0) this.node.destroy();
    }

    onClick(event) {
        let canvas = cc.find("Canvas");
        switch(event.target.name) {
            case "giveUp":
                let result2 = Socket.result(eProc.exit);
                result2.data["judge"] = true;
                Socket.send(result2); 
                CommonMgr.loadRes("prefab/ui/map/itemGameState", cc.Prefab, (err, res)=>{
                    let a = cc.instantiate(res);
                    a.getComponent("itemGameState").init("投票成功,\n游戏结束", undefined, 5);
                    GameSet.gameOut();
                    this.node.destroy();
                    cc.find("Canvas/pnlGameInter/set").getComponent(cc.Button).interactable = false;
                    canvas.addChild(a);
                    setTimeout(() => {
                        cc.find("Canvas/pnlGameInter").destroy();
                        GameSet.changeMusic("audio/bgm_jyc");
                        UserMgr.OnExitGame();
                    }, 5000);
                })
                return;
            case "refuse":
                let result1 = Socket.result(eProc.refuse);
                Socket.send(result1);
                this.node.destroy();
                UserMgr.onGetAchieve(1006);
                CommonMgr.loadRes("prefab/ui/map/itemGameState", cc.Prefab, (err, res)=>{
                    let a = cc.instantiate(res);
                    a.getComponent("itemGameState").init("你选择继续战斗", true, 2);
                    canvas.addChild(a);
                })
                break;
        } 
    }
}
