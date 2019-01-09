// declare let ms : any = new Object();

// interface Window {
//     ms: any;
// }

interface String {
    format(...args): string;
}

interface Object {
    assign(...args): void;
}

// declare module cc {
//     export module Event {
//         export class EventCustom extends Event {	
//             /**
//             !#en Gets user data
//             !#zh 获取用户数据 
//             */
//             getLocation(): any;			
//             /**
//             !#en Gets event name
//             !#zh 获取事件名称 
//             */
//             getStartLocation(): any;
//         }	
//     }

//     export module Sprite {
//         setState(arg: any): any;
//     }
// }
