import { UserMgr } from "../../../manager/UserMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class itemAchieve extends cc.Component {

    @property(cc.Sprite)
    sprBG: cc.Sprite = null;

    @property(cc.Label)
    lblName: cc.Label = null;

    @property(cc.Label)
    lblDesc: cc.Label = null;

    @property(cc.Label)
    lblProgress: cc.Label = null;

    @property(cc.Node)
    nodComplete: cc.Node = null;

    mData: Object = null;



    public init(data) {
        //this.sprBG=arg_sprBG;
        this.nodComplete.active = false;
        this.lblName.string = data["Name"];
        this.lblDesc.string = data["Desc"];
        this.mData = data;

        this.refreshView();
    }

    public refreshView() {
        this.lblProgress.string = UserMgr.ReadAchievePrg(this.mData["ID"]) + "/" + this.mData["Times"];
        if (UserMgr.ReadAchievePrg(this.mData["ID"]) >= this.mData["Times"]) {
            this.nodComplete.active = true;
            this.lblProgress.node.active = false;
        }
    }
}
