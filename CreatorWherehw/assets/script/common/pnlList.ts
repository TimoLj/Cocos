import { CommonMgr } from "../manager/CommonMgr";
import { Notify } from "../framework/notify";
import { eNotifyEvent } from "../manager/DefMgr";
const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlList extends cc.Component {

    @property(cc.Label)
    lblTitle: cc.Label = null;

    @property(cc.Node)
    nodContent: cc.Node = null;

    addItemFun: any = null;
    mHandlerBack: any = null;
    meNotifyType: eNotifyEvent;
    mPfbPath: string;

    init(titleStr: string, dataList: Object, itemPfbPath: string, type?: eNotifyEvent, handlerBack?: any) {
        //cc.log(dataList);
        this.lblTitle.string = titleStr;
        this.mHandlerBack = handlerBack;
        this.meNotifyType = type;
        this.mPfbPath = itemPfbPath;
        if (type) {
            //this.mRegObj[0]();//注册函数
            Notify.on(type, this.handler, this);//监听消息
        }
        CommonMgr.loadRes(itemPfbPath, cc.Prefab, (err, pfb) => {
            for (let key in dataList) {
                var ins = cc.instantiate(pfb);
                this.nodContent.addChild(ins);
                ins.getComponent(ins.name).init(dataList[key]);
            }
        });
    }

    handler(pram) {
       
        CommonMgr.loadRes(this.mPfbPath, cc.Prefab, (err, pfb) => {
            var ins = cc.instantiate(pfb);
            this.nodContent.addChild(ins);
            ins.getComponent(ins.name).init(pram[0].data);
        });
    }

    btnCancle() {
        //cc.log("handler", this.mHandlerBack);
        if (this.mHandlerBack) {
            this.mHandlerBack();
        }
        this.node.destroy();
    }

    onDestroy() {
        if (this.meNotifyType) {
            Notify.off(this.meNotifyType, this.handler);
        }

    }
}
