import { CommonMgr } from "../../manager/CommonMgr";
import { Util } from "../../framework/util";
import { GameMgr } from "../../manager/GameMgr";
import { eGameState, eLayer, eNotifyEvent } from "../../manager/DefMgr";
import { UserMgr } from "../../manager/UserMgr";
import { Notify } from "../../framework/notify";

export const eActorScale = 0.75;
export const eActorOffestx = 77;
export const eActorOffesty = 77;
export const tileSize = 144;
export const eMapOffestx = 77;
export const eMapOffesty = 77;
export const skillDuration = 3;
export const nightSeeDuration = 1;

export const layerIndex = {
    mWindow: 500,
    mEffect: 400,
    mSence: 300,
    mMonster: 210,
    mActor: 200,
    mHideWay: 150,
    mGoods: 110,
    mActive: 100,
    mFootPrint: 90,
    mTrapCover: 60,
    mMask: 50,
}

export const objectId = {
    mFire : 101,
    mDay : 102,
    mNight : 103,
    mDestination : 104,
    mTrap : 201,
    mPool : 202,
    mTrapCover: 203,
    mWaterTrap : 204,
    mMonster : 301,
    mBoss : 302,
    mWood : 401,
    mFireRing : 402,
    mHorn : 403, 
    mGate : 404,
    mKey : 405,
    mKeyOther : 406,
    mChip : 407,
    mChipOther : 408,
    mGodMachine : 409,
    mMark : 410,
    mOblation : 411,
    mOblationOther : 412,
    mSmallBox : 413,
    mBigBox : 414,
    mStressDoor : 415,
    mStressKey : 416,
}

export const SenceType = {
    mSoil : 1,
    mWater : 2,
    mFire : 3,
    mWind : 4,
}

export const ePower = {
    nightSee : 1,
    addWood : 2,
    walkOnWater : 3,
}

export const Enemy = {
    1 : {
        monster : "picture/monster/monster_soil",
        boss : "picture/monster/boss_soil"
    },
    2 : {
        monster : "picture/monster/monster_water",
        boss : "picture/monster/boss_water"
    },
    3 : {
        monster : "picture/monster/monster_soil",
        boss : "picture/monster/boss_soil"
    },
    4 : {
        monster : "picture/monster/monster_water",
        boss : "picture/monster/boss_water"
    }
}

export const mapRound = {
    0 : {
        day : "prefab/map/mapAll/itemMapTest0_day",
        night : "prefab/map/mapAll/itemMapTest0_night"
    },
    1 : {
        day : "prefab/map/mapAll/itemMapTest1_day",
        night : "prefab/map/mapAll/itemMapTest1_night"
    },
    2 : {
        day : "prefab/map/mapAll/itemMap2_day",
        night : "prefab/map/mapAll/itemMap2_night"
    },
    3 : {
        day : "prefab/map/mapAll/itemMap3_day",
        night : "prefab/map/mapAll/itemMap3_night"
    },
    4 : {
        day : "prefab/map/mapAll/itemMap4_day",
        night : "prefab/map/mapAll/itemMap4_night"
    },
    5 : {
        day : "prefab/map/mapAll/itemMap5_day",
        night : "prefab/map/mapAll/itemMap5_night"
    },
    6 : {
        day : "prefab/map/mapAll/itemMap6_day",
        night : "prefab/map/mapAll/itemMap6_night"
    },
    7 : {
        day : "prefab/map/mapAll/itemMap7_day",
        night : "prefab/map/mapAll/itemMap7_night"
    },
}

export const groundUrl = {
    soil : "picture/wall/mud_forest_01",
    water : "picture/wall/water_wall",
}

export const commonPrefab = "prefab/map/itemFunk"

export const eDieCount = 5;
export const powerInit: number = 50;
export const powerMax: number = 100;
export const powerAdd: number = 2;
export const powerAddByKill: number = 30;
export const powerExpend: number = 15;

