import { CommonMgr } from "../../manager/CommonMgr";
import { eActorOffestx, eActorOffesty, eActorScale, tileSize, eDieCount, fireSizeBigger, fireSizeNormal, eRangeVecNormal, fireSizeSmaller, goodsResetTime, GameSet, fireResetTime, skillDuration, powerAdd, powerAddByKill, powerMax, powerExpend, powerInit, eMapOffestx, eMapOffesty, layerIndex, objectId, SenceType, ePower } from "./mapDef";
import { Notify } from "../../framework/notify";
import { eNotifyEvent, eProc } from "../../manager/DefMgr";
import { MoveControl } from "./moveControl";
import { Socket } from "../../framework/socket";
import { UserMgr } from "../../manager/UserMgr";
import { ConfigMgr } from "../../manager/ConfigMgr";
import UIMgr from "../../manager/UIMgr";
import { Util } from "../../framework/util";
import Bundle from "../../kbengine/core/Bundle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class itemMap extends cc.Component {
    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;
    @property(cc.Node)
    nodMap: cc.Node = null;

    // private nodMap: cc.Node = null;
    private nodMaster: cc.Node = null;
    private itemView: cc.Node = null;
    private activeButton: cc.Node = null;
    private nodActive: cc.Node = null;
    private pnlGameInter: cc.Node = null;
    private oppoShadow: cc.Node = null;
    private stressDoor1: cc.Node = null;
    private stressDoor2: cc.Node = null;

    private layerWall: cc.TiledLayer = null;
    private layerGoods: cc.TiledLayer = null;
    private layerTrap: cc.TiledLayer = null;
    private layerMonster: cc.TiledLayer = null;
    private layerGate: cc.TiledLayer = null;

    private mPattern: boolean = true;
    private isMove: boolean = false;
    private isHaveGoods: boolean = false;
    private isSucc: boolean = false;
    private isPlay: boolean = false;
    private isCool: boolean = true;
    private isHint: boolean = false;    // 是否显示技能cd
    private isNew: boolean = true;
    private allSucc: boolean = false;
    private isSmallest: boolean = false;
    private isGodMachine: boolean = false;
    private isShowOver: boolean = false;
    private isNeedGod: boolean = false; // 是否需要神器
    private isSelfHad: boolean = false; // 自己是否有祭品
    private isOppoHad: boolean = false; // 队友是否有祭品

    private timeLine: number = 0;
    private dieCount: number = 0;
    private otherDieCunt: number = 0;   // 队友伤害次数
    private dieCountMax: number = eDieCount;
    private fireLevel: number = 2;
    private fireChangeTime: number = fireResetTime;
    private skillTime: number = null;
    private powerLine: number = powerInit;
    private timeLineThis: number = 0;
    private woodCount: number = 1;
    private woodTexture: number;
    private mapDis: number

    private tiledCount = cc.v2();   // 块数
    private mTouchStart = cc.v2();
    private mTouchEnd = cc.v2();
    private mInitPos = cc.v2();
    private mLastPos = cc.v2();
    private mPosNow = cc.v2();
    private mLastOther = cc.v2();
    private otherOne = cc.v2();
    private boyRange: cc.Vec2 = cc.v2();
    private mSignArr: Array<object> = [];   // 自己所做的标记
    private InSignArr: Array<object> = [];  // 队友所做的标记
    private goodsArr: Array<object> = [];   // 重置物品对象
    private monsterArr: Array<any> = [];    // 怪物数组
    private chipGetArr: Array<number> = []; // 碎片获取数组
    private groundArr: Array<any> = [];

    private mapInfo: object = new Object();
    private roundInfo: object = new Object();
    private chipSelf: object = new Object();
    private chipOppo: object = new Object();
    private chips: object = new Object();

    init(pattern: boolean, isNew: boolean, info) {
        this.pnlGameInter = cc.find("Canvas/pnlGameInter")
        this.mPattern = pattern;
        this.isNew = isNew

        let chipOppo;
        for(let key in ConfigMgr.getAll("Round")){
            let value = ConfigMgr.getAll("Round")[key];
            if(value.Number == UserMgr.CurrentLeavel()){
                if(value.IsDay == this.mPattern){
                    this.roundInfo = value;
                    GameSet.initRound(value);
                }
                if(!this.mPattern == value.IsDay){
                    chipOppo = value["Jigsaw"];
                }
            }
        }
        let roundInfo = this.roundInfo;
        let chipSelf: Array<any> = roundInfo['Jigsaw'];
        for(let k in chipSelf){
            let v = chipSelf[k],
                arr = v.split("-"),
                obj = {
                    pos : cc.v2(Number(arr[0]), Number(arr[1])),
                    type: arr[2]
                }
            this.chipSelf[k] = obj;
        }
        for(let k in this.chipOppo){
            let v = chipOppo[k],
                arr = v.split("-"),
                obj = {
                    pos : cc.v2(Number(arr[0]), Number(arr[1])),
                    type: arr[2]
                }
            this.chipOppo[k] = obj;    
        }
        this.chips = this.chipSelf;
        if (!isNew) {   // 是否为断线重连
            this.mapInfo = info.data;
            this.timeLine = (info.time - this.mapInfo["startTime"]) / 1000;
            this.powerLine = this.mapInfo["self"].nightsee;
            this.addPowerLocal();
        }
    }

    onLoad() {
        let self = this;
        for (let key in this.nodMap.children) { // 读取地图属性
            let value = this.nodMap.children[key];
            if(value.name == "object"){
                GameSet.initMapInfo(value.getComponent(cc.TiledObjectGroup).getObjects(), this.mPattern);   // 获取地图对象层
                // cc.log(value.getComponent(cc.TiledObjectGroup).getObjects())
                let a, b;
                if(this.mPattern){
                    a = objectId.mDay;
                    b = objectId.mNight;
                }else{
                    a = objectId.mNight
                    b = objectId.mDay;
                }
                this.mInitPos = Util.clone(GameSet.checkMap(a)[0].pos);     // 出身点位置 
                this.mPosNow = Util.clone(this.mInitPos);   // 人物当前位置
                this.otherOne = GameSet.checkMap(b)[0].pos; // 队友当前位置
                if(this.isNew) this._initNet();  // 服务器初始化
                cc.log(GameSet.showMapInfo())
            }
            else if(value.name == "ground"){
                let obj = value.getComponent(cc.TiledObjectGroup).getObjects()
                for(let k in obj){
                    let b = new Object();
                    b["pos"] = cc.v2(obj[k].x, obj[k].y)
                    b["points"] = Util.clone(obj[k].points)
                    b["type"] = obj[k].form
                    this.groundArr.push(b)
                }
                // cc.log(this.groundArr)
            }
            else if (value.name == "wall") {
                this.layerWall = value.getComponent(cc.TiledLayer);
            }
            else if(value.name == "trap"){
                this.layerTrap = value.getComponent(cc.TiledLayer);
            }
            else if (value.name == "goods") {
                value.zIndex = layerIndex.mActive;
                this.layerGoods = value.getComponent(cc.TiledLayer);
            } 
            else if(value.name == "monster"){
                value.zIndex = layerIndex.mActive;
                this.layerMonster = value.getComponent(cc.TiledLayer);
            }
            else if(value.name == "gate"){
                value.zIndex = layerIndex.mActive;
                this.layerGate = value.getComponent(cc.TiledLayer);
            }
            else if(value.name == "mask1" || value.name == "mask2" || value.name == "pos"){
                // value.setPosition(0);
                value.zIndex = layerIndex.mMask
            }
            else if(value.name == "sence"){
                if(this.mPattern) value.zIndex = layerIndex.mSence;
            }
            else if(value.name == "hideWay"){
                value.zIndex = layerIndex.mHideWay;
            }
        }
        GameSet.initTiledSize(this.layerWall.getMapTileSize()); // 获取当前地图块的大小
        this.tiledCount = cc.v2(this.tiledMap.getMapSize().width, this.tiledMap.getMapSize().height); //获取当前地图大小（块数）
        GameSet.initTiledCount(this.tiledCount);    // 初始化
        this.mapDis = Math.floor(Math.sqrt(Math.pow(this.tiledCount.x, 2) + Math.pow(this.tiledCount.y, 2))) * this.layerWall.getMapTileSize().width;

        let actorUrl: string = null,
            fireUrl: string = null;
        if (this.mPattern) {
            actorUrl = "prefab/animation/walkGirl_1";
            fireUrl = "prefab/animation/fire_red";
        }else {
            actorUrl = "prefab/animation/walkBoy";
            fireUrl = "prefab/animation/fire_blue";
        }
        this._setChip(this.chipSelf, true);
        this._setChip(this.chipOppo, false);

        CommonMgr.loadRes(actorUrl, cc.Prefab, (err, res) => {  // 加载人物
            let a: cc.Node = cc.instantiate(res),
                pos = GameSet.tiledTurnToCoord(this.layerWall, this.mPosNow, eActorOffestx, eActorOffesty);
            a.getComponent('itemActor').init("nodActor",pos, eActorScale, null, false);
            self.nodMap.addChild(a, layerIndex.mActor);
            // a["nodName"] = "nodActor";
            this.nodMaster = a;
        })
        CommonMgr.loadRes(fireUrl, cc.Prefab, (err, res) => {   // 加载火堆
            let a = cc.instantiate(res),
                posV = GameSet.checkMap(objectId.mFire)[0].pos,
                pos = GameSet.tiledTurnToCoord(this.layerWall, posV, eMapOffestx, eMapOffesty);
            a.setPosition(pos);
            a.scale /= 2
            self.nodMap.addChild(a, layerIndex.mGoods);
        })
        CommonMgr.loadRes("prefab/map/itemBigBox", cc.Prefab, (err, res)=>{// 大宝箱
            let a = GameSet.checkMap(objectId.mBigBox);
            for(let k in a){
                let v = a[k];
                let b: cc.Node = cc.instantiate(res);
                self.nodMap.addChild(b, layerIndex.mGoods);
                let pos = GameSet.tiledTurnToCoord(this.layerWall, v.pos, eMapOffestx, eMapOffesty)
                b.setPosition(pos);
            }
        })
        CommonMgr.loadRes("prefab/map/itemOblation", cc.Prefab, (err, res)=>{
            let a = GameSet.checkMap(objectId.mOblation)
            for(let k in a){
                let b: cc.Node = cc.instantiate(res);
                let pos = GameSet.tiledTurnToCoord(this.layerWall, a[k].pos, eMapOffestx, eMapOffesty);
                self.nodMap.addChild(b, layerIndex.mGoods);
                b.setPosition(pos);
            }
        })
        CommonMgr.loadRes("prefab/map/itemOblationOther", cc.Prefab, (err, res)=>{
            let a = GameSet.checkMap(objectId.mOblationOther)
            for(let k in a){
                let b: cc.Node = cc.instantiate(res);
                let pos = GameSet.tiledTurnToCoord(self.layerWall, a[k].pos, eMapOffestx, eMapOffesty);
                self.nodMap.addChild(b, layerIndex.mGoods);
                b.setPosition(pos);
            }
        })
        GameSet.initSkillList();

        if(!GameSet.checkSkill(ePower.nightSee)){ // 没有解锁夜视仪技能 隐藏能量条
            this._hidePowerLine()
        }
    }

    start() {
        this.node.zIndex = 10;
        this.activeButton = cc.find("nodMask2_off", this.pnlGameInter);
        this.nodActive = cc.find("nodButton2", this.pnlGameInter);

        let a = this.layerWall.getPositionAt(this.mPosNow);
        this.node.setPosition(-(a.x + eActorOffestx) * this.nodMap.scaleX, -(a.y + eActorOffesty) * this.nodMap.scaleY);

        setTimeout(() => { // 获取遮罩层
            if (this.mPattern) {
                this.itemView = cc.find("itemView_day", this.node.getParent());
            } else {
                this.itemView = cc.find("itemView_night", this.node.getParent());
            }
        }, 200);

        setTimeout(()=>{
            this._moveCheck();  // 检测周围事件
        })

        this.boyRange = cc.v2(eRangeVecNormal.x, eRangeVecNormal.y);

        if (!this.isNew){// 断线重连
            this.isPlay = true;
            setTimeout(() => { this._connectBack() }, 500);
        }

        Notify.emit(eNotifyEvent.heartLeft, this._countDis(this.mPosNow, this.otherOne), true);   // 人物之间距离
        this.addEvent();
        this.onNetWork();
        this.onEvent();


        // let pos = GameSet.tiledTurnToCoord(this.layerWall, this.mPosNow, eActorOffestx, eActorOffesty);
        // for(let v of this.groundArr){
        //     if(GameSet.isInRange(v, pos)){
        //         return cc.log(v.type);
        //     }
        // }
    }

    update(dt) {
        this.timeLine += dt;
        this.timeLineThis += dt;

        if (this.timeLine > 3 && !this.isPlay) {
            this.isPlay = true;
            GameSet.createBubble("我接下来应该找到莫洛bo", this.nodMap, this.nodMaster);
        }

        if (this.fireLevel == 1) this.isSmallest = true;

        if (this.isHint) this._showCoolNumber();

        if (this.goodsArr.length > 0) {// 木柴重生
            for (let key in this.goodsArr) {
                let value = this.goodsArr[key],
                    pos = value['pos'],
                    time = value["time"];
                if (this.timeLine - time >= goodsResetTime) {
                    this.layerGoods.setTileGIDAt(this.woodTexture, pos, 0); // 重置拾取的物品
                    GameSet.mapChangeJudge(objectId.mWood, pos)
                    this.goodsArr.splice(Number(key), 1);   // 删除数组中的对象
                }
            }
        }

        this._fireLevelJudge(dt);   // 实时更新火堆动态

        if (this.timeLineThis < 3) return;

        if(!this.isMove)    // 如果没有移动，矫正视野框位置
        this.node.setPosition(-this.nodMaster.x * this.nodMap.getScale(), -this.nodMaster.y * this.nodMap.getScale());

    }

    onDestroy() {
        Socket.unreg(eProc.fixhole);
        Socket.unreg(eProc.killmonster);
        Socket.unreg(eProc.move);
        Socket.unreg(eProc.fire);
        Socket.unreg(eProc.succ);
        Socket.unreg(eProc.markmap);
        Socket.unreg(eProc.hurt);
        Socket.unreg(eProc.crtwave);
        Socket.unreg(eProc.pickchip)
        Socket.unreg(eProc.finish);
        Socket.unreg(eProc.door)
        Socket.unreg(eProc.godweapon);
        Socket.unreg(eProc.sacrifice);
        Notify.off(eNotifyEvent.MoveOrder, this._moveOrder);
        Notify.off(eNotifyEvent.Sign, this._sign);
        Notify.off(eNotifyEvent.Active, this._active);
        Notify.off(eNotifyEvent.reConnect, this._reConnect);
    }
    // 注册点击事件
    private addEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.mTouchStart.x = event.getLocation().x;
            this.mTouchStart.y = event.getLocation().y;
        })

        // this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch)=>{})

        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.mTouchEnd.x = event.getLocation().x;
            this.mTouchEnd.y = event.getLocation().y;
            this._judgeWay();
        })

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            this.mTouchEnd.x = event.getLocation().x;
            this.mTouchEnd.y = event.getLocation().y;
            this._judgeWay();
        })
    }
    // 监听服务器事件
    private onNetWork() {
        Socket.reg(eProc.fixhole, this._fixhole, this);
        Socket.reg(eProc.killmonster, this._killmonster, this);
        Socket.reg(eProc.move, this._move, this);
        Socket.reg(eProc.fire, this._fireRange, this);
        Socket.reg(eProc.succ, this._succ, this);
        Socket.reg(eProc.markmap, this._markMap, this);
        Socket.reg(eProc.hurt, this._hurt, this);
        Socket.reg(eProc.crtwave, this._crtWave, this);
        Socket.reg(eProc.firering, this._FireRing, this);
        Socket.reg(eProc.pickchip, this._chipFade, this);
        Socket.reg(eProc.finish, this._finish, this);
        Socket.reg(eProc.door, this._door, this);
        Socket.reg(eProc.godweapon, this._godweapon, this);
        Socket.reg(eProc.sacrifice, this._sacrifice, this);
    }
    // 监听消息事件
    private onEvent() {
        Notify.on(eNotifyEvent.MoveOrder, this._moveOrder, this);
        Notify.on(eNotifyEvent.Sign, this._sign, this);
        Notify.on(eNotifyEvent.Active, this._active, this);
        Notify.on(eNotifyEvent.reConnect, this._reConnect, this);
    }
    // 屏幕事件
    private _judgeWay() {
        let xLen = this.mTouchEnd.x - this.mTouchStart.x;
        let yLen = this.mTouchEnd.y - this.mTouchStart.y;
        if (Math.abs(xLen) < 10 && Math.abs(yLen) < 10) { // 判断为点击事件
            this.mTouchEnd = this.nodMap.convertToNodeSpaceAR(this.mTouchEnd);
            let mClickDot = GameSet.countTile(this.mTouchEnd);
            if (this.mPattern) {
                // this._clickEventDay(mClickDot);
            } else {
                this._clickEventNight(mClickDot, this.mTouchEnd);
            }
            return;
        }
        if (this.isMove || this.allSucc) return;
        let dis = MoveControl.mouseMove(xLen, yLen);
        return;
        this._moveEvent(dis);
    }
    // 黑夜中的点击事件
    private _clickEventNight(mClickDot: cc.Vec2, mTouchEnd: cc.Vec2) {
        let self = this,
        // 点击范围限制
            dis = Math.abs(Math.sqrt(Math.pow(this.nodMaster.x - mTouchEnd.x, 2) + Math.pow(this.nodMaster.y - mTouchEnd.y, 2))) * this.nodMap.scale,
            range = this.itemView.width*this.itemView.getScale() / 2;
        if (dis > range) return;
        CommonMgr.loadRes("prefab/animation/itemWave", cc.Prefab, (err, res) => {
            let a = cc.instantiate(res);
            a.getComponent("itemWave").init(this.mTouchEnd, this.nodMaster, this.nodMap.scale);
            self.itemView.addChild(a, layerIndex.mEffect);
        }); // 男孩任何点击都会出现涟漪
        if(MoveControl.boyClickJudge(GameSet.checkMap(objectId.mPool), mClickDot, this.mPosNow, this.boyRange, true)){
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_water");
        }
        else if(MoveControl.boyClickJudge(GameSet.checkMap(objectId.mPool), mClickDot, this.mPosNow, this.boyRange)){
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_wateraround");
        }
        else if(MoveControl.boyClickJudge(GameSet.checkMap(objectId.mTrap), mClickDot, this.mPosNow, this.boyRange)){
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_holearound");
        }
        else if(MoveControl.boyClickJudge(GameSet.checkMap(objectId.mTrap), mClickDot, this.mPosNow, this.boyRange, true)){
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_hole_down");
        }
        else if (MoveControl.boyClickJudge(GameSet.checkMap(objectId.mBoss), mClickDot, this.mPosNow, this.boyRange, true)) {
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_monster_sound");
        }
        else if(MoveControl.boyClickJudge(GameSet.checkMap(objectId.mBoss), mClickDot, this.mPosNow, this.boyRange)) {
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_monster_sound");
        }
        else if(MoveControl.boyClickJudgeLayer(this.layerWall, mClickDot, this.mPosNow, this.boyRange)){
            return;
        }else{
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_step_grass");
        }
    }
    // 移动事件
    private _moveEvent(dis) {
        let a = Util.clone(this.mPosNow)
        let c = cc.v2(a.x + dis.x, a.y + dis.y)
        let t = GameSet.checkDetail(objectId.mTrap, c)
        if(GameSet.checkDetail(objectId.mTrap, c) && !this.mPattern){
            if(!GameSet.checkDetail(objectId.mTrap, c).judge){
                GameSet.createBubble("前方是一个深渊", this.nodMap, this.nodMaster);
                return
            }
        }
        if(GameSet.checkDetail(objectId.mWaterTrap, c)){
            if(!t){
                if(this.mPattern && !GameSet.checkSkill(ePower.walkOnWater)){   // 没有此项能力的白天
                    GameSet.createBubble("需要获得新的能力才能通过", this.nodMap, this.nodMaster);
                    return
                }
                if(!this.mPattern){
                    GameSet.createBubble("前面是个水域，无法通过!", this.nodMap, this.nodMaster)
                    return;
                }
            }  
        }

        let s = GameSet.checkDetail(objectId.mStressDoor, c);
        if(s && !s.judge){
            GameSet.createBubble("通过才上压力板打开此门", this.nodMap, this.nodMaster);
            return;
        }

        if(GameSet.checkDetail(objectId.mFire, c)){
            return;
        }
        if(GameSet.checkDetail(objectId.mGate,c)){
            if(!GameSet.checkDetail(objectId.mGate, c).judge) return;
        }
        if (this.layerWall.getTileGIDAt(c)) {
            GameSet.createBubble("前面被挡着了，换个方向", this.nodMap, this.nodMaster);
            if(!this.mPattern){
                GameSet.loadWall(c, this.nodMap, this.groundArr, this.layerWall);
            }
            return;
        }
        if(!this.mPattern){this._showTrack(this.mPosNow, dis, 30, !this.mPattern);}
        let posInit = Util.clone(this.mPosNow);
        this.mLastPos = Util.clone(this.mPosNow);
        this.mPosNow.x += dis.x;
        this.mPosNow.y += dis.y;
        this._createTrack(this.mPosNow, dis);
        let b = cc.v2(-dis.x * tileSize * this.nodMap.scaleX, dis.y * tileSize * this.nodMap.scaleY);
        if (dis.x) this.nodMaster.scaleX = -dis.x * Math.abs(this.nodMaster.scaleX);
        this._checkSucc();
        if(GameSet.showGameState()){
            this.isMove = true;
            this._run(b);
            let dis1 = GameSet.pointsDis(this.otherOne, posInit),
                dis2 = GameSet.pointsDis(this.otherOne, this.mPosNow),
                isRunOut = false,
                isRunIn = false;
            if(dis2-dis1>0){ // 远离虚影
                if(dis1 > Math.sqrt(2)) return
                if(dis2>Math.sqrt(2) && dis2 < Math.sqrt(8)) isRunOut = true;
            }
            else {
                if(dis2>=2) return
                if(dis2>=1 && dis2<2) isRunIn = true;
            }
            if(isRunOut){
                if(this.oppoShadow){
                    setTimeout(()=>{
                        this.oppoShadow.runAction(cc.fadeOut(0.3));
                    }, 300)
                }
            }
            if(isRunIn){
                let pos = GameSet.tiledTurnToCoord(this.layerWall, Util.clone(this.otherOne), eMapOffestx, eMapOffesty);
                if(this.oppoShadow){
                    setTimeout(() => {
                        this.oppoShadow.setPosition(pos)
                        this.oppoShadow.runAction(cc.fadeTo(0.3, 100));
                    }, 300);
                }else{
                    GameSet.loadActorShadow(pos, this.nodMap, !this.mPattern, (res)=>{
                        this.oppoShadow = res;
                    });
                }
              
            }
        }
        // 展示倒影
        // for(let v in shadowTexture){
        //     if(this.layerLawn.getTileGIDAt(this.mPosNow) == Number(v)){
        //         setTimeout(()=>{ this.nodMaster.children[2].active = true }, 300)
        //         break;
        //     }
        // }   
    }
    // 监听遥感事件
    private _moveOrder(param) {
        if (this.isMove || this.allSucc) return;
        this._moveEvent(param[0]);
    }
    // 检测说否达成通关条件
    private _checkSucc(){
        if(!GameSet.showGameState()) return;
        let result = Socket.result(eProc.succ)
        let a = GameSet.checkMap(objectId.mDestination);
        if((this.mPosNow.x == a[0].pos.x && this.mPosNow.y == a[0].pos.y && this.otherOne.x == a[1].pos.x && this.otherOne.y == a[1].pos.y) || (this.otherOne.x == a[0].pos.x && this.otherOne.y == a[0].pos.y && this.mPosNow.x == a[1].pos.x && this.mPosNow.y == a[1].pos.y)){
            if(this.isSelfHad && this.isOppoHad){
                if(this.isNeedGod){
                    if(this.isGodMachine) Socket.send(result);
                }else{
                    Socket.send(result);
                }
            }
        }
    }
    // 接收游戏成功消息
    private _succ(data) {
        if (data["code"] != 0) return;
        let self = this;
        this._record(data.data.param.skill)
        UserMgr.onPassLeavel();
        this.allSucc = true;
        GameSet.gameOut();
        GameSet.stopMusic();
        UserMgr.getUser().param.passTime = data.time;
        if (!this.dieCount && !this.otherDieCunt) UserMgr.onGetAchieve(1004); // 满血通关
        UserMgr.onGetAchieve(1001); // 首次通关
        for (let value of this.chipGetArr) {
            UserMgr.AddChip(value);
        }
        if (!this.isSmallest) UserMgr.onGetAchieve(1003);   // 维持火堆未到最小通关
        if (this.mPattern) {
            UserMgr.onGetAchieve(1009);
        } else {
            UserMgr.onGetAchieve(1008);
        }
        if (UserMgr.CurrentLeavel() == 7) { UserMgr.onGetAchieve(1005) }
        setTimeout(() => {
            self.pnlGameInter.destroy();
            UserMgr.OnExitGame();
            if(data["data"].needBoard){
                CommonMgr.loadRes("prefab/ui/message/pnlCreateMessage", cc.Prefab, (err, res) => {
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("pnlCreateMessage").init(false);
                    cc.find("Canvas").addChild(a);
                })
            }
        }, 1000)

    }
    // 移动
    private _run(b: cc.Vec2) {
        let self = this,
            xPos = this.layerWall.getPositionAt(this.mPosNow).x + eActorOffestx,
            yPos = this.layerWall.getPositionAt(this.mPosNow).y + eActorOffesty,
            aniMaster = cc.moveTo(0.6, xPos, yPos),
            isLimit = false;
        this.nodActive.active = false;
        this.nodMaster.runAction(aniMaster);
        Notify.emit(eNotifyEvent.AniPlay, true, "nodActor");
        Notify.emit(eNotifyEvent.heartLeft, this._countDis(this.mPosNow, this.otherOne));
        setTimeout(() => {
            Notify.emit(eNotifyEvent.AniPlay, false, "nodActor");
            // 判断人物停留位置是否会死亡
            if (!this.mPosNow) return;
            if(MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mTrap))) this._beHurt();
            if(MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mPool))) this._beHurt();
            
            if(this.mPattern){
                let a = MoveControl.ninePiont(GameSet.checkMap(objectId.mBoss), this.mPosNow, true);
                if(a){
                    isLimit = true;
                    let posN = GameSet.tiledTurnToCoord(this.layerWall, a, eActorOffestx, eActorOffesty)
                    let type = GameSet.checkDetail(objectId.mBoss, a);
                    this._showMonster(posN, true, type);
                }
                if(MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mMonster))){
                    isLimit = true;
                    let type = GameSet.checkDetail(objectId.mMonster, a);
                    this._showMonster(cc.v2(xPos, yPos), false, type);
                } 
                let c = MoveControl.ninePiont(GameSet.checkMap(objectId.mMonster), this.mPosNow);
                if(c) {
                    isLimit = true;
                    this._beTrapped();
                }
            }else{
                if(MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mMonster))){
                    isLimit = true;
                    let type = GameSet.checkDetail(objectId.mMonster, this.mPosNow)
                    this._showMonster(cc.v2(xPos, yPos), false, type);
                }
                else if(MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mBoss))){
                    isLimit = true;
                    let type = GameSet.checkDetail(objectId.mBoss, this.mPosNow)
                    this._showMonster(cc.v2(xPos, yPos), true, type);
                }
            }
            // 判断人物停留位置是否可以交互
            // 检查周围是否有危险
            let b
            if(this.mPattern) b = MoveControl.checkDanger(this.mPosNow, this.mPattern, this.isHaveGoods);
            if (b) GameSet.createBubble(b, this.nodMap, this.nodMaster);
        }, 600);    // 人物移动

        setTimeout(() => {
            self.node.runAction(cc.moveBy(0.4, b));
        }, 100);    // 屏幕移动
        setTimeout(() => { 
            this.nodActive.active = true;
            this._moveCheck();
            if(isLimit) return;
            this.isMove = false;
            this._checkStress(this.mPosNow, this.mLastPos);
        }, 610);    // 可再次移动
    }
    // 检测是否站在压力板上
    private _checkStress(pos: cc.Vec2, lastPos: cc.Vec2, isMine: boolean = true){
        let a = GameSet.checkDetail(objectId.mStressKey, pos);
        if(a){
            GameSet.createBubble("一个门已经打开", this.nodMap, this.nodMaster);
            this._openStress(pos, isMine);
        }else{
            if(!lastPos) return;
            let b = GameSet.checkDetail(objectId.mStressKey, lastPos);
            if(b){
                this._closeStress(lastPos, isMine);
            }
        }
    }
    // 进入压力板 开启门
    private _openStress(pos: cc.Vec2, isMine: boolean = true){
        let detail = GameSet.checkDetail(objectId.mStressKey, pos)
        let posN = GameSet.strTurnToV2(detail.door);
        GameSet.loadDoor(posN, detail.type, this.nodMap, this.layerWall, (res)=>{
            if(isMine){
                this.stressDoor1 = res;
            }else{
                this.stressDoor2 = res;
            }
        })
        GameSet.mapChangeJudge(objectId.mStressDoor, posN, true);
    }
    // 离开压力板 关闭门
    private _closeStress(pos: cc.Vec2, isMine: boolean = true){
        let detail = GameSet.checkDetail(objectId.mStressKey, pos);
        let posN = GameSet.strTurnToV2(detail.door)
        if(isMine){
            if(this.stressDoor1) this.stressDoor1.destroy();
           
        }else{
            if(this.stressDoor2) this.stressDoor2.destroy();
        }
        GameSet.mapChangeJudge(objectId.mStressDoor, posN, false);
    }
    // 展示怪物
    private _showMonster(pos: cc.Vec2, isBoss: boolean, type: number, isHurt: boolean = true) {
        let url: string;
        if(isBoss){
            GameSet.checkDetail(objectId.mBoss, pos)
            url = GameSet.RudInf("BossUrl");
        }else{
            url = GameSet.RudInf("MonsterUrl");
        }
        CommonMgr.loadRes("prefab/map/itemMonster", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemMonster").init(url, pos);
            this.nodMap.addChild(a, layerIndex.mMonster)
        })
        if(isHurt){
            setTimeout(()=>{ this._beHurt() }, 1500)
            setTimeout(()=>{ this.isMove = false }, 1510);
        }
    }
    // 拾起木板
    private _pickUp(pos: cc.Vec2) {
        if(!this.woodTexture) this.woodTexture = this.layerGoods.getTileGIDAt(pos);
        GameSet.mapChangeJudge(objectId.mWood, pos);
        this.layerGoods.setTileGIDAt(0, pos, 0);
        let result = Socket.result(eProc.operate);
        result.data["type"] = 8;
        result.data["value"] = `${pos.x}-${pos.y}`;
        if(GameSet.showGameState()) Socket.send(result);
        let obj = new Object();
        obj["pos"] = pos;
        obj["time"] = this.timeLine;
        this.goodsArr.push(obj);
        let actorPos = cc.v2(this.nodMaster.x, this.nodMaster.y);
        this._changeActorAni(actorPos, true)
    }
    // 放下木板
    private _putDown() {
        let actorPos = cc.v2(this.nodMaster.x, this.nodMaster.y);
        this._changeActorAni(actorPos, false);
    }
    // 改变角色运动动画
    private _changeActorAni(pos: cc.Vec2, hasWood: boolean) {
        let self = this,
            url: string;
        if (hasWood) {
            url = "prefab/animation/walkGirl_2";
        } else {
            url = "prefab/animation/walkGirl_1";
        }
        CommonMgr.loadRes(url, cc.Prefab, (err, res) => {
            let IsShadow = false,
                mFaceTo = self.nodMaster.scaleX / Math.abs(self.nodMaster.scaleX), 
                a = cc.instantiate(res);
            Notify.emit(eNotifyEvent.ChangeActor, a);
            a.getComponent('itemActor').init("nodActor", pos, eActorScale, mFaceTo, IsShadow);
            self.nodMap.addChild(a, layerIndex.mActor);
            self.nodMaster.destroy();
            self.nodMaster = a;
            self.nodMaster.opacity = (self.dieCountMax - self.dieCount) / self.dieCountMax * 100 + 155;
            self.isHaveGoods = hasWood;
        })
    }
    // 使用喇叭
    private _useHorn(pos: cc.Vec2) {
        this.layerGoods.setTileGIDAt(0, pos, 0);
        GameSet.mapChangeJudge(objectId.mHorn, pos)
        let result = Socket.result(eProc.crtwave);
        result.data["value"] = `${pos.x}-${pos.y}`;
        if(!GameSet.showGameState()) return;
        Socket.send(result);
    }
    // 使用火环
    private _useMaimang(pos: cc.Vec2) {
        this.layerGoods.setTileGIDAt(0, pos, 0);
        GameSet.mapChangeJudge(objectId.mFireRing, pos);
        let result = Socket.result(eProc.firering);
        result.data["value"] = `${pos.x}-${pos.y}`;
        if(GameSet.showGameState()) Socket.send(result);
        this._showCoolNumber();
    }
   // 检查周围是否有怪物
    private _checkMonster() {
        let a = MoveControl.ninePiont(GameSet.checkMap(objectId.mMonster), this.mPosNow);
        let b = MoveControl.ninePiont(GameSet.checkMap(objectId.mBoss), this.mPosNow);
        if(a) return a;
        if(b) return b;
        return {judge: false}
    }
    // 被小怪困住
    private _beTrapped() {
        GameSet.createBubble("不好，这附近会被一直缠绕住", this.nodMap, this.nodMaster);
        this.isMove = true;
        setTimeout(()=>{
            this.isMove = false;
        }, 3000)
    }
    // 人物受伤
    private _beHurt() {
        if (this.mPattern) {
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_girl_hited");
        } else {
            Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_boy_hited");
        }
        UserMgr.onGetAchieve(1010);
        this.dieCount++;
        this._reduceLife();
        // this.lblDieCount.string = `${this.dieCount}/${this.dieCountMax}`;
        if (this.dieCount >= this.dieCountMax) {
            UserMgr.onGetAchieve(1007);
            let result1 = Socket.result(eProc.exit);
            result1.data["isDie"] = 1;
            result1.data["sender"] =  UserMgr.getUser().uid;
            if(GameSet.showGameState()) Socket.send(result1);
            return;
        }
        let result = Socket.result(eProc.hurt);
        if(GameSet.showGameState()) Socket.send(result);

        this.nodMaster.opacity = (this.dieCountMax - this.dieCount) / this.dieCountMax * 100 + 125;
        let a = GameSet.tiledTurnToCoord(this.layerWall, this.mInitPos, eActorOffestx, eActorOffesty);
        let ani1 = cc.moveTo(0.3, -a.x * this.nodMap.scaleX, -a.y * this.nodMap.scaleY);
        this.node.runAction(ani1);
        this.nodMaster.setPosition(a);
        this.mPosNow = Util.clone(this.mInitPos);
        let b = Socket.result(eProc.move);
        b.data["pos"] = this.mPosNow;
        if(GameSet.showGameState()) Socket.send(b);
    }
    // 添加火把后火焰变大
    private _fireBigger() {
        if (this.fireLevel < 3) this.fireLevel++;
        this.fireChangeTime = fireResetTime * this.woodCount;
        this.woodCount++;
        let itemView: cc.Node = this.itemView;
        if (this.fireLevel == 2) {
            itemView.setScale(fireSizeNormal);
        }
        else if (this.fireLevel == 3) {
            itemView.setScale(fireSizeBigger);
            UserMgr.onGetAchieve(1002);
        }
        this.fireChange();
    }
    // 火堆最小状态
    private _fireSmaller() {
        this.fireChangeTime = fireResetTime;
        this.itemView.setScale(fireSizeSmaller)
    }
    // 火焰正常状态
    private _fireNormal() {
        this.fireChangeTime = fireResetTime;
        this.itemView.setScale(fireSizeNormal)
    }
    // 清除女孩场景上的深渊
    private _clearGirlTrap(pos) {
        this.layerTrap.setTileGIDAt(0, pos, 0);
        GameSet.mapChangeJudge(objectId.mTrap, pos);
        GameSet.loadTrapCover(pos, GameSet.checkDetail(objectId.mTrap, pos).type, this.nodMap, this.layerWall);
        let result = Socket.result(eProc.fixhole);
        result.data["pos"] = pos;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 清除男孩场景上的深渊
    private _clearBoyTrap(pos) {
        this.layerWall.setTileGIDAt(0, pos, 0);
        GameSet.mapChangeJudge(objectId.mTrap, pos);
        GameSet.mapAddObj(objectId.mTrapCover, pos)
    }
    // 清除男孩场景上的怪物
    private _clearBoyMonster(pos, isBoss) {
        if(isBoss){
            GameSet.mapChangeJudge(objectId.mBoss, pos);
            MoveControl.clearRound(this.layerMonster, pos);
        }else{
            this.layerMonster.setTileGIDAt(0, pos, 0);
            GameSet.mapChangeJudge(objectId.mMonster, pos);
        }
        GameSet.loadGrave(pos, this.nodMap, this.layerWall, isBoss, this.mPattern)
        this.monsterArr.push(pos);
        this.addPowerLocal(powerAddByKill);
        let result = Socket.result(eProc.killmonster);
        result.data["pos"] = pos;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 发送足迹消息
    private _createTrack(pos, dire) {
        let result = Socket.result(eProc.move);
        result.data["pos"] = pos;
        if (dire) result.data["dire"] = dire;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 展示队友脚印
    private _showTrack(pos: cc.Vec2, dire:cc.Vec2, time: number, mPattern: boolean = this.mPattern) {
        let self = this;
        let posA = this.layerWall.getPositionAt(pos);
        if (mPattern) { // 白天展示脚印
            let mAngle: number = null;
            if (dire.x) {
                if (dire.x < 0) {
                    mAngle = 270;
                } else {
                    mAngle = 90;
                }
            } else {
                if (dire.y < 0) {
                    mAngle = 0;
                } else {
                    mAngle = 180;
                }
            }
            for(let k in this.nodMap.children){
                let v = this.nodMap.children[k];
                if(v.x == posA.x + eActorOffestx && v.y == posA.y + eActorOffesty && v.name == "itemTrack"){
                    v.destroy();
                }
            }
            CommonMgr.loadRes("prefab/map/itemTrack", cc.Prefab, (err, res) => {
                let a = cc.instantiate(res);
                a.getComponent("itemTrack").init(mAngle, time);
                self.nodMap.addChild(a, layerIndex.mFootPrint);
                a.setPosition(posA.x+eActorOffestx, posA.y+eActorOffesty)
            })
        }
        else {   // 夜晚展示声波
            posA.x += eActorOffestx;
            posA.y += eActorOffesty;
            CommonMgr.loadRes("prefab/animation/itemWave", cc.Prefab, (err, res) => {
                let a = cc.instantiate(res);
                a.getComponent("itemWave").init(posA, this.nodMaster, this.nodMap.scale);
                self.itemView.addChild(a, layerIndex.mEffect);
            })
        }
    }
    // 接受怪物被清除消息
    private _clearGirlMonster(param) {
        let self = this;
        if(MoveControl.judge(param, GameSet.checkMap(objectId.mBoss))){
            MoveControl.clearRound(this.layerMonster, param)
            GameSet.mapChangeJudge(objectId.mBoss, param)
            GameSet.loadGrave(param, this.nodMap, this.layerWall, true, this.mPattern); // 设置墓碑
            let detail = GameSet.checkDetail(objectId.mBoss, param)
            if(detail["isSkill"] && !GameSet.checkSkill(detail["isSkill"])){
                CommonMgr.loadRes("prefab/map/itemBigBox", cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    self.nodMap.addChild(a, layerIndex.mActive);
                    let pos = GameSet.tiledTurnToCoord(this.layerWall, param, eMapOffestx, eMapOffesty)
                    a.setPosition(pos)
                    GameSet.mapAddObj(objectId.mBigBox, param, null, { "power" : detail["isSkill"]})
                })
            }
            if(!this.isGodMachine && detail["isGod"]){
                CommonMgr.loadRes("prefab/map/itemGodMachine", cc.Prefab, (err, res)=>{
                    let a: cc.Node = cc.instantiate(res);
                    a.getComponent("itemGodMachine").init(this.roundInfo['GodUrl'])
                    self.nodMap.addChild(a, layerIndex.mActive);
                    let b = GameSet.tiledTurnToCoord(this.layerWall, param, eMapOffestx, eMapOffesty);
                    a.setPosition(b);
                    GameSet.mapAddObj(objectId.mGodMachine, Util.clone(param));
                })
            }
        }else{
            this.layerMonster.setTileGIDAt(0, param, 0);
            GameSet.mapChangeJudge(objectId.mMonster, param)
            GameSet.loadGrave(param, this.nodMap, this.layerWall, false, this.mPattern);
        }
    }
    // 接收深渊被填补上消息
    private _fixhole(data) {
        if (data["code"] != 0) return;
        let param = data["data"];
        this._clearBoyTrap(param.pos);
    }
    // 清除女孩场景上的怪物
    private _killmonster(data) {
        if (data["code"] != 0) return;
        let param = data["data"];
        this._clearGirlMonster(param.pos);
    } 
    // 队友移动事件
    private _move(data) {
        if (data["code"] != 0) return;
        let param = data["data"];
        if (param.dire) this._showTrack(param.pos, param.dire, 5);
        let posInit = Util.clone(this.otherOne);
        this.mLastOther = posInit
        this.otherOne = param.pos;
        this._shadowOther(posInit);
        this._checkStress(this.otherOne, this.mLastOther, false)
      
        Notify.emit(eNotifyEvent.heartRight, this._countDis(this.mPosNow, this.otherOne));
        this._checkSucc();
    }

    private _shadowOther(posInit: cc.Vec2){
        let dis1 = GameSet.pointsDis(this.mPosNow, posInit),
            dis2 = GameSet.pointsDis(this.mPosNow, this.otherOne),
            faceTo = 1,
            pos = GameSet.tiledTurnToCoord(this.layerWall, posInit, eMapOffestx, eMapOffesty),
            posTarget = GameSet.tiledTurnToCoord(this.layerWall, this.otherOne, eMapOffestx, eMapOffesty),
            isRunIn = false,
            isRunOut = false;
        if(this.otherOne.x != posInit.x){
            if(this.otherOne.x-posInit.x>0) faceTo = -1;
        }else{
            if(this.oppoShadow) faceTo = this.oppoShadow.scaleX>0 ? 1 : -1;
        }
        if(dis2-dis1>0){    // 队友远离自己
            if(dis1>Math.sqrt(2)) return;
            if(dis2>Math.sqrt(2) && dis2<Math.sqrt(6)) isRunOut = true;
        }else{
            if(dis2 > Math.sqrt(5))return;
            if(dis2>=1 && dis2 < 2) isRunIn = true;
        }
        setTimeout(()=>{
            Notify.emit(eNotifyEvent.AniPlay, false, "itemActorShadow");
        }, 600)
        if(this.oppoShadow){
            Notify.emit(eNotifyEvent.AniPlay, true, "itemActorShadow");
            if(isRunIn){
                this.oppoShadow.setPosition(pos)
                this.oppoShadow.runAction(cc.moveTo(0.6, posTarget))
                setTimeout(()=>{
                    this.oppoShadow.runAction(cc.fadeTo(0.3, 100));
                }, 300)
                return;
            }
            if(isRunOut){
                this.oppoShadow.scaleX = faceTo * Math.abs(this.oppoShadow.scaleX);
                setTimeout(()=>{
                    this.oppoShadow.runAction(cc.fadeTo(0.3, 0));
                }, 300)
                this.oppoShadow.runAction(cc.moveTo(0.6, posTarget))
                return;
            }
            this.oppoShadow.runAction(cc.moveTo(0.6, posTarget))
            this.oppoShadow.scaleX = faceTo * Math.abs(this.oppoShadow.scaleX);
            
        }else{
            if(isRunIn){
                GameSet.loadActorShadow(pos, this.nodMap, !this.mPattern, (res)=>{
                    this.oppoShadow = res;
                    res.runAction(cc.moveTo(0.6, posTarget));
                }, faceTo)  
                return;
            }
        }
    }
    // 火焰改变消息
    private _fireRange(param) {
        if (param["code"] != 0) return;
        this.fireLevel = param["data"].lvl;
        if (this.fireLevel == 1) {
            this.itemView.setScale(fireSizeSmaller);
        }
        else if (this.fireLevel == 2) {
            this.itemView.setScale(fireSizeNormal);
        }
        else {  
            this.itemView.setContentSize(fireSizeBigger, fireSizeBigger)
        }
    }
    // 自己标记，并传达给对方
    private _sign(param) { 
        this._setSign(this.mSignArr, param[0], this.mPosNow, true)
        this._moveCheck()
        let result = Socket.result(eProc.markmap);
        result.data["pos"] = cc.v2(this.mPosNow.x, this.mPosNow.y);
        result.data["judge"] = param[0];
        result.data["isAdd"] = true;
        let obj = new Array<Object>();
        for (let key in this.mSignArr) {
            let value = this.mSignArr[key];
            let a = new Object();
            a["pos"] = value["pos"];
            a["judge"] = value["judge"];
            obj.push(a);
        }
        result.data["value"] = obj;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 接受对方传达的标记消息
    private _markMap(data) {
        if (data["code"] != 0) return;
        let param = data["data"];
        if (param["isAdd"]) {
            this._setSign(this.InSignArr, param["judge"], param["pos"], false);
        } else {
            let pos: cc.Vec2 = param["pos"];
            for (let key in this.InSignArr) {
                let value = this.InSignArr[key];
                if (pos.x == value["pos"].x && pos.y == value["pos"].y) value["node"].destroy();
            }
        }
    }
    // 队友受伤后收到的消息
    private _hurt(data) {
        if (data["code"] != 0) return;
        this.otherDieCunt++;
        GameSet.createBubble("小心，不要再受到伤害", this.nodMap, this.nodMaster);
    }
    // 竖琴使用后接收到的消息
    private _crtWave(param) {
        if (param["code"] != 0) return;
        GameSet.createBubble("我听见你了，亲爱的", this.nodMap, this.nodMaster);
    }
    // 道具火环使用后接受到的消息
    private _FireRing(param) {
        if (param["code"] != 0) return;
        GameSet.createBubble("我看见你了，你在那儿", this.nodMap, this.nodMaster);
    }
    // 队友捡取碎片消息
    private _chipFade(param) {
        if (param["code"] != 0) return;
        let str = param.data["value"];
        this._clearChip(str, this.chipOppo);
    }
    // 游戏以外结束消息
    private _finish(param) {
        if (param["code"] != 0) return;
        this.isMove = true;
        GameSet.gameOut();
        if(!this.isShowOver){
            this.isShowOver = true;
            UIMgr.Instance().alert("", "游戏已结束", "确认", () => {
                this.pnlGameInter.destroy();
            })    
        }
    }
    // 接受机关打开消息
    private _door(param) {
        if (param["code"] != 0) return;
        this._clearKey(param.data.value, !this.mPattern);
        this._checkDoor(param.data.value)
    }
    // 接受是否获取到神器的消息
    private _godweapon(param){
        if(param["code"] != 0) return;
        this.isGodMachine = true;
    }
    // 确定队友获取祭品
    private _sacrifice(param){
        if(param["code"] != 0) return;
        this.isOppoHad = true;
        let pos = GameSet.tiledTurnToCoord(this.layerWall, param["data"], eMapOffestx, eMapOffesty)
        for(let k in this.nodMap.children){
            let v = this.nodMap.children[k]
            if(v.name == "itemOblationOther" && v.x == pos.x && v.y == pos.y){
                v.destroy();
            }
        }
        GameSet.mapChangeJudge(objectId.mOblationOther, param["data"]);
    }
    // 显示标记
    private _setSign(arr, judge: boolean, tiledPos: cc.Vec2, isMine: boolean) {
        let self = this;
        let obj = new Object();
        let isCoincide: boolean = false;
        obj["pos"] = cc.v2(tiledPos.x, tiledPos.y);
        if(GameSet.checkDetail(objectId.mMark, this.mPosNow)){
            GameSet.mapChangeJudge(objectId.mMark, this.mPosNow);
        }else{
            GameSet.mapAddObj(objectId.mMark, Util.clone(this.mPosNow));
        }
        if(judge){
            CommonMgr.loadRes("prefab/map/itemMarkMap_good", cc.Prefab, (err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                self.nodMap.addChild(a, layerIndex.mGoods);
                obj["node"] = a;
                if (isMine) {
                    a.setPosition(self.layerWall.getPositionAt(tiledPos).x + eActorOffestx + 35, self.layerWall.getPositionAt(tiledPos).y + eActorOffesty + 30);
                } else {
                    a.setPosition(self.layerWall.getPositionAt(tiledPos).x + eActorOffestx - 35, self.layerWall.getPositionAt(tiledPos).y + eActorOffesty - 30)
                }
            })
        }
        else{
            CommonMgr.loadRes("prefab/map/itemMarkMap_bad", cc.Prefab,(err, res)=>{
                let a: cc.Node = cc.instantiate(res);
                self.nodMap.addChild(a, layerIndex.mGoods);
                obj["node"] = a;
                if (isMine) {
                    a.setPosition(self.layerWall.getPositionAt(tiledPos).x + eActorOffestx + 35, self.layerWall.getPositionAt(tiledPos).y + eActorOffesty + 30);
                } else {
                    a.setPosition(self.layerWall.getPositionAt(tiledPos).x + eActorOffestx - 35, self.layerWall.getPositionAt(tiledPos).y + eActorOffesty - 30)
                }
            })
        }
        obj["judge"] = judge;
        // 在已存在标记的地方重复标记，替换原有标记
        for (let key in arr) {
            let value = arr[key];
            if (tiledPos.x == value["pos"].x && tiledPos.y == value["pos"].y) {
                arr[key] = obj;
                isCoincide = true;
                GameSet.detele(this.nodMap, value["node"]);
                break;
            }
        }
        if (isCoincide) return; // 没有重复的
        if (arr.length >= 3) {
            GameSet.mapChangeJudge(objectId.mMark, arr[0].pos)
            GameSet.detele(this.nodMap, arr[0].node);
            arr.push(obj);
            arr.shift();
        } else {
            arr.push(obj);
        }
    }
    // 清除标记
    private _clearSign(pos: cc.Vec2) {
        for (let key in this.mSignArr) {
            let value = this.mSignArr[key];
            GameSet.mapChangeJudge(objectId.mMark, pos)
            if (value["pos"].x == pos.x && value["pos"].y == pos.y) {
                GameSet.detele(this.nodMap, value["node"])
                this.mSignArr.splice(Number(key), 1);
                let result = Socket.result(eProc.markmap);
                result.data["isAdd"] = false;
                result.data["pos"] = value["pos"];
                let obj = new Array<Object>();
                for (let key in this.mSignArr) {
                    let value = this.mSignArr[key];
                    let a = new Object();
                    a["pos"] = value["pos"];
                    a["judge"] = value["judge"];
                    obj.push(a);
                }
                result.data["value"] = obj;
                if(GameSet.showGameState()) Socket.send(result);
            }
        }
    }
    // 交互按钮的点击后， 逻辑
    private _active(param) {
        if(!!!param[0]){
            this._moveCheck();
            return;
        }
        if (MoveControl.judge(this.mPosNow, GameSet.checkMap(objectId.mMark))) {
            // 取消标记
            this._clearSign(this.mPosNow);
            if (!this.mPattern && GameSet.checkSkill(ePower.nightSee)){
                GameSet.changeButtonName("夜视仪");
            }
            return;
        }
        let a = MoveControl.checkRound(this.mPosNow, this.mPattern, this.isHaveGoods);
        switch(a.id){
            case objectId.mOblation:    // 获取到祭品
                var p = MoveControl.FourPoint(GameSet.checkMap(objectId.mOblation), this.mPosNow, true);
                if(p){
                    this.isSelfHad = true;
                    for(let k in this.nodMap.children){
                        let v = this.nodMap.children[k];
                        let pos = GameSet.tiledTurnToCoord(this.layerWall, p, eMapOffestx, eMapOffesty);
                        if(v.name == "itemOblation" && v.x == pos.x && v.y == pos.y) v.destroy();
                    }
                    GameSet.mapChangeJudge(objectId.mOblation, p);
                    let resultA = Socket.result(eProc.operate);
                    resultA.data["type"] = 16;
                    resultA.data["value"] = p;
                    resultA.data["state"] = 1;
                    Socket.send(resultA);
                } 
                return;
            case objectId.mChip:
                var p = MoveControl.FourPoint(GameSet.checkMap(objectId.mChip), this.mPosNow, true);
                if(p) this._pickChip(p);
                return;
            case objectId.mKey:
                var p = MoveControl.FourPoint(GameSet.checkMap(objectId.mKey), this.mPosNow, true);
                if(p) this._openGate(p);
                return;
            case objectId.mBigBox:
                var p = MoveControl.FourPoint(GameSet.checkMap(objectId.mBigBox), this.mPosNow, true);  // 大宝箱 获取能力
                if(p){
                    let power = Number(GameSet.checkDetail(objectId.mBigBox, p).power);
                    var result = Socket.result(eProc.operate);
                    result.data["type"] = 18
                    result.data["value"] = { "id" : power, "pos" : p }
                    Socket.send(result);
                    GameSet.checkSkill(power);  // 同步到网络
                    switch(power){
                        case ePower.nightSee:
                            this._showPowerLine()
                            break;
                    }
                    GameSet.getPowerRemind(power);
                    GameSet.getSkill(power);
                    for(let k in this.nodMap.children){
                        let v = this.nodMap.children[k];
                        let pos = GameSet.tiledTurnToCoord(this.layerWall, p, eMapOffestx, eMapOffesty);
                        if(v.name == "itemBigBox" && v.x == pos.x && v.y == pos.y){
                            v.destroy();
                        }
                    }
                    GameSet.mapChangeJudge(objectId.mBigBox, p);
                }
                return;
        }
        if(this.mPattern){
            switch(a.id){
                case objectId.mWood: 
                    var pos = MoveControl.FourPoint(GameSet.checkMap(objectId.mWood), this.mPosNow, true);
                    if (pos && !this.isHaveGoods) this._pickUp(pos);
                    break;
                case objectId.mTrap:
                    var pos = MoveControl.FourPoint(GameSet.checkMap(objectId.mTrap), this.mPosNow, false);
                    if(pos){
                        this._putDown();
                        this._clearGirlTrap(pos);
                    }
                    break;
                case objectId.mFire:
                    if (MoveControl.ninePiont(GameSet.checkMap(objectId.mFire), this.mPosNow) && this.isHaveGoods) {
                        this._putDown();
                        this._fireBigger();
                    }
                    break;
                case objectId.mHorn:
                    if (MoveControl.ninePiont(GameSet.checkMap(objectId.mFire), this.mPosNow) && this.isHaveGoods) {
                        this._putDown();
                        this._fireBigger();
                    }
                    break;
                case objectId.mGodMachine:
                    var pos = MoveControl.FourPoint(GameSet.checkMap(objectId.mGodMachine), this.mPosNow, true);
                    if(pos){
                        this.isGodMachine = true;
                        let result = Socket.result(eProc.godweapon);
                        Socket.send(result);
                        cc.find("itemGodMachine", this.nodMap).destroy();
                    }
                    break;
            }
        }else{
            switch(a.id){
                case objectId.mBoss:
                    if (this._checkMonster()) {
                        Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_monsterclear");
                        let pos = this._checkMonster();
                        this._clearBoyMonster(pos, true);
                        let type = GameSet.checkDetail(objectId.mBoss, pos);
                        let posN = GameSet.tiledTurnToCoord(this.layerWall, pos, eMapOffestx, eMapOffesty);
                        this._showMonster(posN, true, type, false);
                        this.isMove = true;
                        setTimeout(() => {
                            this.isMove = false;
                        }, 2000);
                    }
                    break;
                case objectId.mMonster:
                    if (this._checkMonster()) {
                        Notify.emit(eNotifyEvent.SoundEffect, "audio/sfx_monsterclear");
                        let pos = this._checkMonster();
                        let type = GameSet.checkDetail(objectId.mMonster, pos)
                        this._clearBoyMonster(pos, false);
                        let posN = GameSet.tiledTurnToCoord(this.layerWall, pos, eMapOffestx, eMapOffesty)
                        this._showMonster(posN, false, type, false);
                        this.isMove = true;
                        setTimeout(() => {
                            this.isMove = false;
                        }, 200);
                    }
                    break;
                case objectId.mFireRing:
                    var pos = MoveControl.FourPoint(GameSet.checkMap(objectId.mFireRing), this.mPosNow, true);
                    if (pos) this._useMaimang(pos);
                    break;
                case objectId.mKey:
                    var pos = MoveControl.FourPoint(GameSet.checkMap(objectId.mKey), this.mPosNow, true);
                    if(pos) this._openGate(pos);
                    break;
                default:
                    this._nightSee();
            }
        }
    }
    // 还在游戏中的重新连接，只更新对方信息
    private _reConnect(param) {
        this._other(param[0].data);
    }
    // 发送火焰状态改变消息
    private fireChange() {
        let result = Socket.result(eProc.fire);
        result.data["lvl"] = this.fireLevel;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 火焰等级改变判断
    private _fireLevelJudge(dt: number) {
        if (this.fireLevel > 1) {
            this.fireChangeTime -= dt;
            if (this.fireChangeTime > 0) return;
            this.fireLevel--;
            if (this.fireLevel == 1) {
                this._fireSmaller();
            }
            else if (this.fireLevel == 2) {
                this._fireNormal();
            }
        }
    }
    // 释放技能 判断是否还有cd时间
    private _nightSee() {
        if (this.skillTime) {
            if (this.timeLine - this.skillTime >= skillDuration) this._showNightMap();
        }
        else {
            this._showNightMap();
        }
    }
    // 声波仪
    private _showNightMap() {
        if (this.powerLine < powerExpend) {
            GameSet.itemShowGet("能量过低，无法使用技能");
            return;
        }
        this.isMove = true;
        setTimeout(() => { this.isMove = false }, 2500);
        this.addPowerLocal(-powerExpend);
        this.isCool = false
        this.skillTime = this.timeLine;
        let pos = Util.clone(this.nodMaster.getPosition());
        GameSet.nightSee(pos, this.nodMap, this.layerWall);
    }
    // 展示夜视仪cd
    private _showCoolNumber() {
        let button = this.activeButton;
        let buttonName = cc.find("name", button).getComponent(cc.Label);
        if (!this.skillTime) {
            this.isCool = true;
            buttonName.string = "夜视仪";
        }
        else if (this.timeLine - this.skillTime <= skillDuration) {
            let a: string = (skillDuration - Math.floor(this.timeLine - this.skillTime)).toString();
            buttonName.string = a;
        }
        else {
            this.isCool = true;
            buttonName.string = "夜视仪";
        }
    }
    // 清除钥匙
    private _clearKey(pos: string, pattern: boolean = undefined) {
        let info = GameSet.checkMap("mGate");
        if(pattern == undefined){
            this.layerGate.setTileGIDAt(0, info[pos]['day'], 0);
            this.layerGate.setTileGIDAt(0, info[pos]['night'], 0);
            if(this.mPattern){
                GameSet.mapChangeJudge(objectId.mKey, info[pos]['day']);
                GameSet.mapChangeJudge(objectId.mKeyOther, info[pos]['night']);
            }else{
                GameSet.mapChangeJudge(objectId.mKeyOther, info[pos]['day']);
                GameSet.mapChangeJudge(objectId.mKey, info[pos]['night']);
            }
        }else{
            if(pattern){
                this.layerGate.setTileGIDAt(0, info[pos].day, 0);
                if(this.mPattern){
                    GameSet.mapChangeJudge(objectId.mKey, info[pos]['day']);
                }else{
                    GameSet.mapChangeJudge(objectId.mKeyOther, info[pos]['day']);
                }
            }else{
                this.layerGate.setTileGIDAt(0, info[pos].night, 0);
                if(this.mPattern){
                    GameSet.mapChangeJudge(objectId.mKeyOther, info[pos]['night']);
                }else{
                    GameSet.mapChangeJudge(objectId.mKey, info[pos]['day']);
                }
            }
        }

    }
    // 检查机关门是否可以打开
    private _checkDoor(doorPos: string) {
        let info = GameSet.checkMap("mGate"),
            key1 = info[doorPos]['day'],
            key2 = info[doorPos]['night'];
        if(!this.layerGate.getTileGIDAt(key1) && !this.layerGate.getTileGIDAt(key2)){
            let pos = GameSet.strTurnToV2(doorPos);
            this.layerGate.setTileGIDAt(0, pos, 0);
            this.layerWall.setTileGIDAt(0, pos, 0);
            GameSet.loadDoor(pos, GameSet.checkDetail(objectId.mGate, pos).type, this.nodMap, this.layerWall)
            GameSet.mapChangeJudge(objectId.mGate, pos);
            GameSet.createBubble("附近的机关门已经打开了，我们可以过去了", this.nodMap, this.nodMaster);
        }
    }
    // 更新自己数据
    private _self(data) {
        let self = this;
        for(let k in data["skill"]){
            GameSet.getSkill[k];
            let pos = GameSet.tiledTurnToCoord(this.layerWall, data["skill"][k], eMapOffestx, eMapOffesty)
            GameSet.mapChangeJudge(objectId.mBigBox, data["skill"][k])
            for(let key in this.nodMap.children){
                let value = this.nodMap.children[key]
                if(value.name == "itemBigBox" && value.x == pos.x && value.y == pos.y) value.destroy();
            }
        }
        if(data.godweapon){
            this.isGodMachine = true;
        }
        for (let key in data["door"]) {
            let value = data["door"][key];
            if (value == 3) {
                let p = GameSet.strTurnToV2(key);
                GameSet.loadDoor(p, GameSet.checkDetail(objectId.mGate, p).type, this.nodMap, this.layerWall)
                GameSet.mapChangeJudge(objectId.mGate, p);
                this._clearKey(key);
            }
            else if (value == 1) {    // 白天
                this._clearKey(key, this.mPattern);
            }
            else if (value == 2) {    // 黑夜
                this._clearKey(key, !this.mPattern);
            }
        }
        let timeStart = data["startTime"];
        this._changeFire(data);
        let a = data["self"].pos;
        this.mPosNow = a;
        let pos = GameSet.tiledTurnToCoord(this.layerWall, a, eActorOffestx, eActorOffesty);
        this.node.setPosition(-pos.x * this.nodMap.scaleX, -pos.y * this.nodMap.scaleY);
        this.dieCount = data["self"].hurt;  // 受伤次数
        let lifeCont = cc.find("lifeContHave", this.pnlGameInter);
        let contChildCount = lifeCont.childrenCount; 
        for(let i = 0; i < this.dieCount; i++){
            contChildCount--;
            lifeCont.children[contChildCount].destroy();
        }
        for (let key in data["self"].chip) {  // 清除碎片
            let value = data["self"].chip[key];
            if (value.state) {
                this.chipGetArr.push(value.id);
                this._clearChip(key, this.chips)
            }
        }
        for (let value of data["self"].markmap) {
            this._setSign(this.mSignArr, value.judge, value.pos, true);
        }
        if (this.mPattern) {
            this._clearFireRingOrCrtWave(data["self"].crtwave);
            for (let key in data["self"].woods) { // 木块
                let value = data["self"].woods[key];
                if ((value - timeStart) / 1000 < goodsResetTime) {
                    let obj = new Object();
                    obj["pos"] = GameSet.strTurnToV2(key);
                    obj["time"] = (value - timeStart) / 1000;
                    this.goodsArr.push(obj);
                    this.layerGoods.setTileGIDAt(0, obj["pos"], 0);
                    GameSet.mapChangeJudge(objectId.mWood, obj["pos"]);
                }
            }
            for (let value of data["self"].fixhole) {
                GameSet.mapChangeJudge(objectId.mTrap, value);
                let type = GameSet.checkDetail(objectId.mTrap, value).type;
                GameSet.mapAddObj(objectId.mTrapCover, value, type);
                GameSet.loadTrapCover(value, type, this.nodMap, this.layerWall);
            }
            if (data["self"].hasWood) {
                this._changeActorAni(pos, true);
            } else {
                this.nodMaster.setPosition(pos);
            }
        } else {
            this._clearFireRingOrCrtWave(data["self"].firering);
            for (let value of data["self"].killmonster) {
                this._clearGirlMonster(value);
            }
            this.nodMaster.setPosition(pos);
            this.powerLine = data["self"]
        }
    }
    // 更新队友数据
    private _other(data) {
        this.otherOne = data["oppo"].pos;
        this.otherDieCunt = data["oppo"].hurt;
        this._changeFire(data);
        if(data.godweapon){
            this.isGodMachine = true;
        }
        for (let key in data["oppo"].chip) {
            let value = data["oppo"].chip[key];
            if (value.state) this._clearChip(key, this.chipOppo);
        }
        for (let value of data["oppo"].markmap) {
            this._setSign(this.InSignArr, value.judge, value.pos, false);
        }
        if (this.mPattern) {
            for (let value of data["oppo"].killmonster) {
                this._clearGirlMonster(value)
            }
        } else {
            for (let value of data["oppo"].fixhole) {
                this.layerWall.setTileGIDAt(0, value, 0);
                let type = GameSet.checkDetail(objectId.mTrap, value);
                GameSet.mapChangeJudge(objectId.mTrap, value)
                GameSet.loadTrapCover(value, type, this.nodMap, this.layerWall);
            }
        }
    }
    // 清除火环或者声波器
    private _clearFireRingOrCrtWave(d) {
        for (let key in d) {
            let value = d[key];
            if (value) this.layerGoods.setTileGIDAt(0, GameSet.strTurnToV2(key), 0);
        }
    }
    // 重新连接恢复战场 分恢复自己的战场，更新队友战场上的变化
    private _connectBack() {
        this._self(this.mapInfo);
        this._other(this.mapInfo);
    }
    // 恢复战场时 判断火焰等级
    private _changeFire(data: object) {
        let count: number = data["fire"].count,
            fireLevel: number = data["fire"].level,
            timeLen = (data['startTime']-data["fire"].time)/1000,
            timeCool = (count+1) * fireResetTime;
        this.woodCount = count+1;
        if(fireLevel == 2){
            if(timeLen<timeCool){
                this.fireChangeTime -= timeLen;
            }else{
                this.fireLevel = 1;
                this._fireSmaller();
            }
        }
        else if(fireLevel == 3){
            if(timeLen < timeCool){
                this.fireChangeTime -= timeLen;
            }
            else if(timeLen>timeCool && timeLen<2*timeCool){
                this.fireChangeTime = this.woodCount * fireResetTime;
                this._fireSmaller();
            }
            else{
                this._fireSmaller();
            }
        }
    }
    // 设置碎片
    private _setChip(arr, isMine: boolean) {
        for (let key in arr) {
            let value = arr[key],
                posNew = GameSet.tiledTurnToCoord(this.layerWall, value.pos, eMapOffestx, eMapOffesty)
            if (isMine) {
                GameSet.mapAddObj(objectId.mChip, value.pos);
            } else {
                GameSet.mapAddObj(objectId.mChipOther, value.pos);
            }
            CommonMgr.loadRes("prefab/map/itemChip", cc.Prefab, (err, res) => {
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemChip").init(posNew, value.pos, isMine);
                this.nodMap.addChild(a, layerIndex.mGoods);
            })
        }
    }
    // 获取碎片
    private _pickChip(pos: cc.Vec2) {
        let str = `${pos.x}-${pos.y}`,
            result = Socket.result(eProc.pickchip);
        result.data["value"] = str;
        if(GameSet.showGameState()) Socket.send(result);
        for (let key in this.chips) {
            let value = this.chips[key];
            if (str == value.pos) {
                GameSet.itemShowGet(`你获得碎片 ${value.type}`);
                this.chipGetArr.push(value.type);
            }
        }
        this._clearChip(str, this.chips);
    }
    // 清除碎片
    private _clearChip(str: string, chips: Object) {
        let pos = GameSet.strTurnToV2(str);
        GameSet.mapChangeJudge(objectId.mChip, pos)
        GameSet.mapChangeJudge(objectId.mChipOther, pos);
        for (let key in chips) {
            let value = chips[key];
            if (pos.x == value.pos.x && pos.y == value.pos.y) {
                cc.find(str, this.nodMap).destroy();
                delete chips[key];  // 删除数组中的记录
            }
        }
    }
    // 人物之间的距离
    private _countDis(pos1: cc.Vec2, pos2: cc.Vec2) {
        let posOther = this.layerWall.getPositionAt(pos2);
        let pos = this.layerWall.getPositionAt(pos1);
        let a = Math.floor(Math.sqrt(Math.pow(posOther.x - pos.x, 2) + Math.pow(posOther.y - pos.y, 2)));
        if(a<eActorOffestx) a = 0;
        return a.toString();
    }
    // 添加能量更新服务端数据
    private addPowerNet() {
        if(!GameSet.checkSkill(ePower.addWood)) return;
        let result = Socket.result(eProc.operate);
        result.data["type"] = 9;
        result.data["value"] = this.powerLine;
        if(GameSet.showGameState()) Socket.send(result);
    }
    // 添加能量
    private addPowerLocal(num: number = 0) {
        if(!GameSet.checkSkill(ePower.nightSee)) return;
        if(this.powerLine>powerMax) return;
        if(this.powerLine + num >= powerMax){
            this.powerLine = powerMax;
        }else{
            this.powerLine += num;
        }
        let powerLine = cc.find("powerLine", this.pnlGameInter);
        cc.find("powerNum", powerLine).getComponent(cc.Label).string = `${this.powerLine}/${powerMax}`;
        powerLine.getComponent(cc.ProgressBar).progress = this.powerLine / powerMax;
        this.addPowerNet();
    }
    // 自己触发自己的钥匙
    private _openGate(pos: cc.Vec2) {
        let doorPos: string;
        this.layerGate.setTileGIDAt(0, pos, 0);
        this.layerWall.setTileGIDAt(0, pos, 0);
        GameSet.mapChangeJudge(objectId.mKey, pos)
        let result = Socket.result(eProc.door);
        doorPos = GameSet.checkDetail(objectId.mKey, pos).door;
        result.data["value"] = doorPos
        if(GameSet.showGameState()) Socket.send(result);
        this._checkDoor(doorPos)
    }
    // 判断周围是否存在交互事件
    private _moveCheck() {
        let a = MoveControl.checkRound(this.mPosNow, this.mPattern, this.isHaveGoods);
        if (a["judge"]) {
            this._openActive();
            if (a["buttonName"]){
                GameSet.changeButtonName(a["buttonName"]);
                // if(this.mPattern)cc.find("nodButton2", this.pnlGameInter).active = true;
            }
            if (a["cont"]) GameSet.createBubble(a["cont"], this.nodMap, this.nodMaster);
            if (!this.mPattern) this.isHint = false;
        } else {
            this._closeActive();
            if (this.mPattern) {

            } else {
                if(GameSet.checkSkill(ePower.nightSee)){
                    this.isHint = true;
                    this._openActive()
                }
            }
        }
        if (!a['buttonName'] && this.mPattern){
            this._closeActive()
        }
    }
    // 生命减少
    private _reduceLife() {
        let lifeCont: cc.Node = cc.find("lifeContHave", this.pnlGameInter);
        if(lifeCont.childrenCount>=1){
            lifeCont.children[lifeCont.childrenCount-1].destroy();
        }
    }
    // 是否展示倒影
    private _isShowShader() {
        let groundType: number;
        for(let v of this.groundArr){
            let pos = this.layerWall.getPositionAt(this.mPosNow)
            // if(GameSet.isInRange(v.pointArr, v.pos, cc.v2(pos.x+eMapOffestx, pos.y+eMapOffesty))){
            //     groundType = v.type;
            //     break;
            // }
        }
        if(groundType == SenceType.mWater){
            return true;
        }else{
            return false
        }
    }
    // 网络初始化
    private _initNet() {
        this.addPowerNet();
        let result = Socket.result(eProc.initmap),
            horn = GameSet.checkMap(objectId.mHorn),
            fireRing = GameSet.checkMap(objectId.mFireRing),
            hornObj = {},
            fireRingObj = {}
        if(this.mPattern){
            for(let k in horn){
                let str = `${horn[k].pos.x}-${horn[k].pos.y}`;
                hornObj[str] = 0;
            }
            result.data["crtwave"] = hornObj;
        }else{
            for(let k in fireRing){
                let str = `${fireRing[k].pos.x}-${fireRing[k].pos.y}`;
                fireRingObj[str] = 0;
            }
            result.data["firering"] = fireRingObj;
        }
        result.data["chip"] = new Object();
        let a = result.data["chip"];
        for (let key in this.chips) {
            let value = this.chips[key];
            let pos = `${value.pos.x}-${value.pos.y}`;
            a[pos] = {
                id: value.type,
                state: 0
            };
        }
        result.data['pos'] = this.mInitPos;
        Socket.send(result);
    }
    // 关闭交互
    private _closeActive() {
        this.activeButton.active = false;
        cc.find("nodMask2", this.pnlGameInter).active = false;
        this.nodActive.active = false;
    }
    // 开启交互
    private _openActive() {
        this.activeButton.active = true;
        cc.find("nodMask2", this.pnlGameInter).active = false;
        this.nodActive.active = true;
    }
    // 显示能量条
    private _showPowerLine() {
        cc.find("powerLine", this.pnlGameInter).active = true;
    }
    // 隐藏能量条
    private _hidePowerLine() {
        cc.find("powerLine", this.pnlGameInter).active = false;
    }
    // 技能记录到客户端
    private _record(obj){
        let user = UserMgr.getUser(),
            base = user.base,
            param = user.param
        if(!base["skill"]) base["skill"] = new Object();
        if(!param["skill"]) param["skill"] = new Object();
        for(let k in obj){
            if(obj[k]){
                base["skill"][k] = 1;
                param["skill"][k] = 1; 
            }
        }
    }



}
