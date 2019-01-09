import { GameSet } from "../../map/mapDef";
import { UserMgr } from "../../../manager/UserMgr";
import UIMgr from "../../../manager/UIMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemOut extends cc.Component {

    @property(cc.Label)
    lblCont: cc.Label = null;

    init(cont: string) {
        if(cont){
            this.lblCont.string = cont;
        }
    }

    // onLoad () {}

    // start () {}

    // update (dt) {}

    onClick(event) {
        this.node.destroy();
        setTimeout(()=>{
            let a = cc.find("Canvas/pnlGameInter");
            if(a) a.destroy();
            GameSet.changeMusic("audio/bgm_jyc");
            UserMgr.OnExitGame();
        }, 100)        
    }
}