export const fireSizeNormal = 1;
export const fireSizeBigger = 1.2;
export const fireSizeSmaller = 0.8;

export const eChooseDay = true;
export const eChooseNight = false;

export const shadowTexture = [5, 6]

export const eRangeVecNormal = {
    x : 2,
    y : 2,
}

export const eRangeVecBigger ={
    x : 3,
    y : 3,
}


export const goodsResetTime = 60;
export const fireGainTime = 120; 
export const fireResetTime = 60;

export class GameSet{
    private static isPlayMusic = true;
    private static isGaming = false;
    private static roundInfo: Object = {};
    private static mapInfo = new Object();
    private static tiledCount: cc.Vec2;
    private static tiledSize: cc.Size;
    private static skillList = {
        1 : false,
        2 : false,
        3 : false,
    }
    // 初始化技能表
    public static initSkillList(){
        let obj = UserMgr.getUser().param["skill"]
        for(let k in this.skillList){
            this.skillList[k] = false;
        }
        for(let k in obj){
            this.skillList[k] = true
        }
    }

    public static getSkill(id: number){
        GameSet.skillList[id] = true;
    }

    public static checkSkill(id: number){
        return GameSet.skillList[id]
    }
    
    // 初始化地图配置表
    public static initRound(obj: Object) {
        GameSet.roundInfo = Util.clone(obj);
        return GameSet.roundInfo;
    }
    // 获取配置表某个参数数据
    public static RudInf(key){
        return GameSet.roundInfo[key];
    }

    public static showMusicState() {
        return GameSet.isPlayMusic;
    }

    public static pauseMusic(){
        cc.audioEngine.pauseMusic();
        return GameSet.isPlayMusic = false;
    }

    public static resumeMusic(){
        cc.audioEngine.resumeMusic();
        return GameSet.isPlayMusic = true;
    }

    public static stopMusic() {
        cc.audioEngine.stopAll();
    }

    public static changeMusic(url: string){
        cc.loader.loadRes(url, cc.AudioClip, (err, res)=>{
            cc.audioEngine.playMusic(res, true);
            if(!GameSet.showMusicState()) GameSet.pauseMusic();
        })
    }

    public static playMusicInit() {
        GameSet.isPlayMusic = true;
        cc.audioEngine.resumeMusic();
    } 

    public static gameStart() {
        return GameSet.isGaming = true;
    }

    public static gameOut() {
        GameMgr.changeGameState(eGameState.Main);
        return GameSet.isGaming = false;
    }

    public static showGameState() {
        return GameSet.isGaming;
    }

