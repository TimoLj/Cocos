import { GameSet, objectId } from "./mapDef";
import { Util } from "../../framework/util";

export  class MoveControl{
    public static mouseMove(xLen, yLen) {
        let mAngle = Math.atan2(yLen, xLen)/Math.PI * 180;
        let a = cc.v2();
        if(mAngle>=-45 && mAngle<45) { // 向右
            a.x = 1;
        }
        else if(mAngle>=45 && mAngle<135) { // 向上
            a.y = -1;
        }
        else if(mAngle>=135 || mAngle<-135) {   // 向左
            a.x = -1;
        }
        else if(mAngle>=-135 && mAngle<-45) { //向下
            a.y = 1;
        }
        return a;
    }

    public static boyClickJudge(arr: Array<Object>, posDot: cc.Vec2, posNow: cc.Vec2, rangeVec: cc.Vec2, isCentre: boolean = false) {
        if(posDot.x != posNow.x || posDot.y != posNow.y){
            if(posDot.x<=posNow.x+rangeVec.x && posDot.x>=posNow.x-rangeVec.x && posDot.y>=posNow.y-rangeVec.y && posDot.y<=posNow.y+rangeVec.y){
                if(isCentre){
                    for(let v of arr){
                        if(posDot.x == v['pos'].x && posDot.y == v["pos"].y) return false;
                    }
                    return false;
                }else{
                    if(MoveControl.FourPoint(arr, posDot)) return true;
                    return false;
                }
            }
        }
        return false;
    }

    public static boyClickJudgeLayer(layer: cc.TiledLayer, posDot: cc.Vec2, posNow: cc.Vec2, rangeVec: cc.Vec2) {
        if(posDot.x != posNow.x || posDot.y != posNow.y){
            if(posDot.x<=posNow.x+rangeVec.x && posDot.x>=posNow.x-rangeVec.x && posDot.y>=posNow.y-rangeVec.y && posDot.y<=posNow.y+rangeVec.y){
                if(layer.getTileGIDAt(posDot)) return true;
            }
        }
        return false;
    }


    public static FourPoint(arr: Array<Object>, posNow: cc.Vec2, isCentre: boolean = false){
        if(!arr) return false;
        for(let v of arr){
            if(v["judge"]) continue;
            if(v["pos"].x == posNow.x && v["pos"].y == posNow.y && isCentre) return v["pos"];
            if(v["pos"].x == posNow.x && v["pos"].y == posNow.y+1) return v["pos"];
            if(v["pos"].x == posNow.x+1 && v["pos"].y == posNow.y) return v["pos"];
            if(v["pos"].x == posNow.x && v["pos"].y == posNow.y-1) return v["pos"];
            if(v["pos"].x == posNow.x-1 && v["pos"].y == posNow.y) return v["pos"];
        }
        return false;
    }

    public static ninePiont(arr: Array<Object>, posNow: cc.Vec2, isCentre: boolean = false){
        if(!arr) return false;
        let a = MoveControl.FourPoint(arr, posNow, isCentre);
        if(a) return a;
        for(let v of arr){
            if(v["judge"]) continue;
            if(v["pos"].x == posNow.x+1 && v["pos"].y == posNow.y+1) return v["pos"];
            if(v["pos"].x == posNow.x+1 && v["pos"].y == posNow.y-1) return v["pos"];
            if(v["pos"].x == posNow.x-1 && v["pos"].y == posNow.y-1) return v["pos"];
            if(v["pos"].x == posNow.x-1 && v["pos"].y == posNow.y+1) return v["pos"];
        }
        return false;
    }

    public static judge(pos: cc.Vec2, arr: Array<Object>){
        if(!arr) return false;
        for(let v of arr){
            if(v['judge']) continue;
            if(pos.x == v["pos"].x && pos.y == v["pos"].y) return true;
        }
        return false;
    }


