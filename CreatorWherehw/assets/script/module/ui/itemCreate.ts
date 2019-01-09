import { Util } from "../../framework/util";
import { CommonMgr } from "../../manager/CommonMgr";
import { Socket } from "../../framework/socket";
import { eProc } from "../../manager/DefMgr";
import { eChooseDay, eChooseNight } from "../map/mapDef";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    strNum: cc.Label = null;
    @property(cc.Node)
    nodNight: cc.Node = null;
    @property(cc.Node)
    nodDay: cc.Node = null;
    @property(cc.Node)
    nodChooseNight: cc.Node = null;
    @property(cc.Node)
    nodChooseDay: cc.Node = null;
    @property(cc.Node)
    nodStart: cc.Node = null;
    @property(cc.Node)
    nodCreate: cc.Node = null;

    // onLoad () {}

    start () {
        Socket.reg(eProc.match, this._match, this);
    }

    // update (dt) {}

    onDestroy() {
        Socket.unreg(eProc.match)
    }

    onClick(event) {
        let name = event.target.name;
        let self = this;
        if(name == "day"){
            this.nodChooseDay.active = true;
            this.nodChooseNight.active = false;
            this.nodNight.active = true;
            this.nodDay.active = false
        }
        else if(name == "night"){
            this.nodDay.active = true;
            this.nodNight.active = false;
            this.nodChooseDay.active = false;
            this.nodChooseNight.active = true;
        }
        else if(name == "create"){
            this.strNum.string = Util.random(1111, 9999).toString();
            // this.nodStart.active = true;
            this.nodCreate.active = false;
            let choose = null;
            if(this.nodChooseDay.active){
                choose = eChooseDay;
            }else{
                choose = eChooseNight;
            }
            let result = Socket.result(eProc.ready);
            result.data["choose"] = choose;
            Socket.send(result);
        }
        else if(name == "start"){
            
        }

    }

    private _match(param) {
        cc.log(param)
        if(param["code"]!=0) return;
        cc.log("进入房间")
        let self = this;
        let canvas = cc.find("Canvas");
        if(this.nodChooseDay.active){
            CommonMgr.loadRes("prefab/map/pnlGameInter", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("pnlGameInter").init(true);
                canvas.addChild(a);
            })
        }else if(this.nodChooseNight.active){
            CommonMgr.loadRes("prefab/map/pnlGameInter", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("pnlGameInter").init(false);
                canvas.addChild(a);
            })
        }
        setTimeout(()=>{
            self.node.destroy();
        }, 100)
    }
}
