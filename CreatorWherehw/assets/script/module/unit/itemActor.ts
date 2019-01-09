import { Notify } from "../../framework/notify";
import { eNotifyEvent } from "../../manager/DefMgr";

const {ccclass, property} = cc._decorator;
@ccclass
export default class itemActor extends cc.Component {
    @property(cc.Animation)
    ani1: cc.Animation = null;
    @property(cc.Animation)
    ani2: cc.Animation = null;
    @property(cc.Node)
    nodAni: cc.Node = null;
    
    private isShadow: boolean = false;
    private nodName: string

    init(name, pos, scale, faceTo, isShadow) {
        this.nodName = name;
        this.node.x = pos.x;
        this.node.y = pos.y;
        this.node.scale = scale;
        this.node.scaleX *= faceTo || 1;   // 1朝左， -1朝右
        this.isShadow = isShadow;
    }

    // onLoad () {}

    start () {
        this.addEvent();
        if(this.isShadow){ this.nodAni.active = true; }
    }

    update (dt) {
     
    }

    onDestroy() {
        Notify.off(eNotifyEvent.AniPlay, this._actionPlay);
    }

    addEvent (){
        Notify.on(eNotifyEvent.AniPlay, this._actionPlay, this);
    }

    private _actionPlay(param){
        if(!cc.isValid(this.node)) return;
        if(this.nodName != param[1]) return;
        let aniName = this.ani1.getClips()[0].name;
        let aniState = this.ani1.getAnimationState(aniName);
        // cc.log(`是否开始播放${aniState.isPlaying}, 是否暂停${aniState.isPaused}`)
        if(param[0]){
            if(!aniState.isPlaying){
                this.ani1.play();
                if(this.nodAni.active) this.ani2.play();
            }else{
                if(aniState.isPaused){
                    this.ani1.resume();
                    if(this.nodAni.active) this.ani2.resume();
                }
            }
        }else{
            this.ani1.pause();
            if(this.nodAni.active)  this.ani2.pause();
        }
    }
}
