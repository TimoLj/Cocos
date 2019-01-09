import { CommonMgr } from "../../manager/CommonMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Graphics)
    gpsLine: cc.Graphics = null;

    private pos: cc.Vec2 = cc.v2();

    private isOut: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.gpsLine.lineWidth = 2;

        let a = -135*Math.PI/180;
        cc.log(Math.cos(a), Math.sin(a))

        CommonMgr.loadRes("prefab/map/itemLine", cc.Prefab, (err, res)=>{
            for(let i = 0; i<18; i++){
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemLine").init(i*10*Math.PI/180);
                this.node.addChild(a);
            }
            for(let i = 1; i<19; i++){
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemLine").init(-i*10*Math.PI/180);
                this.node.addChild(a);
            }
        })

    
    }

    update (dt) {
        // if(this.isOut) return;
        // this.gpsLine.clear();
        // this.gpsLine.moveTo(0,0);
        // this.pos.x+=5;
        // this.pos.y+=5;
        // this.gpsLine.lineTo(this.pos.x, this.pos.y);
        // this.gpsLine.stroke();
        // let a = Math.abs(Math.sqrt(Math.pow(this.pos.x, 2)+Math.pow(this.pos.y, 2)))
        // if(a>500){
        //     this.isOut = true;
        // }
    }

}