    public static itemShowGet(cont: string){
        CommonMgr.loadRes("prefab/ui/map/itemShowGet", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemShowGet").init(cont);
            CommonMgr.addNode(a, eLayer.LAYER_NORMAL);
        })
    }

    public static changeButtonName(name: string) {
        let button = cc.find("Canvas/pnlGameInter/nodMask2_off");
        button.active = true;
        let buttonName = cc.find("name", button).getComponent(cc.Label);
        buttonName.string = name;
    }

    public static createBubble(cont: string, mParent: cc.Node, actor: cc.Node) {
        if (!cont) return;
        let b = cc.find("itemBubble", mParent);
        if (cc.isValid(b)){
            if(b.children[0].children[0].getComponent(cc.Label).string == cont){
                return;
            }else{
                b.destroy();
            }
        }
        CommonMgr.loadRes("prefab/map/itemBubble", cc.Prefab, (err, res) => {
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemBubble").init(cont, actor);
            mParent.addChild(a, layerIndex.mWindow);
        })
    }

    // 判断是否在不规则区域内
    public static isInRange(obj: Object, posActor: cc.Vec2){
        let pos = obj["pos"],    // 点为画图形的第一个点，默认为左上角的点
            pointsN = new Array<any>()

        for(let v of obj["points"]){
            var a = cc.v2(pos.x+v.y, pos.y-v.y);
            pointsN.push(a)
        }
        let xMin: number = pointsN[0].x,
            xMax: number = pointsN[0].x,
            yMin: number = pointsN[0].y,
            yMax: number = pointsN[0].y

        for(let v of pointsN){
            if(v.x<xMin) xMin = v.x;
            if(v.x>xMax) xMax = v.x;
            if(v.y<yMin) yMin = v.y;
            if(v.y>yMax) yMax = v.y;
        }

        cc.log(posActor, xMin, xMax, yMin, yMax)
        if(pointsN.length <= 4){
            if(posActor.x>=xMin && posActor.x<=xMax && posActor.y>=yMin && posActor.y<=yMax){
                return true;
            }
        }
        // 点是否在最外围点形成的矩形外
        if(posActor.x<xMin || posActor.x>xMax || posActor.y<yMin || posActor.y>yMax){
            return false;
        }
        let isIn: boolean = false;
        for(let i = 0, j = pointsN.length; i < pointsN.length-1; j = i++){
            let a = cc.v2(pointsN[i].x, pointsN[i].y),
                b = cc.v2(pointsN[j].x, pointsN[j].y);
            // 点与多边形顶点重合
            if((a.x == posActor.x && a.y == posActor.y) || (b.x == posActor.x && b.y == posActor.y)){
                return "on point";
            }
            // 判断线段两端点是否在射线两侧
            if((a.y < posActor.y && b.y >= posActor.y) || (a.y >= posActor.y && b.y < posActor.y)){
                let x = a.x + (posActor.y - a.y) * (b.y - a.x) / (b.y - a.y)
                // 点再多边形的边上
                if(x == posActor.x){
                    return "on line";
                }

                // 射线穿过多边形的边界
                if(x > posActor.x){
                    isIn = !isIn;
                }
            }
        }
        return isIn;
    }

    public static loadTrapCover(pos: cc.Vec2, type: number, mParent: cc.Node, layer: cc.TiledLayer){
        let url: string;
        switch(type){
            case SenceType.mSoil:
                url = "picture/trapCover/soilCover";
                break;
            case SenceType.mWater:
                url = "picture/trapCover/waterCover";
                break;
            case SenceType.mWind:
                url = "picture/trapCover/windCover";
                break;
            case SenceType.mFire:
                url = "picture/trapCover/fireCover";
                break;
        }
        let posN = layer.getPositionAt(pos);
        CommonMgr.loadRes("prefab/map/itemTrapCover", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemActive").init(url);
            mParent.addChild(a, layerIndex.mTrapCover);
            a.setPosition(posN.x+eMapOffestx, posN.y+eMapOffesty)
        })
    }

    public static loadGrave(pos: cc.Vec2, mParent: cc.Node, layer: cc.TiledLayer, isBoss: boolean, isPattern: boolean){
        let url: string;
        if(isPattern){
            if(isBoss){
                url = "picture/monster/bossGrave_d";
            }else{
                url = "picture/monster/monsterGrave_d";
            }
        }else{
            if(isBoss){
                url = "picture/monster/bossGrave_n";
            }else{
                url = "picture/monster/monsterGrave_n";
            }
        }
        let posN = layer.getPositionAt(pos);
        CommonMgr.loadRes("prefab/map/itemMonsterDie", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemActive").init(url);
            mParent.addChild(a, layerIndex.mFootPrint);
            a.setPosition(posN.x+eMapOffestx, posN.y+eMapOffesty);
        })
    }

    public static loadDoor(pos: cc.Vec2, type: number, mParent: cc.Node, layer: cc.TiledLayer, callBack?){
        let url: string;
        switch(type){
            case SenceType.mSoil:
                url = "picture/door/soilDoor";
                break;
            case SenceType.mWater:
                url = "picture/door/waterDoor";
                break;
            case SenceType.mFire:
                url = "picture/door/fireDoor";
                break;
            case SenceType.mWind:
                url = "picture/door/windDoor";
                break
        }
        let posN = GameSet.tiledTurnToCoord(layer, pos, eMapOffestx, eMapOffesty)
        CommonMgr.loadRes("prefab/map/itemDoorOpen", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemActive").init(url);
            mParent.addChild(a, layerIndex.mGoods);
            a.setPosition(posN);
            if(callBack) callBack(a);
        })
    } 

    public static nightSee(pos: cc.Vec2, mParent: cc.Node, layer: cc.TiledLayer) {
        CommonMgr.loadRes("prefab/map/itemFlyBall", cc.Prefab, (err, res) => {
            for (let i = 0; i < 36; i++) {
            if (i == 9 || i == 27) continue;
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemFlyBall").init(i * 5 * Math.PI / 180, pos, layer);
                mParent.addChild(a, layerIndex.mActive);
            }
            for (let i = 1; i < 37; i++) {
                if (i == 9 || i == 27) continue;
                let a: cc.Node = cc.instantiate(res);
                a.getComponent("itemFlyBall").init(-i * 5 * Math.PI / 180, pos, layer);
                mParent.addChild(a, layerIndex.mActive);
            }
        })
    }

    public static loadWall(pos: cc.Vec2, mParent: cc.Node, groundArr: Array<any>, layer: cc.TiledLayer){
        let posN = layer.getPositionAt(pos)
        for(let k in mParent.children){
            let v = mParent.children[k];
            if(v.name == "hiddenWall" && v.x == posN.x && v.y == posN.y) return;
        }
        let groundType: number,
            url : string
        // for(let v of groundArr){
        //     let posN = layer.getPositionAt(pos);
        //     if(GameSet.isInRange(v['pointArr'], v['pos'], cc.v2(posN.x+eMapOffestx, pos.y+eMapOffesty))){
        //         groundType = v['type'];
        //         cc.log(v["type"], 11111111)
        //         break;
        //     }
        // }
        if(UserMgr.CurrentLeavel() == 0){
            url = groundUrl.soil
        }
        else if(UserMgr.CurrentLeavel() == 1){
            url = groundUrl.soil;
        }
        else if(UserMgr.CurrentLeavel() == 2){
            url = groundUrl.water;
        }
        if(groundType == SenceType.mSoil){
            url = groundUrl.soil;
        }else if(groundType == SenceType.mWater){
            url = groundUrl.water;
        }
        GameSet.loadCommonPrefab(mParent, layerIndex.mSence, url, posN, "hiddenWall", cc.v2(0, 0))
    }

