import { ConfigMgr } from "../../../manager/ConfigMgr";
import { CommonMgr } from "../../../manager/CommonMgr";
import { eLayer } from "../../../manager/DefMgr";
import UIMgr from "../../../manager/UIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class pnlAchieve extends cc.Component {

    @property(cc.Node)
    nodContain: cc.Node = null;
    @property(cc.Node)
    btnBack: cc.Node = null;

    mAni: cc.Animation = null;
    achieveItmeList: Object = new Object();//成就条目Node

    start() {
        //cc.log("this ", this);
        this.mAni = this.node.getComponent(cc.Animation);
        var achieveCfg = ConfigMgr.getAll("Achieve");
        var len = 0;
        CommonMgr.loadRes("prefab/ui/Achieve/itemAchieve", cc.Prefab, (err, prefab) => {
            for (let key in achieveCfg) {
                //cc.log("key",key);
                var ins = cc.instantiate(prefab);
                this.achieveItmeList[key] = ins;
                ins.getComponent("itemAchieve").init(achieveCfg[key]);
                this.nodContain.addChild(ins, eLayer.LAYER_NOTICE);
                len = len + 1;
            }
            for (let key in this.achieveItmeList) {
                this.achieveItmeList[key].getComponent("itemAchieve").refreshView();
            }
            this.mAni.play();
        });
    }

    update(dt) {
    }

    onClickChip() {
        UIMgr.Instance().showHMI("prefab/ui/Chip/pnlChip");
    }

    onClickClose(){
        this.btnBack.getComponent(cc.Button).interactable = false;
        let mAniState = this.mAni.play();
        mAniState.wrapMode = cc.WrapMode.Reverse;
        let self = this;
        setTimeout(()=>{
            UIMgr.Instance().showHMI("prefab/ui/pnlStart", ()=>{
                self.node.destroy();
            })
        }, mAniState.duration * 1000)
       
    }

}
