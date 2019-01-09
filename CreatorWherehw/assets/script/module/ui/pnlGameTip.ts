const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlGameTip extends cc.Component {

    mAni: cc.Animation;

    public onLoad() {
        this.mAni = this.getComponent(cc.Animation);
        var aniState = this.mAni.play();
        aniState.wrapMode = cc.WrapMode.Default;
        aniState.speed = 1.5;
    }

    public onClickCancle() {
        var aniState2 = this.mAni.play();
        aniState2.wrapMode = cc.WrapMode.Reverse;
        aniState2.speed = 1.5;
        let self = this;
        setTimeout(() => {
            self.node.destroy();
        }, aniState2.duration * 1000);

    }
}
