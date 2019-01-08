import { Component } from "./Component";
import { Actor } from "../Battle/Actor";
import { eComponent } from "../Battle/BattleDef";

export class BuffComponent extends Component{
    mName = eComponent.BuffComponent;

    constructor(owner: Actor){
        super(owner)
    }


    





}