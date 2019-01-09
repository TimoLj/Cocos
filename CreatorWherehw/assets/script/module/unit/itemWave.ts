const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private timeLine: number = 0;

    init(dotPos, nodHuman, scale) {
       this.node.x = (dotPos.x-nodHuman.x)*scale;
       this.node.y = (dotPos.y-nodHuman.y)*scale;
       this.node.scale = 4;
    }

    onLoad () {

    }

    start () {

    }

    update (dt) {
        this.timeLine += dt;
        if(this.timeLine>= 0.76) this.node.destroy();
    }
}
