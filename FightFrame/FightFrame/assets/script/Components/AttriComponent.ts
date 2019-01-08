import { Component } from "./Component";
import { Actor } from "../Battle/Actor";
import { eComponent } from "../Battle/BattleDef";

export class AttriComponent extends Component{
    mName = eComponent.AttriComponent;
    _value = new Object();  // 加成值
    _rawValue = new Object();  // 原始值

    constructor(owner: Actor, data: any){
        super(owner);
        this._init(data)
    }

    private _init(data: Object) {
        this._value = data;
        this._rawValue = {};
        for (let key in this._value){
            this._rawValue[key] = this._value[key];
        }
    }

    refresh(data: Object) {
        for(let key in data){
            this._value[key] = data[key];
        }
    }

    get(key) {
        return this._value[key] || 0;
    }

    getRaw(key) {
        return this._rawValue[key]  || 0;
    }

    set(key, value) {
        return this._value[key] = value;
    }

    add(key, value) {
        let v = this.get(key);
        this.set(key, v+value);

        return (v+value)
    }
}