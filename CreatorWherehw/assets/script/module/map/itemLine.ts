const {ccclass, property} = cc._decorator;

@ccclass
export default class itemLine extends cc.Component {

    private angle: number = null;
    private isOut: boolean = false;
    private line: cc.Graphics = null;
    private pos: cc.Vec2 = cc.v2();
    private posBegain: cc.Vec2 = cc.v2();
    private layerWall: cc.TiledLayer = null;
    private timeLine: number =0;

    init(angle, posBegain: cc.Vec2 = cc.v2(), layerMap: cc.TiledLayer){
        this.angle = angle;
        this.posBegain = posBegain;
        this.layerWall = layerMap;
    }


    start () {
        this.line = this.node.getComponent(cc.Graphics);
        this.pos.x = this.posBegain.x;
        this.pos.y = this.posBegain.y;
        this.line.lineWidth = 1;
    }

    update (dt) {
        this.timeLine+=dt;
        if(this.timeLine>2){
            this.node.destroy();
        }

        if(this.isOut) return;
        this.line.clear();
        this.line.moveTo(this.posBegain.x, this.posBegain.y);
        let pos = cc.v2();
        pos.x = this.pos.x;
        pos.y = this.pos.y
        this.pos.x+=3*Math.cos(this.angle)
        this.pos.y+=3*Math.sin(this.angle);
        let posNew = this.judgePos(this.pos);
        if(this.judgeIsOn(posNew)){
            // let posA = this.layerWall.getPositionAt(posNew);
            // let a = {x: posA.x, y:posA.y};
            // let b = {x: posA.x+32, y:posA.y};
            // let c = {x: posA.x+32, y:posA.y+32};
            // let d = {x: posA.x, y:posA.y+32};
            // let widthPos;
            // if(this.countE(a, b, this.posBegain, this.pos)){
            //     widthPos = this.countE(a, b, this.posBegain, this.pos);
            // }
            // else if(this.countE(b, c, this.posBegain, this.pos)){
            //     widthPos = this.countE(b, c, this.posBegain, this.pos)
            // }
            // else if(this.countE(c, d, this.posBegain, this.pos)){
            //     widthPos = this.countE(c, d, this.posBegain, this.pos)
            // }
            // else if(this.countE(d, a, this.posBegain, this.pos)){
            //     widthPos = this.countE(d, a, this.posBegain, this.pos)
            // }
            // cc.log(widthPos)
            this.line.lineTo(pos.x, pos.y);
            this.line.stroke();
            this.isOut = true; 
            return;
        }else{
            this.line.lineTo(this.pos.x, this.pos.y);
            this.line.stroke();
        }
        let a = Math.abs(Math.sqrt(Math.pow(this.pos.x-this.posBegain.x, 2)+Math.pow(this.pos.y-this.posBegain.y, 2)))

        if(a>100) {
            this.isOut = true;
        }
    }

    private judgePos(pos: cc.Vec2) {   // 坐标转换地图块
        let posZ = cc.v2();
        posZ.x = Math.floor(pos.x / this.layerWall.getMapTileSize().width);
        posZ.y = 30- Math.floor(pos.y / this.layerWall.getMapTileSize().height) - 1;
        return posZ;
    }

    private judgeIsOn(pos: cc.Vec2){    // 判断是否在墙上
        if(pos.x<0 || pos.x>30 || pos.y<0 || pos.y>30) return true;
        cc.log(this.layerWall.getTileGIDAt(pos), pos)
        if(this.layerWall.getTileGIDAt(pos)){
            cc.log(this.layerWall.getTileGIDAt(pos))
            return true
        }
        return false;
    }

    private countE(a, b, c, d) {
        let judge = (b.y-a.y)*(d.x-c.x) - (a.x-b.x)*(c.y-d.y);
        let pos = cc.v2();
        if(judge == 0){
            return false;
        }else{
            pos.x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) + (b.y - a.y) * (d.x - c.x) * a.x - (d.y - c.y) * (b.x - a.x) * c.x) / judge;
            pos.y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x) + (b.x - a.x) * (d.y - c.y) * a.y - (d.x - c.x) * (b.y - a.y) * c.y) / judge;
            return pos;
        }
    }

}
