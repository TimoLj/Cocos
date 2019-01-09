import { CommonMgr } from "../../manager/CommonMgr";
const {ccclass, property} = cc._decorator;

@ccclass
export default class itemGodMachine extends cc.Component {
    private url: string;

    init(url){
        cc.log(url)
        this.url = url;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        CommonMgr.changeSprite(this.node.getComponent(cc.Sprite), this.url);

    }

    // update (dt) {}
}
