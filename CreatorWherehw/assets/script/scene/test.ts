const {ccclass, property} = cc._decorator;

@ccclass
export default class test extends cc.Component {

    @property(cc.Node)
    nodMap: cc.Node = null;

    // onLoad () {}
    start () {

        for(let key in this.nodMap.children){
            let value = this.nodMap.children[key];
            if(value.name == "trap"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`深渊：${layer.getTileGIDAt(39, 16)}`);
                // cc.log(`深渊：${layer.getTileGIDAt(53, 13)}`);
                // cc.log(`被填上的深渊: ${layer.getTileGIDAt(0, 0)}`);
                // cc.log(`被填上的深渊: ${layer.getTileGIDAt(1, 0)}`);
                // cc.log(`水坑：${layer.getTileGIDAt(46, 22)}`);
                // cc.log(`水坑：${layer.getTileGIDAt(43, 43)}`);
            } 
            else if(value.name == "monster"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`boss: ${layer.getTileGIDAt(33, 14)}`);
                // cc.log(`小怪：${layer.getTileGIDAt(39, 11)}`)
                // cc.log(`大墓碑：${layer.getTileGIDAt(0,0)}`)
                // cc.log(`小墓碑：${layer.getTileGIDAt(1,0)}`)
            }
            else if(value.name == "gate"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`机关门: ${layer.getTileGIDAt(28, 13)}`);
                // cc.log(`打开的机关门: ${layer.getTileGIDAt(0, 0)}`)
                // cc.log(`自己的机关: ${layer.getTileGIDAt(37, 33)}`);
                // cc.log(`别人的机关：${layer.getTileGIDAt(14, 3)}`)
            }
            else if(value.name == "goods"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`木柴：${layer.getTileGIDAt(31, 1)}`);
                // cc.log(`火环：${layer.getTileGIDAt(26, 35)}`);
                cc.log(`超声波：${layer.getTileGIDAt(9,11)}`);
            }
            else if(value.name == "lawn"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`地面1：${layer.getTileGIDAt(1, 1)}`)                
                // cc.log(`地面2：${layer.getTileGIDAt(2, 1)}`)                
            }
            else if(value.name == "wall"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                cc.log(`墙壁: ${layer.getTileGIDAt(0, 0)}`);
            }
            else if(value.name == "goodsHide"){
                let layer: cc.TiledLayer = value.getComponent(cc.TiledLayer);
                // cc.log(`火堆：${layer.getTileGIDAt(28, 27)}`)
                cc.log(`自己的拼图：${layer.getTileGIDAt(1, 1)}`);
                cc.log(`别人的拼图：${layer.getTileGIDAt(2, 1)}`);
                cc.log(`标记：${layer.getTileGIDAt(3, 1)}`)
                cc.log(`神器:${layer.getTileGIDAt(4, 1)}`)
            }
        }
    }

    update (dt) {

    }
}
