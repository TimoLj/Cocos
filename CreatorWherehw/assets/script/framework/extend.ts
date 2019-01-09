String.prototype["format"] = function() {
    var self = this;
    if(arguments.length <= 0) return self;

    for (var i = 0; i < arguments.length; i++) {
        self = self.replace("{?}", arguments[i]);
    }
    return self;
}

String["format"] = function(){
    if( arguments.length == 0 )
        return null;

    var str = arguments[0];
    for(var i=1;i<arguments.length;i++) {
        // var re = new RegExp('\\{' + (i-1) + '\\}','gm');
        // str = str.replace(re, arguments[i]);
        str = str.replace("{?}", arguments[i]);
    }
    return str;
};

String["padChar"] = function(){
    var as=[].slice.call(arguments);
    var fmt = as.shift();
    var i=0;
    return fmt.replace(/%(\w)?(\d)?([dfsx])/ig, function(_,a,b,c){
          var s=b?new Array(b-0+1).join(a||''):'';
          if(c=='d') s+=parseInt(as[i++]);
          return b?s.slice(b*-1):s;
     });
};

String.prototype["trim"] = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
};

String.prototype["ltrim"] = function(){
    return this.replace(/(^\s*)/g,"");
};

String.prototype["rtrim"] = function(){
    return this.replace(/(\s*$)/g,"");
};

String["trim"] = function(str){
    var str1 = str;
    return str1.trim();
};

String["ltrim"] = function(str){
    var str1 = str;
    return str1.ltrim();
};

String["rtrim"] = function(str){
    var str1 = str;
    return str1.rtrim();
};

export {}
