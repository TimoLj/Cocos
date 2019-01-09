import { UserMgr } from "../../../manager/UserMgr";
import { Socket } from "../../../framework/socket";
import { eProc, eNotifyEvent } from "../../../manager/DefMgr";
import { Notify } from "../../../framework/notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class itemReceive extends cc.Component {

    @property(cc.Label)
    lblMsg: cc.Label = null;

    private mData: Object = null;

    init(dataObj: Object) {
        //cc.log("dataObj", dataObj);
        this.mData = dataObj;
        var str = "收到来自" + dataObj["nick"] + "赠送的(" + dataObj["id"] + ")型号的碎片";
        this.lblMsg.string = str;
    }

    onClickReceive() {

        Notify.emit(eNotifyEvent.OprateChip, this.mData, this.node, 1);
        var uuid = this.mData["uuid"];
        var req = Socket.result(eProc.drawchip);
        req.data["uuid"] = uuid;
        Socket.send(req);
    }


    onClickDelete() {
        Notify.emit(eNotifyEvent.OprateChip, this.mData, this.node, 0);
        var req = Socket.result(eProc.delchip);
        req.data["uuid"] = this.mData["uuid"];
        Socket.send(req);
    }

}
