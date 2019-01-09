
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start() {
        var tlm = this.getComponent(cc.TiledMap);
        var testLayer = tlm.getLayer("myL2");
        cc.log(testLayer, "is test Layer");
        cc.log("getLayerName", testLayer.getLayerName());
        cc.log("getTileGIDAt", testLayer.getTileGIDAt(10, 2));
        cc.log("getTexture", testLayer.getTexture());


    }
}
