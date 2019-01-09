import { Socket } from "../../../framework/socket";
import { eProc, eNotifyEvent, eLayer } from "../../../manager/DefMgr";
import { UserMgr } from "../../../manager/UserMgr";
import UIMgr from "../../../manager/UIMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import { Notify } from "../../../framework/notify";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlChip extends cc.Component {

    @property(cc.Node)
    nodCollection: cc.Node = null;

    @property(cc.Sprite)
    sprCG: cc.Sprite = null;

    @property(cc.Button)
    btnCompound: cc.Button = null;//合成按钮
    @property(cc.Button)
    btnReceived: cc.Button = null;//打开接收列表的按钮
    @property(cc.Button)
    btnChipBag: cc.Button = null;//打开碎片袋的按钮
    @property(cc.Node)
    pnlCipBag: cc.Node = null;//碎片袋界面
    @property(cc.Button)
    btnChipBagBack: cc.Button = null;//碎片袋返回界面
    @property(cc.Node)
    nodChips: cc.Node = null;//碎片袋里所有碎片的父节点
    @property(cc.Node)
    nodReceiveTip: cc.Node = null;

    collections: Object = new Object();//储存碎片的Node
    bagCollections: Object = new Object();//碎片袋里碎片Node
    tempChipID: number = -1;//选中要赠送的碎片种类
    oprateChipPram: Object = new Object();

    onLoad() {
        Socket.reg(eProc.givechip, (pram) => {
            if (pram.code != 0) {
                UIMgr.Instance().alert("", pram.msg, "返回");
            }
            else {
                UserMgr.DeletChip(this.tempChipID);
                if (UserMgr.ReadChipNum(this.tempChipID) == 0) {
                    this.bagCollections[this.tempChipID].active = false;
                }
                //CommonMgr.alert("", "赠送成功，等待对方领取", "确定");
                UIMgr.Instance().toast("赠送成功，等待对方领取", 2);
            }
        }, this);
        Socket.reg(eProc.drawchip, (pram) => {
            if (pram.code != 0) {
                UIMgr.Instance().alert("", pram.msg, "返回");
                return;
            }
            //cc.log(this.oprateChipPram, "draw chip");
            UserMgr.getUser().base.chipDraw = CommonMgr.currentTime();
            delete UserMgr.getUser().base.receivedChip[this.oprateChipPram["data"]["uuid"]];//删除已领取的
            var type = this.oprateChipPram["data"]["id"];
            //cc.log("领取", type);
            UserMgr.AddChip(type);
            this.oprateChipPram["node"].destroy();
            this.updateChipView();
        }, this);
        Socket.reg(eProc.delchip, (pram) => {
            if (pram.code != 0) {
                UIMgr.Instance().alert("", pram.msg, "返回");
                return;
            }
            //cc.log(this.oprateChipPram, "del chip");
            delete UserMgr.getUser().base.receivedChip[this.oprateChipPram["data"]["uuid"]];//删除已领取的
            this.oprateChipPram["node"].destroy();
        }, this);

        Notify.on(eNotifyEvent.ReceiveChip, this.onReceiveChip, this);
        Notify.on(eNotifyEvent.OprateChip, this.onOprateChip, this);
    }

    start() {
        this.btnCompound.node.active = false;
        this.sprCG.node.active = false;
        this.pnlCipBag.active = false;
        this.nodReceiveTip.active = false;

        this.btnCompound.node.on("click", () => {
            var req = Socket.result(eProc.compose);
            Socket.send(req);
            UserMgr.getUser().base["chipAtlas"] = 1;
            this.btnChipBag.node.active = true;
            this.btnCompound.node.active = false;
            this.sprCG.node.active = true;
            for (let key in UserMgr.getUser().base.chip) {
                UserMgr.getUser().base.chip[key] = UserMgr.getUser().base.chip[key] - 1;
            }
        }, this);
        this.btnReceived.node.on("click", () => {
            UIMgr.Instance().pnlList("我收到的碎片", UserMgr.getUser().base.receivedChip,
                "prefab/ui/Chip/itemReceive", this.node, eNotifyEvent.ReceiveChip, () => { this.updateChipView(); });
        }, this);
        this.btnChipBagBack.node.on("click", () => {
            this.pnlCipBag.active = false;
        }, this);
        this.btnChipBag.node.on("click", this.onClickChipBag, this);

        for (let i = 1; i <= 7; i++) {
            this.collections[i] = this.nodCollection.getChildByName(i.toString());
            this.collections[i].on("click", () => { this.onClickChip(i) }, this);
            this.bagCollections[i] = this.nodChips.getChildByName(i.toString());
            this.bagCollections[i].on("click", () => { this.onClickChip(i) }, this);
            this.collections[i].active = false;
        }

        //找到节点后设置节点是否显示
        this.updateChipView();
    }

    onDestroy() {
        Socket.unreg(eProc.givechip);
        Socket.unreg(eProc.drawchip);
        Socket.unreg(eProc.delchip);
        Notify.off(eNotifyEvent.ReceiveChip, this.onReceiveChip);
        Notify.off(eNotifyEvent.OprateChip, this.onOprateChip);
    }

    updateChipView() {
        //cc.log(UserMgr.getUser(), "refreshView", this);
        UserMgr.getUser().base.chip = UserMgr.getUser().base.chip || new Object();
        UserMgr.getUser().base.receivedChip = UserMgr.getUser().base.receivedChip || new Object();
        for (let key in UserMgr.getUser().base.chip) {
            if (UserMgr.getUser().base.chip[key] >= 1) {
                this.collections[key].active = true;
            }
        }
        if (UserMgr.getUser().base.chipAtlas) {
            this.btnChipBag.node.active = true;
            this.btnCompound.node.active = false;
            this.sprCG.node.active = true;
        }
        else {
            this.btnChipBag.node.active = false;//隐藏碎片袋
        }
        if (Object.keys(UserMgr.getUser().base.chip).length == 7) {
            this.btnCompound.node.active = true;//显示合成按钮
        }
        if (Object.keys(UserMgr.getUser().base.receivedChip).length > 0) {
            this.btnReceived.node.active = true;//显示收到的按钮
        }
        else {
            this.btnReceived.node.active = false;
        }
    }

    onClickChip(solt) {
        CommonMgr.loadRes("prefab/ui/Chip/itemChipNum", cc.Prefab, (err, pfb) => {
            cc.log("itemChipNum load");
            var ins = cc.instantiate(pfb);
            this.node.addChild(ins, eLayer.LAYER_NOTICE);
            var num = UserMgr.ReadChipNum(solt);
            var boolValue = true;
            if (num > 1) {
                var str = "你有(" + solt + ")型号的碎片多余" + (num - 1) + "个，可以赠送给他人";
                if (UserMgr.getUser().base["chipAtlas"]) {
                    var str = "你有(" + solt + ")型号的碎片共" + num + "个，可以赠送给他人";
                }
            }
            else if (num == 1) {
                var str = "你有(" + solt + ")型号的碎片共1个，不可以赠送";
                boolValue = false;
                if (UserMgr.getUser().base["chipAtlas"]) {
                    var str = "你有(" + solt + ")型号的碎片共1个，可以赠送";
                    boolValue = true;
                }
            }
            ins.getComponent("pnlAlertSelect").init("", str, "赠送", "返回", () => {
                UIMgr.Instance().itemInput("对方UID", (content) => {
                    this.tempChipID = solt;
                    var req = Socket.result(eProc.givechip);
                    req["data"]["id"] = solt;
                    req["data"]["uid"] = content;
                    Socket.send(req);
                }, "赠送碎片", "", () => { }, "赠送", "取消");
            }, () => { }, boolValue);
        });
    }

    onClickChipBag() {
        this.pnlCipBag.active = true;
        for (let key in UserMgr.getUser().base.chip) {
            if (UserMgr.getUser().base.chip[key] >= 1) {
                this.bagCollections[key].active = true;
            }
            else {
                this.bagCollections[key].active = false;

            }
        }
    }
    //----监听事件-----分隔符
    onReceiveChip(p) {
        cc.log("Receive???", this);
        this.btnReceived.node.active = true;
        this.nodReceiveTip.active = true;
        setTimeout(() => {
            this.nodReceiveTip.active = false;
        }, 2000);
    }

    onClickBack() {
        //UIMgr.Instance().ShowUI(UIMgr.pnlAchieve);
        this.node.destroy();
    }

    onOprateChip(pram) {
        //cc.log("onOprateChip", pram);
        this.oprateChipPram["data"] = pram[0];
        this.oprateChipPram["node"] = pram[1];
        this.oprateChipPram["draw"] = pram[2];
    }
}
