import { Common } from "./common";

export class ConfigMgr {
    static configs = new Object();

    static init(url, cb) {
        cc.loader.loadResDir(url, (err, obj, urls: Array<any>)=>{
            if(err){
                cc.log(`config load error`)
                return;
            }
            for(let i = urls.length-1; i>=0; i--){
                ConfigMgr.configs[urls[i]] = obj[i].json;
            }
            ConfigMgr.dealConfig();
            cb && cb();
            cc.log(`config load ok !`);
        })

    }

    static dealConfig() {
        for(let key in ConfigMgr.configs){
            let value = ConfigMgr.configs;
            if(key == `config/Dorp`){
                let temp = new Object();
                for(let k in value){
                    let v = value[k];
                    temp[v.Type] = temp[v.Type] || {};
                    temp[v.Type][v.ID] = v;
                }
                ConfigMgr.configs[key] = temp;
            }
            else if(key == `config/Album`){
                let temp = new Object();
                for(let k in value){
                    let v = value[k];
                    temp[v.Type] = temp[v.Type] || {};
                    temp[v.Type][v.MappingID] = v.UnlockCon;
                }
                ConfigMgr.configs[`config/AlbumCon`] = temp;
            }
        }
    }

    static getById(url: String, id: Number) {
        const profile = ConfigMgr.configs[`config/${url}`];
        return profile ? profile[id] : null;
    }


    static cloneById(url: String, id: Number) {
        let profile = ConfigMgr.configs[`config/${url}`];
        return profile ? Common.clone(profile[id]) : null;
    }

    static getAll(url) {
        return ConfigMgr.configs[`config/${url}`];
    }

    static cloneAll(url) {
        let profile = ConfigMgr.configs[`config/${url}`];
        return Common.clone(profile);
    }

}