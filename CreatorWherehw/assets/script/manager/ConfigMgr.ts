import { Util } from "../framework/util";

export class ConfigMgr{
    private static _configs = {};
    
    public static init(url, cb) {
        cc.loader.loadResDir(url, (err, objects, urls) => {
            if(err){
                cc.log("config load err");
                return;
            }

            for (var i = urls.length - 1; i >= 0; i--) {
                this._configs[urls[i]] = objects[i].json;
            };

            cb && cb();
            cc.log('config load ok!');
        });
    }

    public static getById(url, id) {
        const profile = this._configs['config/'+url];
        return profile ? profile[id] : null;
    }

    public static cloneById(url, id) {
        var profile = this._configs['config/'+url];
        return profile ? Util.clone(profile[id]) : null;
    }

    public static getAll(url) {
        return this._configs['config/'+url];
    }

    public static cloneAll(url) {
        var profile = this._configs['config/'+url];
        return Util.clone(profile);
    }
}
