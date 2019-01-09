import { CommonMgr } from "../../../manager/CommonMgr";
import { eGender, eNotifyEvent } from "../../../manager/DefMgr";
import { Notify } from "../../../framework/notify";
import { UserMgr } from "../../../manager/UserMgr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    lblCont1: cc.Label = null;
    @property(cc.Label)
    lblCont2: cc.Label = null;
    @property(cc.Label)
    lblPlayer1: cc.Label = null;
    @property(cc.Label)
    lblPlayer2: cc.Label = null;
    @property(cc.Label)
    lblID1: cc.Label = null;
    @property(cc.Label)
    lblID2: cc.Label = null;
    @property(cc.Label)
    lblTime: cc.Label = null;
    @property(cc.Label)
    lblZan: cc.Label = null;
    @property(cc.Sprite)
    sprSex1: cc.Sprite = null;
    @property(cc.Sprite)
    sprSex2: cc.Sprite = null;
    @property(cc.Node)
    NodPrasie: cc.Node = null;

    private data: Object;
    private index: number;
    private isZan: boolean;

    init(info, index){
        this.data = info;
        this.index = index;
    }


    // onLoad () {}

    start () {
        this.node.zIndex = this.index * 10;
        this._setCont();
        let user = UserMgr.getUser();
        if(user.base.like && user.base.like[this.data["id"]]){
            this.isZan = true;
            this.NodPrasie.active = true;
        }
        Notify.on(eNotifyEvent.Praise, this._Praise, this);
    }

    // update (dt) {}

    onDestroy() {
        Notify.off(eNotifyEvent.Praise, this._Praise);
    }

    onClick(event) {
        CommonMgr.loadRes("prefab/ui/message/itemMessDetail", cc.Prefab, (err, res)=>{
            let a = cc.instantiate(res);
            a.getComponent("itemMessDetail").init(this.data, this.isZan);
            cc.find("Canvas/itemMessage").addChild(a);
        })
    }
    private changePic(sprite: cc.Sprite, sex: number) {
        let url: string;
        if(sex == eGender.Male){
            url = "picture/role/male";
        }
        else if(sex == eGender.Female){
            url = "picture/role/female";
        }
        else{
            url = "picture/role/neutral";
        }
        CommonMgr.changeSprite(sprite, url);
    }

    
    private _setCont() {
        let data = this.data
        this.lblPlayer1.string = data["nick1"];
        this.lblPlayer2.string = data["nick2"];
        this.lblID1.string = data["uid1"];
        this.lblID2.string = data["uid2"];
        this.lblCont1.string = data['words1'];
        this.lblCont2.string = data['words2'];
        this.lblZan.string = data["zan"];
        this.changePic(this.sprSex1, data["gender1"]);
        this.changePic(this.sprSex2, data["gender2"]);
        let time = new Date(data["time"])
        this.lblTime.string = `${time.getFullYear()}.${time.getMonth()+1}.${time.getDay()}`;
    }

    private _Praise(param){
        if(this.data["id"] == param[0]){
            this.data["zan"] = Number(this.lblZan.string) + param[1];
            this.lblZan.string = this.data["zan"];
            if(param[1] == 1){
                this.NodPrasie.active = true;
                this.isZan = true;
            }else{
                this.NodPrasie.active = false;
                this.isZan = false;
            }
        }
    }
}
