import { Notify } from "../framework/notify";
import { eNotifyEvent, eProc } from "../manager/DefMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    onLoad() {
        cc.loader.loadRes("prefab/map/itemNightBg");
        cc.loader.loadRes("prefab/map/itemDayBg");
        cc.loader.loadRes("prefab/map/mapAll/itemMapTest0_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMapTest0_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMapTest1_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMapTest1_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap2_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap2_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap3_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap3_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap4_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap4_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap5_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap5_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap6_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap6_night");
        cc.loader.loadRes("prefab/map/mapAll/itemMap7_day");
        cc.loader.loadRes("prefab/map/mapAll/itemMap7_night");
        cc.loader.loadRes("prefab/map/itemMapDay");
        cc.loader.loadRes("prefab/map/itemMapNight");
        cc.loader.loadRes("audio/bgm_jyc")
        cc.loader.loadRes("prefab/map/itemView_day");
        cc.loader.loadRes("prefab/map/itemView_night");
        cc.loader.loadRes("prefab/animation/walkGirl_1");
        cc.loader.loadRes("prefab/animation/walkGirl_2");
        cc.loader.loadRes("prefab/animation/walkBoy");
        cc.loader.loadRes("prefab/animation/fire_blue");
        cc.loader.loadRes("prefab/animation/fire_red");
        cc.loader.loadRes("prefab/ui/pnlLeavel")
        cc.loader.loadRes("prefab/ui/pnlMatch");
        cc.loader.loadRes("prefab/ui/pnlRole")
        cc.loader.loadRes("prefab/ui/itemSet")
        cc.loader.loadRes("prefab/ui/Invition/pnlInvition");
        cc.loader.loadRes("prefab/ui/Account/pnlAccount")
        cc.loader.loadRes("prefab/ui/Account/pnlRegister")

        cc.audioEngine.setMusicVolume(0.5);
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onkeyDown, this);

        Notify.on(eNotifyEvent.SoundEffect, this._soundEffect, this);
    }


    onDestroy() {
        Notify.off(eNotifyEvent.SoundEffect, this._soundEffect)
    }

    onkeyDown(pram) {
        //cc.log("pram", pram);

        //UserMgr.onGetAchieve(pram.keyCode + 905);
        //cc.log(UserMgr.getUser(), "click 4 test");
        //UIMgr.Instance().addAchieveToast(pram.keyCode);
        //var str = `已与<color=#FFE295>${UserMgr.getUser()["param"].oppoNick}</c>完成匹配，你将成为<color=#FFE295>Merope</c>`;
        //CommonMgr.toast(str,4, null, "texture/orion");
        //UIMgr.Instance().toast((pram.keyCode) + "");
        //cc.log("pram", pram);
    }

    private _soundEffect(param) {
        cc.loader.loadRes(param[0], cc.AudioClip, (err, res) => {
            cc.audioEngine.playEffect(res, false);
        })
    }

}
