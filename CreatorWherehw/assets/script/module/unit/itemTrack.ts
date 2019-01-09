const {ccclass, property} = cc._decorator;

@ccclass
export default class itemTrack extends cc.Component {
    private timeLine: number = 0;
    private time: number

    init(mAngle, time){
        this.node.rotation = mAngle
        this.time = time
    }

    // onLoad () {}

    start () {

    }

    update (dt) {
        this.timeLine+=dt;
        if(this.timeLine>=this.time){
            this.node.destroy();
        }
    }
}
