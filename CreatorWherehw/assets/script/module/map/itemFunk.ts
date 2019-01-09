import { CommonMgr } from "../../manager/CommonMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemFunk extends cc.Component {

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    private ExistTime: number;
    private AppearTime: number;
    private DisapperTime: number;

    init(url: string, pos: cc.Vec2, point: cc.Vec2, ExistTime: number, AppearTime: number, DisapperTime, name: string){
        CommonMgr.changeSprite(this.spr, url);
        this.node.setPosition(pos);
        this.node.name = name;
        this.node.setAnchorPoint(point);
        this.ExistTime = ExistTime;
        this.AppearTime = AppearTime;
        this.DisapperTime = DisapperTime;
    }

    start () {
        if(this.ExistTime>0){
            setTimeout(()=>{
                if(cc.isValid(this.node)) this.node.destroy();
            }, this.ExistTime * 1000)
        }

        if(this.AppearTime){
            this.node.runAction(cc.fadeIn(this.AppearTime))
        }
       
        if(this.DisapperTime && this.ExistTime>0){ 
            setTimeout(()=>{
                this.node.runAction(cc.fadeOut(this.DisapperTime));
            }, (this.ExistTime-1) * 1000)
        }
    }

    // update (dt) {}
}
