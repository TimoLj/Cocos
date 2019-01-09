import {Plat} from "./plat"

export class Http{
    private static _location = "http://132.232.13.38:11111";
    
    public static genGift(param, cb){
        var url = this._location + "/cdkey/gencdkey";
        this.requestCommon(function(err, resp){ cb && cb(err, resp); }, param, url, "POST");
    }

    public static addMail(mail, cb){
        var url = this._location + "/mail/addmail";
        this.requestCommon(function(err, resp){ cb && cb(err, resp); }, mail, url, "POST");
    }
    
    // exports.logError = function(reason, msg, errUrl, location, stack, cb){
    //     var url = S_LOG_URL + "/record/logerror";
    //     var t = {};
    //     t.reason = reason;
    //     t.msg = msg;
    //     t.url = errUrl;
    //     t.location = location;
    //     t.stack = stack;
    //     _requestCommon(function(err, resp){ cb && cb(err, resp); }, t, url, "POST");
    // }
    
    
    private static requestCommon(cb, params, url, method){
        var xhr = cc.loader.getXMLHttpRequest();
        // streamXHREventsToLabel(xhr, xhr, xhrResp, 'GET');
    
        // xhr.open("GET", "https://httpbin.org/get?show_env=1", true);
        // if (cc.sys.isNative) {
        //     xhr.setRequestHeader("Accept-Encoding","gzip,deflate");
        // }
        
        xhr["cb"] = cb;
        xhr.timeout = 15000;
        // cc.log(url)
        xhr.onreadystatechange = function () {
            if (!xhr || xhr["isAborted"]) return;
            if (xhr.readyState == 4) { // && (xhr.status >= 200 && xhr.status < 400)) {
                // cc.log("onreadystatechange, readyState=%s, status=%s", xhr.readyState, xhr.status);
                if(!xhr["cb"]) return;
    
                var response = xhr.responseText;
                var resp = {
                    code : 1001,
                    msg : "数据异常",
                };
                if(xhr.status == 200){
                    try{
                        resp = JSON.parse(response);
                    }catch(e){
                        resp = {
                            code : 1001,
                            msg : "获取数据失败",
                        };
                    }
                    xhr["cb"](null, resp);    
                }else{
                    resp = {
                        code : 1001,
                        msg : "访问结果异常",
                    };
                    xhr["cb"](xhr.status || -1, resp);
                }
    
                delete xhr["cb"];
            }
            // else if(xhr.readyState == 1){
            //     xhr.setRequestHeader("Access-Control-Allow-Origin", "http://entrance1.xxxy.dayukeji.com"); 
            // }
        };
    
        xhr.onerror = function(){
            if (!xhr["cb"]) return;
            var resp = {
                code : 1001,
                msg : "访问出错",
            };
            xhr["cb"](-2, resp);
            delete xhr["cb"];
        };
    
        xhr.ontimeout = function(){
            xhr["isAborted"] = true;
            xhr.abort();
            if (!xhr["cb"]) return;
        
            var resp = {
                code : 1001,
                msg : "访问超时",
            };
            xhr["cb"](-1, resp);
            delete xhr["cb"];
        };
    
        params = params || {};
       
        var strParam = "";
        for(var key in params) {
            if (strParam.length > 0){
               strParam = strParam + "&";
            }
    
            strParam = strParam + "{?}={?}".format(key, params[key]);
        }
        
        if (cc.sys.isNative) {
            if("win32" != Plat.plat()){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate");    
            }
        }
    
        method = method || "GET";
        if(method == "GET"){
            if (strParam.length > 0){
                url = encodeURI("{?}?{?}&{?}={?}".format(url, strParam, "ts" + Date.now(), Date.now()));
            }
    
            xhr.open('GET', url, true);
            xhr.send();
        }else{
            xhr.open('POST', url, true);
            strParam = encodeURI(strParam);
            xhr.send(strParam);
        }
    }
}