import { CommonMgr } from "../../../manager/CommonMgr";
import { Socket } from "../../../framework/socket";
import { eProc, eLayer, eGender } from "../../../manager/DefMgr";
import { Util } from "../../../framework/util";
import UIMgr from "../../../manager/UIMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    nodBg: cc.Node = null;
    @property(cc.Node)
    nodCont: cc.Node = null;

    private data = null;
    private info = null;
    private isLoad = false;


    onLoad () {
        let result1 = Socket.result(eProc.myboard);
        Socket.send(result1);
        let result = Socket.result(eProc.boardlist)
        Socket.send(result);
    }

    start () {
        this.node.zIndex = eLayer.LAYER_NORMAL;
        Socket.reg(eProc.boardlist, (param)=>{
            this.info = param["data"]["list"];
            this.isLoad = true;
        }, this);
        Socket.reg(eProc.myboard, this._myBoard, this);
    }

    update (dt) {
        if(this.isLoad){
            let self = this;
            let arr = [{x: 236, y: -352}, {x: 532, y: -393}, {x: 168, y: -513}, {x: 434, y: -495}, {x: 537, y: -626}, {x: 258, y: -697}, {x: 580, y: -828}, {x: 148, y: -830}, {x: 320, y: -901}]
            for(let k in this.info){
                let info = this.info[k];
                let index = Number(k);
                CommonMgr.loadRes("prefab/ui/message/itemMessPic", cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemMessPic").init(info, index);
                    self.nodCont.addChild(a);
                    a.setPosition(arr[k]);
                })
            }
            
            this.isLoad = false;
        }
    }

    onDestroy(){
        Socket.unreg(eProc.myboard);
        Socket.unreg(eProc.boardlist)
    }

    onClick(event) {
        let self = this;
        switch(event.target.name){
            case "close": 
                cc.find("close", this.node).getComponent(cc.Button).interactable = false;
                this.node.destroy()
                break;
            case "me":
                if(!this.data)return;
                if(self.data["data"].list.length<1){
                    UIMgr.Instance().toast("通关后可留言", 2);
                }else{
                    CommonMgr.loadRes("prefab/ui/message/itemMessDetail", cc.Prefab, (err, res)=>{
                        let a = cc.instantiate(res);
                        a.getComponent("itemMessDetail").init(self.data["data"]["list"][0]);
                        self.node.addChild(a);
                    });
                }
                break;
        }
    }
   
    private _myBoard(param) {
        if(param["code"]!=0) return;
        this.data = param;
    }

   
}
