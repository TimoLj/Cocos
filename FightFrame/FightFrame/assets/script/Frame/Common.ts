export class Common {
    static procnt (obj: object) {   // 获取对象长度
        if(!obj || obj === null) return 0;
        return Object.getOwnPropertyNames(obj).length;
    }

    static clone(a){
        if(!a){
            return a;
        }
        let at: String = typeof(a);
        if(at == "object"){
            if(a.__classname__){
                return a;
            }
            let ret = (a instanceof Array) ? [] : {};
            for(let key in a){
                if(key.startsWith("_")){
                    ret[key] = a[key];
                }
                else{
                    ret[key] = Common.clone(a[key]);
                }
            }
            return ret;
        }
        return a;
    }

}