    public static checkRound(pos: cc.Vec2, pattern: boolean, isHad: boolean) {
        let arr = new Array<Object>();
        if(MoveControl.judge(pos, GameSet.checkMap(objectId.mMark))){
            let data = {
                judge : true,
                buttonName: null,
                cont: null,
                id: null,
                level: 0,
            }
            data.buttonName = "取消";
            return data;
        }
        //  启动机关
        if(MoveControl.FourPoint(GameSet.checkMap(objectId.mKey), pos, true)){
            let data = { judge : true }
            data["buttonName"] = "启动";
            data["cont"] = "发动机关，配合队友可以打开门";
            data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mKey), pos, true));
            data["id"] = objectId.mKey;
            arr.push(data);
        }
        if(MoveControl.FourPoint(GameSet.checkMap(objectId.mBigBox), pos, true)){
            let data = { judge : true }
            data["buttonName"] = "撬开";
            data["cont"] = "开启宝箱，你会获得你想不到的能力!";
            data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mBigBox), pos, true));
            data["id"] = objectId.mBigBox;
            arr.push(data);
        }
        
        if(MoveControl.FourPoint(GameSet.checkMap(objectId.mSmallBox), pos, true)){
            let data = { judge : true }
            data["buttonName"] = "打开";
            data["cont"] = "开启宝箱会有意想不到的收获!";
            data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mBigBox), pos, true));
            data["id"] = objectId.mBigBox;
            arr.push(data);
        }

        if(MoveControl.FourPoint(GameSet.checkMap(objectId.mOblation), pos, true)){
            let data = { judge : true };
            data["buttonName"] = "获得";
            data["cont"] = "获取祭品，开启神之路";
            data["id"] = objectId.mOblation;
            data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mOblation), pos, true));
            arr.push(data);
        }
        // 白天的交互
        if(pattern){
            // 拾取木柴
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mWood), pos, true) && !isHad){
                let data = { judge : true }
                data["buttonName"] = "拾取";
                data["cont"] = "拾取木头已被不时之需。";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mWood), pos, true));
                data["id"] = objectId.mWood;
                arr.push(data);
            }
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mChip), pos, true)){
                let data = { judge : true }
                data["buttonName"] = "收集";
                data["cont"] = "离收集圆满越来越近了";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mChip), pos, true));
                data["id"] = objectId.mChip;
                arr.push(data);
            }
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mTrap), pos, true) && isHad){
                let data = { judge : true }
                data["buttonName"] = "填补";
                data["cont"] = "填补上，就可以安全通过了。";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mTrap), pos, true));
                data['id'] = objectId.mTrap;
                arr.push(data);
            }
            if(MoveControl.ninePiont(GameSet.checkMap(objectId.mFire), pos) && isHad){
                let data = { judge : true }
                data["buttonName"] = "添柴";
                data["cont"] = "往火堆中添加，可以扩大视野范围。";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.ninePiont(GameSet.checkMap(objectId.mFire), pos));
                data['id'] = objectId.mFire;
                arr.push(data);
            }
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mHorn), pos, true)){
                let data = { judge : true }
                data["buttonName"] = "使用";
                data["cont"] = "这就是传说中的声波仪耶";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mHorn), pos));
                data["id"] = objectId.mHorn;
                arr.push(data);
            } 
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mGodMachine), pos, true)){    
                let data = { judge : true };
                data["buttonName"] = "获得"
                data["cont"] = "获得神器才能安全的踏上神之路";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mGodMachine), pos, true));
                data["id"] = objectId.mGodMachine;
                arr.push(data);
            } 
        }
        else{
            if(MoveControl.ninePiont(GameSet.checkMap(objectId.mBoss), pos)){
                let data = { judge : true }
                data["buttonName"] = "击杀";
                data["cont"] = "消灭它，我可以获取更多的能量";
                data['level'] = MoveControl.judgeLevel(pos, MoveControl.ninePiont(GameSet.checkMap(objectId.mBoss), pos));
                data["id"] = objectId.mBoss;
                arr.push(data);
            }
            if(MoveControl.ninePiont(GameSet.checkMap(objectId.mMonster), pos)){
                let data = { judge : true };
                data["buttonName"] = "清除";
                data["cont"] = '哪里来的小怪，找死';
                data['level'] = MoveControl.judgeLevel(pos, MoveControl.ninePiont(GameSet.checkMap(objectId.mMonster), pos));
                data["id"] = objectId.mMonster;
                arr.push(data)
            }
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mFireRing), pos, true)){
                let data = { judge : true }
                data["buttonName"] = "使用";
                data["cont"] = "我感受到了火环的存在， 就在这里";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mFireRing), pos))
                data["id"] = objectId.mFireRing;
                arr.push(data)
            }
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mChip), pos, true)){
                let data = { judge : true }
                data["buttonName"] = "收集";
                data["cont"] = "离收集圆满越来越近了";
                data["level"] = MoveControl.judgeLevel(pos, MoveControl.FourPoint(GameSet.checkMap(objectId.mChip), pos));
                data["id"] = objectId.mChip;
                arr.push(data);
            }
        }
        let a;
        for(let k in arr){
            let v = arr[k];
            if(v["level"] == 1) return v;
            if(!a && v["level"]){
                a = v;
            }else{
                if(v["level"] && v["level"] < a["level"]){
                    a = v;
                }
            }
            if(Number(k) == arr.length-1) return a;
        }
        
        let data = {
            judge : true,
            buttonName: null,
            cont: null,
            id: -1,
            level: 0,
        }
        if(MoveControl.FourPoint(GameSet.checkMap(objectId.mChipOther), pos)){
            data.cont = "引导队友前来捡取";
            return data;
        }
        else if(MoveControl.FourPoint(GameSet.checkMap(objectId.mKeyOther), pos)){
            data.cont = "这是队友能触发的机关";
            return data;
        }
        else if(MoveControl.FourPoint(GameSet.checkMap(objectId.mGate), pos)){
            data.cont = "打开各自对应的机关，就能打开这扇门了";
            return data;
        }
        else if(MoveControl.FourPoint(GameSet.checkMap(objectId.mOblationOther), pos)){
            data.cont = "引导队友来获取祭品";
            return data;
        }else if(MoveControl.FourPoint(GameSet.checkMap(objectId.mDestination), pos) && pattern){
            data.cont = "引导队友到色块上，开启下一关";
            return data;
        }else if(MoveControl.FourPoint(GameSet.checkMap(objectId.mStressKey), pos)){
            data.cont = "站在压力板上，可以打开对应的门"
            return data;
        }

        data.judge = false;
        return data;
    }

    public static checkDanger(pos: cc.Vec2, pattern: boolean, isHad: boolean) {
        if(MoveControl.ninePiont(GameSet.checkMap(objectId.mPool), pos)){
            return "水坑中央掉下去会受伤的。";
        }
        if(MoveControl.ninePiont(GameSet.checkMap(objectId.mMonster), pos)){
            return "附近有怪物，要小心。";
        }
        if(MoveControl.ninePiont(GameSet.checkMap(objectId.mBoss), pos)){
            return "附近有怪物，要小心。";
        }
        if(pattern){
            if(MoveControl.FourPoint(GameSet.checkMap(objectId.mWood), pos) && !isHad){
                return "掉下去会受伤的，用木板可以填补。";
            }
            return false;
        }
        return false;
    }

    public static judgeLevel(posCenter: cc.Vec2, posNow: cc.Vec2){
        if(posCenter.x == posNow.x && posCenter.y == posNow.y){
            return 1;
        }
        else if(posCenter.x == posNow.x && posCenter.y-1 == posNow.y){
            return 2;
        }
        else if(posCenter.y == posNow.y && posCenter.x+1 == posNow.x){
            return 3;
        }
        else if(posCenter.x == posNow.x && posCenter.y+1 == posNow.y){
            return 4;
        }
        else if(posCenter.y == posNow.y && posCenter.x-1 == posNow.x){
            return 5;
        }
        else{
            return 6;
        }
    }

    public static clearRound(layer: cc.TiledLayer, pos: cc.Vec2){
        layer.setTileGIDAt(0, pos, 0)
        layer.setTileGIDAt(0, pos.x, pos.y-1, 0);
        layer.setTileGIDAt(0, pos.x, pos.y+1, 0);
        layer.setTileGIDAt(0, pos.x-1, pos.y, 0);
        layer.setTileGIDAt(0, pos.x-1, pos.y+1, 0);
        layer.setTileGIDAt(0, pos.x-1, pos.y-1, 0);
        layer.setTileGIDAt(0, pos.x+1, pos.y, 0);
        layer.setTileGIDAt(0, pos.x+1, pos.y-1, 0);
        layer.setTileGIDAt(0, pos.x+1, pos.y+1, 0);
    }
} 