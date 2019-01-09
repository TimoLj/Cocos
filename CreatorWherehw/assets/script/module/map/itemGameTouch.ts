const {ccclass, property} = cc._decorator;

@ccclass
export default class itemGameTouch extends cc.Component {
    // onLoad () {}

    @property(cc.Label)
    lblNum: cc.Label = null;
    @property(cc.Node)
    nodTitle: cc.Node = null;
    @property(cc.Label)
    lblTime: cc.Label = null;

    private timeLine: number = 0;
    private clickCount: number = 0;
    private gameIsStart: boolean = false;

    start () {
        this.node.zIndex = 400;
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch)=>{

        })
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{

        })
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch)=>{

        })
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch)=>{

        })
        let str = this.nodTitle.getComponent(cc.Label);
        setTimeout(()=>{    
            str.string = "30秒内点击达到50次!";
        }, 2000)
        setTimeout(()=>{
            str.string = "你准备好了吗？"
        }, 3000)
        setTimeout(() => {
            str.string = "3";
        }, 5000);
        setTimeout(()=>{
            str.string = "2";
        }, 6000)
        setTimeout(() => {
            str.string = "1";
        }, 7000);
        setTimeout(() => {
            str.string = "开始";
        }, 8000);
        setTimeout(() => {
            this.gameIsStart = true;
            this.nodTitle.active = false;
        }, 9000);
        
    }

    update (dt) {
        if(!this.gameIsStart) return;
        this.timeLine += dt;
        this.lblTime.string = (30-Math.floor(this.timeLine)).toString();
        if(this.timeLine>=30){
            this.gameIsStart = false;
            if(this.clickCount>=50){
                this._succ()
            }else{
                this._defeat();
            }
            setTimeout(()=>{
                this.node.destroy();
            }, 3000)
        }
    }

    onClick() {
        if(!this.gameIsStart) return;
        this.clickCount++;
        this.lblNum.string = `点击次数：${this.clickCount}`;
    }

    private _succ() {
        this.nodTitle.active = true;
        this.nodTitle.getComponent(cc.Label).string = "恭喜你闯关成功";
    }

    private _defeat() {
        this.nodTitle.active = true;
        this.nodTitle.getComponent(cc.Label).string = "很遗憾，你失败了！"
    }
}
