import { ConfigMgr } from "./Frame/ConfigMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    nodCnvasScene: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node)

        ConfigMgr.init(`config`, ()=>{

        })

    }

    start () {

    }

    // update (dt) {}
}
