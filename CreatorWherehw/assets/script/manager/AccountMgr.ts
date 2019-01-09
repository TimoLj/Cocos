import { Cache } from "../framework/cache";


export default class AccountMgr {
    private _accountsList: Object = new Object();//key存username，value存pwd
    private static _instance: AccountMgr = null;
    private baseStrUserName = "UN_WHEREHW_";
    private baseStrPwd = "PWD_WHEREHW_"
    private constructor() {
        for (let i = 1; i <= 8; i++) {
            let UserNameKey = this.baseStrUserName + i.toString();
            let PWDKey = this.baseStrPwd + i.toString();
            if (Cache.get(UserNameKey)) {
                let UNValue = Cache.get(UserNameKey);
                let PWDValue = Cache.get(PWDKey);
                this._accountsList[UNValue] = PWDValue;
            }
        }
    }

    public static Instance() {
        this._instance = this._instance || new AccountMgr();
        return this._instance;
    }

    public AddOneAccount(UserName: number, Pwd: number) {
        //cc.log(this._accountsList,"act list");
        if (this._accountsList.hasOwnProperty(UserName)) {
            //cc.log("账号缓存过，不需要再次缓存");
            return;
        }
        let serial = Object.keys(this._accountsList).length + 1;
        let UNKey = this.baseStrUserName + serial.toString();
        let PWDKey = this.baseStrPwd + serial.toString();
        if (serial > 8) {
            cc.log("缓存账号已达八个，无法添加新账号");
            // this.refreshAccount(UserName, Pwd);
            return;
        }
        this._accountsList[UserName] = Pwd;
        Cache.set(UNKey, UserName);
        Cache.set(PWDKey, Pwd);
    }

    public RemoveOneAccount(UserName: number) {
        if (!this._accountsList.hasOwnProperty(UserName)) {
            cc.log("账号不存在");
            return;
        }
        for (let i = 1; i <= 8; i++) {
            if (Cache.get(this.baseStrUserName + i) == UserName) {
                delete this._accountsList[UserName];
                Cache.remove(this.baseStrUserName + i);
                Cache.remove(this.baseStrPwd + i);
                return;
            }

        }

    }

    public GetAccountList() {
        return this._accountsList;
    }

    private refreshAccount(UserName: number, Pwd: number) {
        let i = 1;
        for (let key in this._accountsList) {
            if (i == 1) {
                Cache.remove(this.baseStrUserName + i);
                Cache.remove(this.baseStrPwd + i);
                delete this._accountsList[key];
            }
            else {

            }
            i = i + 1;
        }
    }

}