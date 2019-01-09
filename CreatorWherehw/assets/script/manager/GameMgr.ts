import { DataMgr } from "./DataMgr";
import { Cache } from "../framework/cache";
import { ConfigMgr } from "./ConfigMgr";
import { eGameState } from "./DefMgr";

export class GameMgr{
    private static gameState: number = eGameState.Main;

    private static initData(){
        //重新开局初始化数据
        

        //item
        var thingCfgs = ConfigMgr.getAll("Thing");
        for(let key in thingCfgs){
            var thingCfg = thingCfgs[key];
            if(thingCfg.Type == 0 || thingCfg.Type == 1){
                // ms.ThingMgr.addItem(key, 200);
            }else if(thingCfg.Type == 2){

            }
        }
        DataMgr.dataInitComplete();

        cc.log("init data compelete")
    }

    public static initGame(force?){
        if(force){//强制重开
            DataMgr.resetCore();
            this.initData();
        }else{
            var core = Cache.get(Cache.CK_CORE);     
            if(!core){
                DataMgr.resetCore();
                this.initData();
            }else{
                DataMgr.initCore(JSON.parse(core));
                if(!DataMgr.isDataInit()){
                    this.initData();
                }
            }
        }

        // Notify.emit(eNotifyEvent.InitGame);
    }

    public static restartGame(){

    }

    public static getGameState() {
        return GameMgr.gameState;
    }

    public static changeGameState(state: number){
        GameMgr.gameState = state;
        return GameMgr.gameState;
    }
}