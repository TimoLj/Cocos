import { CommonMgr } from "../../manager/CommonMgr";
import { Socket } from "../../framework/socket";
import { eProc, eLayer, eNotifyEvent, eGameState } from "../../manager/DefMgr";
import { UserMgr } from "../../manager/UserMgr";
import { Cache } from "../../framework/cache";
import { GameSet } from "../map/mapDef";
import UIMgr from "../../manager/UIMgr";
import { Notify } from "../../framework/notify";
import { GameMgr } from "../../manager/GameMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class itemSet extends cc.Component {
    @property(cc.Node)
    nodMusicOn: cc.Node = null;
    @property(cc.Node)
    nodMusicOff: cc.Node = null;
    @property(cc.Node)
    nodVibrateOn: cc.Node = null;
    @property(cc.Node)
    nodVibrateOff: cc.Node = null;
    @property(cc.Node)
    nodSet: cc.Node = null;
    @property(cc.Node)
    nodGiveUp: cc.Node = null;
    @property(cc.Node)
    nodOut: cc.Node = null;
    @property(cc.Label)
    lblName1: cc.Label = null;
    @property(cc.Label)
    lblName2: cc.Label = null;
    @property(cc.Label)
    lblID1: cc.Label = null;
    @property(cc.Label)
    lblID2: cc.Label = null;
    @property(cc.Node)
    nodLogout: cc.Node = null;
    @property(cc.Label)
    lblNoOppo: cc.Label = null;


    @property(cc.Button)
    btnRemove: cc.Button = null;
    @property(cc.Button)
    btnLogOut: cc.Button = null;
    @property(cc.Button)
    btnExit: cc.Button = null;
    @property(cc.Button)
    btnSurrender: cc.Button = null;

    onLoad() {
        Notify.on(eNotifyEvent.Reseted, this.onRested, this);
    }

    start() {
        //cc.log("set", UserMgr.StateObj);
        if (GameSet.showGameState()) {   //是否在游戏内
            this.nodSet.active = false;
            this.nodLogout.active = false;
            this.nodGiveUp.active = true;
            this.nodOut.active = true;
        } else {
            this.nodSet.active = true;
            this.nodLogout.active = true;
            this.nodGiveUp.active = false;
            this.nodOut.active = false;
        }
        UIMgr.Instance().windowOpen(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node))

        let state = GameSet.showMusicState();
        if (!state) {
            this.nodMusicOn.active = false;
            this.nodMusicOff.active = true;
        } else {
            this.nodMusicOn.active = true;
            this.nodMusicOff.active = false;
        }
        if (UserMgr.HasUser()) {
            this.lblName1.string = UserMgr.getUserNick();
            this.lblID1.string = `ID:${UserMgr.getUserUid()}`;
            UIMgr.Instance().showGender(this.lblName1, UserMgr.getUser()["gender"]);
            if (UserMgr.getUser().binding) {
                this.lblName2.string = UserMgr.getUser()["param"].oppoNick || "";
                UIMgr.Instance().showGender(this.lblName2, UserMgr.getUser()["param"]["oppoGender"]);
                this.lblID2.string = `ID:${UserMgr.getOtherUid()}`;
                this.lblNoOppo.node.active = false;
            }
            else {
                this.lblID2.string = "";
                this.lblName2.string = "";
                this.lblNoOppo.node.active = true;
            }
        }
        else {
            this.lblID1.string = "";
            this.lblID2.string = "";
            this.lblName1.string = "";
            this.lblName2.string = "";
        }

    }

    onDestroy() {
        Notify.off(eNotifyEvent.Reseted, this.onRested);
    }

    onClick(event) {
        let self = this;
        let Canvas = cc.find("Canvas");
        switch (event.target.name) {
            case "BtnClose":
            cc.find("BtnClose", this.node).getComponent(cc.Button).interactable = false;
                UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
                break;
            case "musicOn_off":
                let state = GameSet.showMusicState();
                if (state) {
                    GameSet.pauseMusic();
                    this.nodMusicOn.active = false;
                    this.nodMusicOff.active = true;
                } else {
                    GameSet.resumeMusic();
                    this.nodMusicOn.active = true;
                    this.nodMusicOff.active = false;
                }
                break;
            case "vibrateOn_off":

                break;
            case "set":
                if (UserMgr.getOtherUid() == "") {
                    UIMgr.Instance().toast("您尚未绑定好友");
                    return;
                }
                this.btnRemove.interactable = false;
                UIMgr.Instance().alertSelect("", `重置将删除关卡信息\n并解除匹配关系`, "确认", "取消", () => {
                    this.btnRemove.interactable = true;
                    self.lblName2.string = "";
                    self.lblID2.string = "";
                    this.lblNoOppo.node.active = true;
                    UIMgr.Instance().showGender(this.lblName2, -1);

                    var req = Socket.result(eProc.reset);
                    Socket.send(req);

                    let musicState = GameSet.showMusicState();
                    if (!musicState) {
                        GameSet.playMusicInit();
                        self.nodMusicOn.active = true;
                        self.nodMusicOff.active = false;
                    }
                    UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
                }, () => { })

                break;
            case "giveUp":
                this.btnSurrender.interactable = false;
                UIMgr.Instance().alertSelect("", "确认投票退出游戏", "确认", "取消", () => {
                    this.btnSurrender.interactable = true;
                    setTimeout(() => {
                        CommonMgr.loadRes("prefab/ui/map/itemGameState", cc.Prefab, (err, res) => {
                            let a = cc.instantiate(res);
                            a.getComponent("itemGameState").init("你已放弃本关, 等待对方放弃", false, 30, true);
                            Canvas.addChild(a);
                        })
                        UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
                    }, 100)
                    let result1 = Socket.result(eProc.giveup);
                    Socket.send(result1);
                },
                () => { })
                break;
            case "out":
                this.btnExit.interactable = false   
                UIMgr.Instance().alertSelect("", "确认强行退出游戏", "确认", "取消", () => {
                    UIMgr.Instance().windowClose(cc.find("nodMain", this.node), cc.find("BtnClose", this.node), cc.find("UIMask", this.node));
                    setTimeout(() => {
                        let a = cc.find("Canvas/pnlGameInter");
                        if(a) a.destroy();
                        GameSet.gameOut();
                        GameSet.changeMusic("audio/bgm_jyc");
                        UserMgr.OnExitGame();
                        self.node.destroy();
                    }, 100)
                    let result2 = Socket.result(eProc.exit);
                    Socket.send(result2);
                    UserMgr.onGetAchieve(1007);
                },
                () => { }, true, ()=>{
                    this.btnExit.interactable = true;

                })
                break;
            case "btnChgAct":
                UIMgr.Instance().showHMI("prefab/ui/Account/pnlAccount", ()=>{
                    self.node.destroy();
                    cc.find("Canvas/pnlStart").destroy();
                })
                break;
            case "btnLogout":
                this.btnLogOut.interactable = false;
                UIMgr.Instance().alertSelect("", "确定退出登陆？", "确定", "取消", () => {
                    this.btnLogOut.interactable = true;
                    Cache.remove(Cache.CK_USERNAME);
                    Cache.remove(Cache.CK_PASSWORD);
                    Socket.close();
                    UIMgr.Instance().showHMI("prefab/ui/Account/pnlAccount", ()=>{
                        cc.find("Canvas/pnlStart").destroy();
                    })
                    self.node.destroy();
                }, () => { });
                break;
        }

    }

    onRested() {
        this.lblName2.string = "";
        this.lblID2.string = "";
        this.lblNoOppo.node.active = true;
    }
}
