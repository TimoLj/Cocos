

const { ccclass, property } = cc._decorator;

@ccclass
export default class itemInput extends cc.Component {

    @property(cc.Label)
    lblTitle: cc.Label = null;

    @property(cc.Label)
    lblMsg: cc.Label = null;

    @property(cc.EditBox)
    edbContent: cc.EditBox = null;


    @property(cc.Label)
    lblAssign: cc.Label = null;

    @property(cc.Label)
    lblCancle: cc.Label = null;

    @property(cc.Sprite)
    sprBG: cc.Sprite = null;

    assignHandler: any = null;
    cancleHandler: any = null;


    init(MsgStr: string, handlerAssign: any, titleStr?: string, bgPath?: string, handlerCancle?: any, AssignStr?: string, CancleStr?: string) {
        this.lblMsg.string = MsgStr;
        this.lblTitle.string = titleStr;
        this.lblAssign.string = AssignStr;
        this.lblCancle.string = CancleStr;
        this.assignHandler = handlerAssign;
        if (handlerCancle) {
            this.cancleHandler = handlerCancle;
        }
    }

    onClickAssign() {
        if (this.assignHandler) {
            this.assignHandler(this.edbContent.string);
        }
        this.node.destroy();
    }

    onClickCancle() {
        if (this.cancleHandler) {
            this.cancleHandler();
        }
        this.node.destroy();
    }
}