public static loadActorShadow(pos, mParent: cc.Node, pattern: boolean, callBack, faceTo?) {
        let url: string;
        if(pattern){
            url = "prefab/animation/walkGirl_1";
        }else{
            url = "prefab/animation/walkBoy";
        }
        CommonMgr.loadRes(url, cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemActor").init("itemActorShadow", pos, eActorScale, faceTo);
            mParent.addChild(a, layerIndex.mActor);
            callBack(a);
            a.opacity = 0;
            setTimeout(() => {
                a.runAction(cc.fadeTo(0.3, 100));
            }, 300);
        })  

    } 

    public static getPowerRemind(id: number){
        let cont: string;
        switch(id){
            case ePower.nightSee:
                cont = "恭喜你，成功解锁夜视仪技能！通过使用技能可以使周围墙壁显现出来。"
                break;
            case ePower.addWood:
                cont = "恭喜你，成功解锁添加木块能力！现在你可以捡取木头给火堆添加，来获取视野范围。"
                break;
            case ePower.walkOnWater:
                cont = "恭喜你，成功解锁水上行走能力！现在你可以通过水面"
                break;
        }
        GameSet.itemShowGet(cont)
    }

    /*--------------------------------------     地图相关    -------------------------------------------------------*/
    // 初始化地图块大小
    public static initTiledSize(size){
        GameSet.tiledSize = cc.size(size.width, size.height);
        return size;
    }
    // 获取地图块大小
    public static getTileSize(){
        return GameSet.tiledSize;
    }
    // 初始化地图大小（块数）
    public static initTiledCount(pos){
        GameSet.tiledCount = Util.clone(pos);
        return pos; 
    }
    // 获取当前地图大小（块数）
    public static getTiledCnt(){
        return GameSet.tiledCount;
    }
    // 初始化地图对象信息
    public static initMapInfo(obj, mParttern: boolean) {
        GameSet.mapInfo = new Object();
        GameSet.mapInfo["mGate"] = new Object();
        let objGate = GameSet.mapInfo["mGate"]
        for(let k in obj){
            let v = obj[k];
            if(!GameSet.mapInfo[v.id]) GameSet.mapInfo[v.id] = new Array<Object>();
            if(v.id == objectId.mFire || v.id == objectId.mDay || v.id == objectId.mNight){
                GameSet.mapInfo[v.id] = [{
                    pos : GameSet.countTileObj(v.offset, v.width, v.height)
                }]
            }
            else if(v.id == objectId.mTrap || v.id == objectId.mMonster || v.id == objectId.mKey || v.id == objectId.mKeyOther || v.id == objectId.mBoss || v.id == objectId.mGate || v.id == objectId.mStressKey || v.id == objectId.mStressDoor){
                let obj = {
                    pos : GameSet.countTileObj(v.offset, v.width, v.height),
                    judge : false,
                    type : Number(v.type)
                }
                if(v.id == objectId.mKey || v.id == objectId.mKeyOther || v.id == objectId.mStressKey){
                    obj['door'] = v.door
                }
                if(v.id == objectId.mBoss){
                    obj["isGod"] = v.isGod;
                    obj["isSkill"] = v.isSkill;
                }
                GameSet.mapInfo[v.id].push(obj);
            }
            else if( v.id == objectId.mFireRing || v.id == objectId.mHorn || v.id == objectId.mWood || v.id == objectId.mOblation || v.id == objectId.mOblationOther || v.id == objectId.mSmallBox || v.id == objectId.mBigBox){
                let obj = {
                    pos : GameSet.countTileObj(v.offset, v.width, v.height),
                    judge : false,
                }
                if(v.id == objectId.mSmallBox || v.id == objectId.mBigBox){
                    obj['power'] = v.power;
                }
                GameSet.mapInfo[v.id].push(obj);
            }
            else if(v.id == objectId.mPool || v.id == objectId.mDestination || v.id == objectId.mWaterTrap){
                let obj = {
                    pos : GameSet.countTileObj(v.offset, v.width, v.height)
                }
                GameSet.mapInfo[v.id].push(obj);
            }

            if(v.id == objectId.mKey){
                let doorPos = v.door;
                if(Object.keys(objGate).length == 0 || !objGate[doorPos]){
                    objGate[doorPos] = new Object();
                    if(mParttern){
                        objGate[doorPos]["day"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    }else{
                        objGate[doorPos]["night"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    }
                }else{
                    if(!objGate[doorPos]["day"] && mParttern) objGate[doorPos]["day"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    if(!objGate[doorPos]['night'] && !mParttern) objGate[doorPos]["night"] = GameSet.countTileObj(v.offset, v.width, v.height);
                }
            }else if(v.id == objectId.mKeyOther){
                let doorPos = v.door;
                if(Object.keys(objGate).length == 0 || !objGate[doorPos]){
                    objGate[doorPos] = new Object();
                    if(mParttern){
                        objGate[doorPos]["night"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    }else{
                        objGate[doorPos]["day"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    }
                }
                else{
                    if(!objGate[doorPos]['day'] && !mParttern) objGate[doorPos]["day"] = GameSet.countTileObj(v.offset, v.width, v.height);
                    if(!objGate[doorPos]["night"] && mParttern) objGate[doorPos]["night"] = GameSet.countTileObj(v.offset, v.width, v.height);
                }
            }
        }
    }
    // 展示地图说有对象信息
    public static showMapInfo(){
        return GameSet.mapInfo;
    }
    // 查询某个类型数据信息
    public static checkMap(id){
        if(!GameSet.mapInfo[id]){
            return {};
        }else{
            return GameSet.mapInfo[id];
        }
    }
    // 查询具体某个坐标位置的信息
    public static checkDetail(id, pos){
        if(!GameSet.mapInfo[id]) return false;
        for(let v of GameSet.mapInfo[id]){
            if(v.pos.x == pos.x && v.pos.y == pos.y) return v;
        }
    }
    // 添加对象
    public static mapAddObj(id: number, pos: cc.Vec2, type: number = null, objectN?){
        let obj = {
            pos : pos,
            judge : false,
            type : type
        }
        if(objectN){
            for(let k in objectN){
                obj[k] = objectN[k]
            }
        }
        if(GameSet.mapInfo[id]){
            GameSet.mapInfo[id].push(obj);
        }else{
            GameSet.mapInfo[id] = new Array<Object>();
            GameSet.mapInfo[id].push(obj);
        }
    }
    // 改变对象状态
    public static mapChangeJudge(id, pos, judge = null) {
        let a = GameSet.mapInfo[id];
        if(Array.isArray(a)){
            for(let v of a){
                if(v.pos.x == pos.x && v.pos.y == pos.y){
                    if(judge == null){
                        v.judge = !v.judge;
                    }else{
                        v.judge = judge;
                    }
                }
            }
        }else{
            cc.warn("改变的数值没有judge属性！");
        }
    }


    /*----------------------------------  工具函数 ---------------------------------------------------------*/
    // 删除 子级中的某个节点
    public static detele(parent: cc.Node, a: cc.Node){
        for(let key in parent.children){
            let value = parent.children[key];
            if(a.x == value.x && a.y==value.y){
                parent.children[key].destroy();
                return;
            }
        }
    } 
    // 地图 点坐标 转换为 块坐标    块坐标父级锚点在左下角
    public static countTile(pos: cc.Vec2){
        let posN = cc.v2();
        posN.x = Math.floor(pos.x / GameSet.getTileSize().width);
        posN.y = GameSet.getTiledCnt().y - Math.ceil(pos.y / GameSet.getTileSize().height);
        return posN;
    }
    // 对象 块坐标 转换为 点坐标    块坐标父级锚点在右上角
    public static countTileObj(pos: cc.Vec2, width: number, height: number){
        return cc.v2(pos.x/width, pos.y/height);
    }
    // cc.vec 转换为 字符串 xxx-xxx
    public static strTurnToV2(str: string, x: number = 0, y: number = 0){
        if(typeof(str) != "string"){
            cc.warn("参数一必须为string")
            return
        }
        let posArr = str.split("-");
        return cc.v2(Number(posArr[0])+x, Number(posArr[1])+y);
    }
    // 地图块坐标转换为点坐标
    public static tiledTurnToCoord(layer: cc.TiledLayer, pos: cc.Vec2, x: number = 0, y: number = 0){
        let posN = layer.getPositionAt(pos);
        return cc.v2(posN.x+x, posN.y+y);
    }
    // 两点之间距离
    public static pointsDis(pos1: cc.Vec2, pos2: cc.Vec2){
        return Math.abs(Math.sqrt(Math.pow(pos1.x-pos2.x, 2)+Math.pow(pos1.y-pos2.y, 2)));
    }
    // 加载通用prefab
    public static loadCommonPrefab(mParent: cc.Node, nodIndex: number, url: string, nodPos: cc.Vec2, nodName: string, anchor: cc.Vec2 = cc.v2(0.5, 0.5), ExistTime: number = -1, AppearTime: number = 0.5, DisapperTime: number = 0.5){
        CommonMgr.loadRes("prefab/map/itemFunk", cc.Prefab, (err, res)=>{
            let a: cc.Node = cc.instantiate(res);
            a.getComponent("itemFunk").init(url, nodPos, anchor, ExistTime, AppearTime, DisapperTime, nodName);
            mParent.addChild(a, nodIndex);
        })
    }

}
