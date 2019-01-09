import { CommonMgr } from "./CommonMgr";
import { eNotifyEvent, eLayer, eGender } from "./DefMgr";

export default class UIMgr {

    private uiList: Object = new Object();
    private comUIList: Object = new Object();
    private toastList: Object = new Object();
    private tempList: Object = new Object();//存储正在显示中的toast（已经到达固定位置的toast）

    //private toastContent: cc.Node = null;
    private interactable: boolean = true;
    private canvas: cc.Node = null;
    private nodMask: cc.Node = null;

    private static instance: UIMgr = null;

    private constructor() {
        this.canvas = cc.find("Canvas");
    }

    public static Instance() {
        if (this.instance == null) {
            this.instance = new UIMgr();
        }
        return this.instance;
    }

    public showHMI(url, fun = undefined){
        CommonMgr.loadRes(url, cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            CommonMgr.addNode(a, eLayer.LAYER_NORMAL);
            if(fun){
                fun();
            }
        })
    }

    public loadMask(time?: number) {
        CommonMgr.loadRes("prefab/common/UIMask", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            this.nodMask = a;
            CommonMgr.addNode(a, eLayer.LAYER_BLOCK);
            if(!time) return;
            setTimeout(() => {
                if(cc.isValid(a)) a.destroy();
            }, time * 1000);
        })
    }

    public closeMask(){
        if(cc.isValid(this.nodMask)) this.nodMask.destroy();
    }

    //公用-----------------------分隔符---------------------------
    //公用列表弹窗
    public pnlList(titleStr: string, dataList: Object, itemPfbPath: string, mParent: cc.Node, type?: eNotifyEvent, handlerBack?: any) {

        CommonMgr.loadRes("prefab/common/pnlList", cc.Prefab, (err, pfb) => {
            var pnl = cc.instantiate(pfb);
            let cmpt = pnl.getComponent("pnlList");
            if (cmpt) {
                cmpt.init(titleStr, dataList, itemPfbPath, type, handlerBack);
            }
            mParent.addChild(pnl, eLayer.LAYER_NORMAL);
            this.comUIList[Object.keys(this.comUIList).length + 1] = pnl;

        });
    }

    //公用确认弹窗
    // public alert(title, msg, btnText, delegate?, delay?) {//delay参数存在时，则按钮置灰，并且delay秒之后还原
    //     CommonMgr.loadRes("prefab/common/pnlAlert", cc.Prefab, (err, res) => {
    //         var panel = cc.instantiate(res);
    //         panel.getComponent(panel.name).init(title, msg, btnText, delegate, delay);
    //         CommonMgr.addNode(panel, eLayer.LAYER_NOTICE);
    //     });
    // }

    public alert(title, msg, btnText, delegate?, delay?){
        CommonMgr.loadRes("prefab/common/pnlAlert", cc.Prefab, (err, res)=>{
            let panel: cc.Node = cc.instantiate(res);
            panel.getComponent(panel.name).init(title, msg, btnText, delegate, delay);
            CommonMgr.addNode(panel, eLayer.LAYER_NORMAL);
        })
    }

    // 公用 Select 弹窗
    public alertSelect(title, msg, btnAssignText, btnCancelText, delegateAssign, delegateCancel, enabelAssign?: boolean, callBack?) {
        CommonMgr.loadRes("prefab/common/pnlAlertSelect", cc.Prefab, (err, prefab) => {
            var panel = cc.instantiate(prefab);
            panel.getComponent(panel.name).init(title, msg, btnAssignText, btnCancelText, delegateAssign, delegateCancel, enabelAssign);
            //panel.
            CommonMgr.addNode(panel, eLayer.LAYER_NOTICE);
            if(callBack){
                callBack();
            }
        });
    }

    //公用输入弹窗
    public itemInput(MsgStr: string, handlerAssign: any, titleStr?: string, bgPath?: string, handlerCancle?: any, AssignStr?: string, CancleStr?: string) {
        CommonMgr.loadRes("prefab/common/itemInput", cc.Prefab, (err, pfb) => {
            var ins = cc.instantiate(pfb);
            ins.getComponent("itemInput").init(MsgStr, handlerAssign, titleStr, bgPath, handlerCancle, AssignStr, CancleStr);
            CommonMgr.addNode(ins, eLayer.LAYER_NOTICE);
            // this.setUIMaske(ins);

        })
    }

    // 公用 Toast 提示
    public toast(msg, delay?, positionY?, iconPath?, viewMod?) {
        delay = delay || 2;
        if (this.toastList.hasOwnProperty(msg)) {
            cc.log("tost已存在");//防止多次生成相同toast
            return;
        }
        CommonMgr.loadRes("prefab/common/pnlToastText", cc.Prefab, (err, prefab) => {
            var panel = cc.instantiate(prefab);
            panel.getComponent(panel.name).init(msg, iconPath);
            this.canvas.addChild(panel, eLayer.LAYER_NOTICE);
            this.toastList[msg] = panel;
            setTimeout(() => {
                delete this.toastList[msg];
            }, (delay + 0.3) * 1000);

            // 默认显示的动效
            panel.y = -800;
            var a1 = cc.moveTo(0.3, cc.v2(0, -570));
            //当toast到达固定位置时，如果固定位置已经被原来的toast占用，则把所有原来的toast向上移一格，
            var a1_1 = cc.callFunc(() => {
                for (let temK in this.tempList) {
                    this.tempList[temK].runAction(cc.moveBy(0.15, 0, 140));
                    //cc.log("上移一格", this.tempList[temK]);
                }
                this.tempList[msg] = panel;
            });
            var a1_2 = cc.moveTo(delay, cc.v2(0, -570));
            var a1_3 = cc.callFunc(() => {
                delete this.tempList[msg];
            });
            var a2 = cc.moveTo(0.3, cc.v2(0, -800));
            var a3 = cc.callFunc(() => {
                panel.destroy();
            });
            panel.runAction(cc.sequence(a1, a1_1, a1_2, a1_3, a2, a3));
        });
    }

    //显示性别图标
    public showGender(lblName: cc.Label, gender: eGender) {
        //删除原有性别
        var f = lblName.node.getChildByName("sprFemale");
        var m = lblName.node.getChildByName("sprMale");
        var o = lblName.node.getChildByName("sprOther");
        if (f) {
            f.destroy();
        }
        if (m) {
            m.destroy();
        }
        if (o) {
            o.destroy();
        }


        if (gender == eGender.Female) {
            CommonMgr.loadRes("prefab/common/sprFemale", cc.Prefab, (err, pfb) => {
                var ins = cc.instantiate(pfb);
                lblName.node.addChild(ins, eLayer.LAYER_NORMAL);
            });
        }
        else if (gender == eGender.Male) {
            CommonMgr.loadRes("prefab/common/sprMale", cc.Prefab, (err, pfb) => {
                var ins = cc.instantiate(pfb);
                lblName.node.addChild(ins, eLayer.LAYER_NORMAL);
            });
        }
        else if (gender == eGender.Other) {
            CommonMgr.loadRes("prefab/common/sprOther", cc.Prefab, (err, pfb) => {
                var ins = cc.instantiate(pfb);
                lblName.node.addChild(ins, eLayer.LAYER_NORMAL);
            });
        }
    }

    // 窗口打开的动态效果
    public windowOpen(mainNod: cc.Node, btnClose: cc.Node, nodMask: cc.Node = null) {
        mainNod.y = mainNod.y - 80;
        mainNod.scale = 0.9;
        mainNod.opacity = 80;
        btnClose.scale = 0.9;
        btnClose.y = btnClose.y + 80;
        btnClose.opacity = 20;
        let actTime = 0.25,
            a1 = cc.moveBy(actTime, 0, 80),
            a2 = cc.scaleTo(actTime, 1),
            a3 = cc.fadeIn(actTime),
            a4 = cc.moveBy(actTime, 0, -80),
            a5 = cc.fadeIn(actTime),
            a6 = cc.scaleTo(actTime, 1);
        mainNod.runAction(cc.spawn(a1, a2, a3));
        btnClose.runAction(cc.spawn(a4, a5, a6));
        if(nodMask) {
            nodMask.opacity = 0;
            nodMask.runAction(cc.fadeTo(actTime, 125));
        }
    }

    // 窗口关闭的动态效果
    public windowClose(mainNod: cc.Node, btnClose: cc.Node, nodMask: cc.Node = null ){
        let actTime = 0.25,
            a1 = cc.moveBy(actTime, 0, -80),
            a2 = cc.scaleTo(actTime, 0.9),
            a3 = cc.fadeTo(actTime, 80),
            a4 = cc.moveBy(actTime, 0, 80),
            a5 = cc.fadeTo(actTime, 20),
            a6 = cc.scaleTo(actTime, 0.9),
            a7 = cc.callFunc(()=>{
                mainNod.getParent().destroy();
            })
            mainNod.runAction(cc.spawn(a1, a2, a3));
        btnClose.runAction(cc.sequence(cc.spawn(a4, a5, a6), a7));
        if(nodMask) nodMask.runAction(cc.fadeOut(actTime));
    }

}