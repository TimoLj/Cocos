const {ccclass, property} = cc._decorator;

@ccclass
export default class itemShowGet extends cc.Component {

    @property(cc.Label)
    lblCont: cc.Label = null;

    private timeLine: number = 0;
    private isPaly: boolean = false

    
    init(cont: string){
        this.lblCont.string = cont;
    }

    // onLoad () {}

    start () {
        this.node.setPosition(0, -250)
    }

    update (dt) {
        this.timeLine += dt;
        if(this.timeLine>=3 && !this.isPaly){
            let ani = cc.fadeTo(0.5, 0);
            this.node.runAction(ani);

        }
        if(this.timeLine>3.5){
            this.node.destroy();
        }
    }
}
