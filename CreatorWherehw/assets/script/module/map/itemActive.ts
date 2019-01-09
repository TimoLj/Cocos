import { CommonMgr } from "../../manager/CommonMgr";
const {ccclass, property} = cc._decorator;

@ccclass
export default class itemActive extends cc.Component {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    private url: string;

    init(url){
        this.url = url;
    }

    start () {
        CommonMgr.changeSprite(this.spr, this.url);
    }
}
