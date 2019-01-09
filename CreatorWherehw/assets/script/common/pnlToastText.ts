import UIMgr from "../manager/UIMgr";
import { CommonMgr } from "../manager/CommonMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlToastText extends cc.Component {
    @property(cc.RichText)
    lblText: cc.RichText = null;

    @property(cc.Node)
    nodBg: cc.Node = null;

    @property(cc.Sprite)
    sprIcon: cc.Sprite = null;

    lingLimt: number = 10;//一行最多十个，超过十个就换行

    mText: string;
    mIconPath: null;

    init(msg, iconPath?) {
        this.mText = msg;
        this.mIconPath = iconPath;
    }

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.lblText.string = this.mText;
        if (this.mIconPath) {
            this.lblText.node.x = this.lblText.node.x - 56;
            CommonMgr.loadRes(this.mIconPath, cc.SpriteFrame, (err, sprFrame) => {
                this.sprIcon.spriteFrame = sprFrame;
            })
        }
    }
}