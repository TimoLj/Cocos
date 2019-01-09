import { eLayer, eNotifyEvent } from "./DefMgr";

export class CommonMgr {
    static alert(arg0: string, arg1: string, arg2: string, arg3: () => void): any {
        throw new Error("Method not implemented.");
    }
    private static _errorProfile = {};
    private static _blockCount = 0;
    private static _shadow = null;
    private static _now: number = Date.now();

    public static setShadow(shadow) {
        this._shadow = shadow;
    }

    public static loadRes(url, type, completeCallback?, block?) {
        // block = !block;

        // if(block){
        //     this._blockCount++;
        //     if (!ms.root.block || !cc.isValid(ms.root.block)){
        //         cc.loader.loadRes("Prefabs/Common/pnlBlock", cc.Prefab, (err, res) => {
        //             let go = cc.instantiate(res);
        //             ms.root.addChild(go, eLayer.LAYER_BLOCK);
        //             ms.root.block = go;
        //         })
        //     }
        //     else{
        //         ms.root.block.active = true;
        //     }
        // }

        return cc.loader.loadRes(url, type, (err, res) => {
            if (err) throw Error(url);
            // if(block){            
            //     this._blockCount--;
            //     if (this._blockCount === 0) ms.root.block.active = false;
            // } 

            if (err) cc.error(err);
            if (completeCallback) {
                completeCallback(err, res);
                // cc.loader.setAutoReleaseRecursively(res, true);
                // cc.loader.setAutoRelease(res, true);
            }
        });
        // cc.loader.loadRes(url, type, completeCallback);
    }

    public static changeSprite(sprite, url) {
        if (!sprite || !sprite.node || !sprite.node.isValid) return;
        if (!url) {
            sprite.spriteFrame = null;
            return;
        }

        this.loadRes(url, cc.SpriteFrame, (err, res) => {
            if (!sprite || !sprite.node || !sprite.node.isValid) return;
            sprite.spriteFrame = res;
        }, false);
    };


    public static genError(errorCode, errorParam) {
        // Http.logError(errorCode, errorParam);
    }

    public static getError(errorCode, errorParam?) {
        var profile = this._errorProfile[errorCode];
        profile = profile || { TITLE: "警告", MSG: "未知错误! 错误码: " + errorCode, DESC: "未知错误", NEXT: "确定" };
        return profile;
    }

    public static changeButton(button, flag) {
        button.interactable = flag;
        button.node.color = flag ? cc.color(255, 255, 255) : cc.color(153, 153, 153);
        for (let child of button.node.children) {
            child.color = flag ? cc.color(255, 255, 255) : cc.color(153, 153, 153);
        }
    }

    public static loadScene(name, shadow) {
        if (!shadow) {
            cc.director.loadScene(name)
        } else {
            this._shadow.getComponent(this._shadow.name).show();
            cc.director.loadScene(name, function () {
                this._shadow.getComponent(this._shadow.name).hide();
            });
        }
    }

    public static isInBox(rect, point) {
        return point.x >= rect.x && point.x <= (rect.x + rect.width) && point.y >= rect.y && point.y <= (rect.y + rect.height);
    }

    public static addNode(node, layer) {
        var scene = cc.director.getScene();
        var canvas = cc.find("Canvas", scene);
        canvas.addChild(node, layer);
    }

    public static tick(dt: number) {
        this._now += Math.round(dt * 1000);
    }

    public static updateNow(now) {
        this._now = now;
    }

    public static currentTime() {
        return this._now;
    }
}