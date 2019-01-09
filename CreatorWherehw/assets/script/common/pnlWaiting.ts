import UIMgr from "../manager/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlWaiting extends cc.Component {

    @property(cc.Label)
    lblMsg: cc.Label = null;

    @property(cc.Sprite)
    sprWait: cc.Sprite = null;


    start() {
        let self = this;
        setTimeout(() => {
            if (this.node) {
                UIMgr.Instance().alert("", "加载失败", "确定");
                self.node.destroy();
            }
        }, 3000);
    }


}
