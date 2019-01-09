export class Util {
    private static index: number = 0;//全局唯一id分配，每次重启游戏重置
    private static S_JSB_FUNC_ID = 1000;
    private static S_JSB_FUNC = {};

    public static unique() {
        return ++this.index;
    }

    public static random(from, to) {
        var abs = Math.abs(to - from) + 1;
        var rand = Math.floor(Math.random() * abs);
        var min = Math.min(from, to);
        return (min + rand);
    }

    public static clone(a) {
        if (!a) return a;
        return JSON.parse(JSON.stringify(a))

        //     var at = typeof(a);
        //     if (at == "object" ){
        //         // 忽略所有组件类型的 "deep copy"
        //         if(a.__classname__  && typeof(a.__classname__) == "string" && a.__classname__.startsWith("cc.") ){
        //             return a;
        //         }

        //         if(a.__classname__){
        //             return a;
        //         }
        //         var ret = (a instanceof Array) ? [] : {};
        //         for(var key in a) {

        //             if(key.startsWith("_")){
        //                 ret[key] = a[key];
        //             }else{
        //                 ret[key] = this.clone(a[key]);    
        //             }
        //         }
        //         return ret;
        //     }
        //     return a;
    }

    public static isSameTime(time1, time2) {
        if (!time1 || !time2) return false;

        var date1 = new Date(time1);
        var date2 = new Date(time2);

        if (date1.getFullYear() != date2.getFullYear()) return false;
        if (date1.getMonth() != date2.getMonth()) return false;
        if (date1.getDate() != date2.getDate()) return false;
        return true
    }

    public static webCopyString = function (str) {
        // console.log('复制');
        var input = str;
        const el = document.createElement('textarea');
        el.value = input;
        el.setAttribute('readonly', '');
        // el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS

        const selection = getSelection();
        var originalRange;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        var success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) { }

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        return success;
    }

    public static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public static delegate(client, clientMethod) {
        return function () {
            return clientMethod.apply(client, arguments);
        }
    }

    public static handler(client, clientMethod) {
        return this.delegate(client, clientMethod);
    }

    public static extend(subClass, superClass) {
        var F = function () { };
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
        subClass.superclass = superClass.prototype;
        if (superClass.prototype.constructor == Object.prototype.constructor) {
            superClass.prototype.constructor = superClass;
        }
    }

    public static formatTime(value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        var theTime3 = 0;// 天
        if (theTime > 60) {
            theTime1 = Math.floor(theTime / 60);
            theTime = Math.floor(theTime - theTime1 * 60);
            if (theTime1 > 60) {
                theTime2 = Math.floor(theTime1 / 60);
                theTime1 = Math.floor(theTime1 - theTime2 * 60);
                if (theTime2 > 24) {
                    theTime3 = Math.floor(theTime2 / 24);
                    theTime2 = Math.floor(theTime2 - theTime3 * 24);
                }
            }
        } else {
            return theTime + '秒';
        }

        var result = "";
        if (theTime1 > 0) {
            result = "" + theTime1 + "分" + result;
        }
        if (theTime2 > 0) {
            result = "" + theTime2 + "小时" + result;
        }
        if (theTime3 > 0) {
            result = "" + theTime3 + "天" + result;
        }
        return result;
    }

    // 将 callback 转化为 func_id 
    public static pushInvoke(cb) {
        var funcId = (++this.S_JSB_FUNC_ID);
        this.S_JSB_FUNC[funcId] = cb;
        return funcId;
    }

    // 将 func_id 转化为 callback(默认将其删除)
    public static popInvoke = function (funcId, bReserve) {
        bReserve = bReserve || false;
        var cb = this.S_JSB_FUNC[funcId];
        if (!bReserve) {
            delete this.S_JSB_FUNC[funcId];
        }
        return cb;
    }

    public static getParam(name, def?) {
        if (cc.sys.isBrowser) {
            var val = null,
                reg = new RegExp('[\\?&]' + name + '=([^&]+)', 'i');
            if (reg.test(document.location.search)) {
                val = RegExp.$1;
            }
            return val ? decodeURIComponent(val) : def;
        }
        return def;
    }

    //按钮点击后，隔一段时间后才能再次点击
    public static setBtnClickInterval(button, timeInterval) {
        button.interactable = false;
        setTimeout(() => {
            button.interactable = true;
        }, timeInterval);
    }


    public static delHtmlTag(str) {
        if (!str) return str;
        return str.replace(/<[^>]+>/g, "");//去掉所有的html标记
    }

    public static genCode(count) {
        var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '2', '3', '4', '5', '6', '7', '8', '9'];
        var code = "";
        for (var i = 0; i < count; i++) {
            code += chars[this.random(0, chars.length - 1)];
        }
        return code;
    }
}




