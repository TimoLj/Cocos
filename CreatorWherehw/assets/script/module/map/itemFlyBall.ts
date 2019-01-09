import { tileSize, GameSet, nightSeeDuration } from "./mapDef";

const {ccclass, property} = cc._decorator;

@ccclass
export default class itemFlyBall extends cc.Component {
    private angle: number;
    private posStart: cc.Vec2 = cc.v2();
    private layerMap: cc.TiledLayer;
    private timeLine: number = 0;
    private xDire: number = 1;
    private yDire: number = 1;
    private isCheck: boolean = true;
    private isOver: boolean = false;
    private isHide: boolean = false;
    private tileCount: cc.Vec2;

    init(angle: number = 0.174, a: cc.Vec2, layerMap: cc.TiledLayer){
        this.angle = angle;
        this.node.x = a.x;
        this.node.y = a.y;
        this.layerMap = layerMap;
        this.posStart.x = a.x;
        this.posStart.y = a.y;
    }

    start(){
        this.tileCount = GameSet.getTiledCnt();
    }

    update (dt) {
        this.timeLine += dt;
        if(this.isOver) return;
        if(this.timeLine> nightSeeDuration){
            this.isOver = true;
            setTimeout(() => {
                this.node.destroy();
            }, 500);
            // this.node.destroy();
        }
        if(this.timeLine>nightSeeDuration-0.5){
            if(!this.isHide){
                this.isHide = true;
                this.node.runAction(cc.fadeTo(0.5, 0));
            }
        }
        let xLen = this.xDire * Math.cos(this.angle);
        let yLen = this.yDire * Math.sin(this.angle);
        for(let i = 0; i < 10; i++){
            let p = cc.v2(this.node.x+xLen, this.node.y+yLen);
            if(this.isCheck){
                if(!this._judgeCrash(p)){
                    this.node.x+= this.xDire * Math.cos(this.angle);
                    this.node.y+= this.yDire * Math.sin(this.angle);
                }else{
                    let pos = GameSet.countTile(p);
                    GameSet.loadWall(pos, this.node.getParent(), null, this.layerMap);
                }
            }
        }
    }

    private _judgeCrash(posNext) {
        let pos = GameSet.countTile(posNext);
        if(pos.x<0 || pos.x>this.tileCount.x || pos.y<0 || pos.y>this.tileCount.y) return;
        if(this.layerMap.getTileGIDAt(pos)){
            let p = this.layerMap.getPositionAt(pos),
                leftX = p.x,
                rightX = p.x+tileSize,
                bottonY = p.y,
                topY = p.y+tileSize,
                dis1: number,
                dis2: number,
                angle = Math.atan2(this.node.y-this.posStart.y, this.node.x-this.posStart.x) * 180 / Math.PI;
            if(angle == 45 || angle == 135 || angle == -45 || angle == -135){
                 this.xDire *= -1;
                this.yDire *= -1;
                this.posStart.x = posNext.x;
                this.posStart.y = posNext.y;
                this.isCheck = false;
                setTimeout(()=>{this.isCheck = true}, 50)
                return true;
            }
            else if(angle == 90 || angle == -90){
                this.yDire *= -1;
                this.posStart.x = posNext.x;
                this.posStart.y = posNext.y;
                this.isCheck = false;
                setTimeout(()=>{this.isCheck = true}, 50)
                return true;
            }
            else if(angle == 0 || angle == 180 || angle == -180){
                this.xDire *= -1;
                this.posStart.x = posNext.x;
                this.posStart.y = posNext.y;
                this.isCheck = false;
                setTimeout(()=>{this.isCheck = true}, 50)
                return true;
            }
            else if(angle>0 && angle<90){
                dis1 = Math.abs(this.node.x-leftX);
                dis2 = Math.abs(this.node.y-bottonY);
                if(dis1<dis2){
                    this.xDire *= -1;
                }else if(dis1>dis2){
                    this.yDire *= -1;
                }else {
                    this.xDire *= -1;
                    this.yDire *= -1;
                }
            }
            else if(angle>90 && angle < 180){
                dis1 = Math.abs(this.node.x - rightX);
                dis2 = Math.abs(this.node.y - bottonY);
                if(dis1<dis2){
                    this.xDire *= -1; 
                }else if(dis1>dis2){
                    this.yDire *= -1;
                }else {
                    this.xDire *= -1;
                    this.yDire *= -1;
                }
            }
            else if(angle<0 && angle>-90){
                dis1 = Math.abs(this.node.x - leftX);
                dis2 = Math.abs(this.node.y - topY);
                if(dis1<dis2){
                    this.xDire *= -1;
                }else if(dis1>dis2){
                    this.yDire *= -1;
                }else {
                    this.xDire *= -1;
                    this.yDire *= -1;
                }
            }
            else if(angle<-90 && angle>-180){
                dis1 = Math.abs(this.node.x - rightX);
                dis2 = Math.abs(this.node.y - topY);
                if(dis1<dis2){
                    this.xDire *= -1;
                }else if(dis1>dis2){
                    this.yDire *= -1;
                }else {
                    this.xDire *= -1;
                    this.yDire *= -1;
                }
            }
            this.posStart.x = posNext.x;
            this.posStart.y = posNext.y;
            this.isCheck = false;
            setTimeout(()=>{this.isCheck = true}, 50)
            return true;
        }
    }
}
