const {ccclass, property} = cc._decorator;

@ccclass
export default class mapTest extends cc.Component {

    @property(cc.Node)
    nodMap: cc.Node = null;

    layerWall: cc.TiledLayer = null;
    // start () {
    //     cc.log(this.nodMap)
    //     for(let k in this.nodMap.children){
    //         let v = this.nodMap.children[k];
    //         // cc.log(v)
    //         if(v.name == "trap"){
    //             cc.log(v.getComponent(cc.TiledObjectGroup).getObjects())
    //         }
    //         if(v.name == "wall"){
    //             this.layerWall = v.getComponent(cc.TiledLayer)
    //         }
    //     }
    //     cc.log(this.layerWall.getPositionAt(3, 2))
    // }

    // update (dt) {}
}
