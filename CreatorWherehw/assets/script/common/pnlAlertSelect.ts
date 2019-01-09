
const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlAlertSelect extends cc.Component {


    @property(cc.Label)
    lblTitle: cc.Label = null;

    @property(cc.Label)
    lblMsg: cc.Label = null;

    @property(cc.Label)
    lblCancleText: cc.Label = null;

    @property(cc.Label)
    lblAssignText: cc.Label = null;

    @property(cc.Button)
    btnAssign: cc.Button = null;

    @property(cc.Node)
    nodMain: cc.Node = null;

    mDelegateAssign;
    mDelegateCancle;
    actDuration: number = 0.2;

    public init(title: string, msg: string, btnAssignText: string, btnCancleTxt: string, delegateAssign, delegateCancle, enableAssign?: boolean) {
        this.mDelegateAssign = delegateAssign;
        this.mDelegateCancle = delegateCancle;
        this.lblTitle.string = title;
        this.lblMsg.string = msg;
        this.lblAssignText.string = btnAssignText;
        this.lblCancleText.string = btnCancleTxt;
        if (enableAssign == false) {
            this.btnAssign.interactable = false;
        }
    }


    onLoad() {
        //var nodMain = this.node.getChildByName("nodMain");
        this.nodMain.opacity = 0;
        this.nodMain.scaleY = 0;
        var a1 = cc.fadeIn(this.actDuration);
        var a2 = cc.scaleTo(this.actDuration, 1);
        this.nodMain.runAction(cc.spawn(a1, a2));

    }

    public onClickCancle() {
        var a1 = cc.fadeOut(this.actDuration);
        var a2 = cc.scaleTo(this.actDuration, 1, 0);
        var a3 = cc.callFunc(() => {
            this.mDelegateCancle();
            this.node.destroy();
        });
        this.nodMain.runAction(cc.sequence(cc.spawn(a1, a2), a3));
    }

    public onClickAssign() {


        var a1 = cc.fadeOut(this.actDuration);
        var a2 = cc.scaleTo(this.actDuration, 1, 0);
        var a3 = cc.callFunc(() => {
            this.mDelegateAssign();
            this.node.destroy();
        });
        this.node.runAction(cc.sequence(cc.spawn(a1, a2), a3));
    }

}
