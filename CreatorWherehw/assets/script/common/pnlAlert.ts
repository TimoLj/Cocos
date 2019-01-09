
const {ccclass, property} = cc._decorator;

@ccclass
export default class pnlAlert extends cc.Component {

    @property(cc.Label)
    lblTitle:cc.Label=null;

    @property(cc.Label)
    lblMsg:cc.Label=null;


    @property(cc.Label)
    lblBtnText:cc.Label=null;

    mDelegate;

    public init(title: string, msg: string, btnText: string,  delegateAssign,delay?) {
        this.mDelegate=delegateAssign;
        this.lblTitle.string=title;
        this.lblMsg.string=msg;
        this.lblBtnText.string=btnText;
        if(delay!=undefined)
        {
            cc.error("pnlAler delay error");
        }
    }




    public onClickBtn() {
        this.mDelegate && this.mDelegate();
        this.node.destroy();
    }
}
