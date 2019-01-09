import { eLayer, eNotifyEvent, eProc } from "../../../manager/DefMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import { Notify } from "../../../framework/notify";
import { UserMgr } from "../../../manager/UserMgr";
import { Socket } from "../../../framework/socket";
import UIMgr from "../../../manager/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlInvition extends cc.Component {

    @property(cc.Node)
    nodContain: cc.Node = null;

    private reponsePram = null;
    private itemList: Object = new Object();

    onLoad() {
        Notify.on(eNotifyEvent.Response, this.onResponse, this);
        Notify.on(eNotifyEvent.BeInvited, this.onBeInvited, this);
        Socket.reg(eProc.response, (pram) => {
            // UIMgr.Instance().DestroyUI(UIMgr.pnlWaiting);
            cc.log(pram, "response");
            
            UserMgr.StateObj = pram.data;
            if (pram.code != 0) {
                //绑定失败，删除条目
                UIMgr.Instance().alert("", pram.msg, "确定", () => {
                    this.removeItem(this.reponsePram[1]["uid"]);
                });
            }
            //同意
            if (this.reponsePram[0] == 1) {
                UserMgr.StateObj["isOppoOnline"] = pram["data"]["isOppoOnline"];
                cc.log(UserMgr.StateObj["isOppoOnline"])
                this.removeAllItem();
            }
            //拒绝
            else if (this.reponsePram[0] == 0) {
                UserMgr.StateObj["isOppoOnline"] = 0;
                this.removeItem(this.reponsePram[1].uid);
            }
            Notify.emit(eNotifyEvent.DealResponse, this.reponsePram[0], this.reponsePram[1]);

        }, this);//不能在item上注册此消息，因为item有很多个
    }

    onBeInvited(pram) {
        var invition = new Object();
        invition["uid"] = pram[0].data.uid;
        invition["nick"] = pram[0].data.nick;
        CommonMgr.loadRes("prefab/ui/Invition/itemInvition", cc.Prefab, (err, prefab) => {
            var itemInvition: cc.Node = cc.instantiate(prefab);
            this.addItem(pram[0].data.uid, itemInvition);
            itemInvition.getComponent("itemInvition").init(invition);
            this.nodContain.addChild(itemInvition, eLayer.LAYER_NOTICE);
        });
    }

    start() {
        let invites = UserMgr.getUser().invite;
        CommonMgr.loadRes("prefab/ui/Invition/itemInvition", cc.Prefab, (err, prefab) => {
            for (let key in invites) {
                let value = invites[key],
                itemInvition = cc.instantiate(prefab);
                this.addItem(key, itemInvition);
                itemInvition.getComponent("itemInvition").init(value);
                this.nodContain.addChild(itemInvition, eLayer.LAYER_NOTICE);
            }
        });
    }

    onResponse(pram) {
        this.reponsePram = pram;
        cc.log("not ", pram);
    }

    onDestroy() {
        Notify.off(eNotifyEvent.BeInvited, this.onBeInvited);
        Notify.off(eNotifyEvent.Response, this.onResponse);
        Socket.unreg(eProc.response);
    }

    onClickBack() {
        this.node.destroy();
    }

    //对视图view的操作
    private addItem(uid, viewNod) {
        this.itemList[uid] = viewNod;
    }

    private removeItem(uid) {
        this.itemList[uid].destroy();
        delete this.itemList[uid];
        delete UserMgr.getUser().invite[uid];
        if (Object.keys(this.itemList).length <= 0) {
            this.node.destroy()
        }
    }

    private removeAllItem() {
        for (let key in this.itemList) {
            this.removeItem(key);
        }
    }
}