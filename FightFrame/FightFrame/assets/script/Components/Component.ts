import { Unit } from "../Battle/Unit";

export abstract class Component {
    mName: string;

    protected mOwner : Unit;

    constructor(mOwner: Unit) {
        this.mOwner = mOwner;
    }

    init() {
        
    }

    update(dt) {

    }
 
}