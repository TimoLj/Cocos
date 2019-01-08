const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    onLoad () {
        let self = this;
        cc.loader.loadRes("prefab/pnlBattle/pnlBattle", cc.Prefab, (err, res)=>{
            let a = cc.instantiate(res);
            self.node.addChild(a);
        })
    }

    start () {

    }

    // update (dt) {}
}
