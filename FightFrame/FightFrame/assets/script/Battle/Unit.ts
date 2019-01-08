import { eUnitType, eUnitGroup } from "./BattleDef";
import { Component } from "../Components/Component";

export abstract class Unit {
    mUID: number;               // 单位唯一标识符
    mName: string;
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    rotation: number = 0;       // 旋转
    mFaceTo: number = 1;        // 朝向 1 朝右 -1 朝左
    mIsDead: boolean = false;           
    mUnitType: number = eUnitType.mNull;
    mGroup: number = eUnitGroup.mNull;
    mComponents = new Object();
    mData: any;

    public abstract onUpdate(dt);
    public abstract onLaterUpdate(dt);
    public abstract onUnitCollider(collider);

    addComponent(component: Component) {
        if(!component.mName){
            console.error(`${component.mName} is exist`);
            return;
        }

        if(this.getComponent(component.mName)){
            console.error(`${component.mName} is exist`);
        }

        // 注意个component的执行顺序
        this.mComponents[component.mName] = component;
    }

    getComponent<C>(name: string): C {
        return this.mComponents.hasOwnProperty(name) ? this.mComponents[name] : null;
    }

}