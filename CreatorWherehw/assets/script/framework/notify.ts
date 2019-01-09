export class Notify{
    private static _eventMap = {};

    public static on(type, callback, target) {
        if (this._eventMap[type] === undefined) {
            this._eventMap[type] = [];
        }
        this._eventMap[type].push({ callback: callback, target: target });
    }
    
    public static emit(type, ...args) {
        var array = this._eventMap[type];
        if (array === undefined) return;
    
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element) element.callback.call(element.target, args);
        }
    }
    
    public static off(type, callback) {
        var array = this._eventMap[type];
        if (array === undefined) return;
    
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element && element.callback === callback) {
                array[i] = undefined;
                break;
            }
        }
    }
    
    public static offType(type) {
        delete this._eventMap[type];
    }
}