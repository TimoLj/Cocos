
import KBEDebug from "./KBEDebug";
import KBEEvent from "./Event";
import MemoryStream from "./MemoryStream";
import Message from "./Message";


export class MessageReader{
    READ_STATE_MSGID = 0
    // 消息的长度65535以内
    READ_STATE_MSGLEN = 1
    // 当上面的消息长度都无法到达要求时使用扩展长度
    // uint32
    READ_STATE_MSGLEN_EX = 2
    // 消息的内容
    READ_STATE_BODY = 3
    msgid=0
    msglen=0
    expectSize=2
    state=0
    stream:MemoryStream
    constructor(){
        this.stream=new MemoryStream(0)
    }
    process(datas){
        let length=datas.byteLength
        let totallen=0 //一点点加上去
        while(length>0&&this.expectSize>0){
            if(this.state==this.READ_STATE_MSGID){
                if(length >= this.expectSize)
                {
                    this.stream.append(datas.slice(totallen,totallen+this.expectSize))
                    totallen += this.expectSize;
                    length -= this.expectSize;
                    this.msgid = this.stream.ReadUint16();
                    this.stream.clear();

                    let msgHandler: Message = Message.clientMassges[this.msgid];
                    if (!msgHandler) {
                        KBEDebug.ERROR_MSG("onmessage[]: not found msg(" + this.msgid + ")!");
                    }

                    if(msgHandler.length == -1)
                    {
                        this.state = this.READ_STATE_MSGLEN;
                        this.expectSize = 2;
                    }
                    else if(msgHandler.length == 0)
                    {
                        // 如果是0个参数的消息，那么没有后续内容可读了，处理本条消息并且直接跳到下一条消息
                        msgHandler.HandleMessage(this.stream);

                        this.state = this.READ_STATE_MSGID;
                        this.expectSize = 2;
                    }
                    else
                    {
                        this.expectSize = msgHandler.length
                        this.state = this.READ_STATE_BODY;
                    }
                }
                else
                {
                    this.stream.append(datas.slice(totallen,totallen+length))
                    this.expectSize -= length;
                    break;
                }
            }else if(this.state == this.READ_STATE_MSGLEN){
                if(length >= this.expectSize)
                {
                    this.stream.append(datas.slice(totallen,totallen+this.expectSize))
                    totallen += this.expectSize;
                    length -= this.expectSize;

                    this.msglen = this.stream.ReadUint16();
                    this.stream.clear();

                    // 长度扩展
                    if(this.msglen >= 65535)
                    {
                        this.state =this.READ_STATE_MSGLEN_EX;
                        this.expectSize = 4;
                    }
                    else
                    {
                        this.state = this.READ_STATE_BODY;
                        this.expectSize = this.msglen;
                    }
                }
                else
                {
                    this.stream.append(datas.slice(totallen,totallen+length))
                    this.expectSize -= length;
                    break;
                }
            }else if(this.state == this.READ_STATE_MSGLEN_EX)
            {
                if(length >= this.expectSize)
                {
                    this.stream.append(datas.slice(totallen,totallen+this.expectSize))
                    totallen += this.expectSize;
                    length -= this.expectSize;

                    this.expectSize = this.stream.ReadUint32();
                    this.stream.clear();

                    this.state = this.READ_STATE_BODY;
                }
                else
                {
                    this.stream.append(datas.slice(totallen,totallen+length))
                    this.expectSize -= length;
                    break;
                }
            }else if(this.state == this.READ_STATE_BODY)
            {
                if(length >= this.expectSize)
                {
                    this.stream.append(datas.slice(totallen,totallen+this.expectSize))
                    totallen += this.expectSize;
                    length -= this.expectSize;

                    let  msg:Message = Message.clientMassges[this.msgid];
                    if (!msg) {
                        KBEDebug.ERROR_MSG("onmessage[]: not found msg(" + this.msgid + ")!");
                    }

                    msg.HandleMessage(this.stream);
                    this.stream.clear();

                    this.state = this.READ_STATE_MSGID;
                    this.expectSize = 2;
                }
                else
                {
                    this.stream.append(datas.slice(totallen,totallen+length))
                    this.expectSize -= length;
                    break;
                }
            }
        }
    }
}

export default class NetworkInterface
{
    private socket: WebSocket = undefined;
    private onOpenCB: Function = undefined;
    messageReader:MessageReader

    get IsGood(): boolean
    {
        return this.socket != undefined && this.socket.readyState === WebSocket.OPEN;
    }

    ConnectTo(addr: string, callbackFunc?: (event:Event)=>any)
    {
        try
        {
            this.socket = new WebSocket(addr);
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Connect:Init socket error:" + e);
            KBEEvent.Fire("onConnectionState", false);
            return;
        }

        this.socket.binaryType = "arraybuffer";

        this.socket.onerror = this.onerror;
        this.socket.onclose = this.onclose;
        this.socket.onmessage = this.onmessage;
        this.socket.onopen = this.onopen;
        this.messageReader=new MessageReader()
        if(callbackFunc)
        {
            this.onOpenCB = callbackFunc;
        }
    }

    Close()
    {
        try
        {
            KBEDebug.INFO_MSG("NetworkInterface::Close on good:" + this.IsGood)
            if(this.socket != undefined)
            {
                this.socket.close();
                this.socket.onclose = undefined;
                this.socket = undefined;
                KBEEvent.Fire("onSocketClosed");
            }
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Close error:%s.", e);
        }
    }

    Send(buffer: ArrayBuffer)
    {
        if(!this.IsGood)
        {
            this.Close()
            KBEDebug.ERROR_MSG("NetworkInterface::Send:socket is unavailable.");
            return;
        }

        try
        {
            KBEDebug.DEBUG_MSG("NetworkInterface::Send buffer length:[%d].", buffer.byteLength);
            this.socket.send(buffer);
        }
        catch(e)
        {
            KBEDebug.ERROR_MSG("NetworkInterface::Send error:%s.", e);
        }
    }

    private onopen = (event: MessageEvent) =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onopen:success!");
        if(this.onOpenCB)
        {
            this.onOpenCB(event);
            this.onOpenCB = undefined;
        }
    }
    
    private onerror = (event: MessageEvent) =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onerror:...!");
        KBEEvent.Fire("onNetworkError", event);
    }

    private onmessage = (event: MessageEvent) =>{
        this.messageReader.process(event.data)
    }
    //
    // private onmessage = (event: MessageEvent) =>
    // {
    //     let data: ArrayBuffer = event.data;
    //     //KBEDebug.DEBUG_MSG("NetworkInterface::onmessage:...!" + data.byteLength);
    //     let stream: MemoryStream = new MemoryStream(data);
    //     stream.wpos = data.byteLength;
    //
    //     while(stream.rpos < stream.wpos)
    //     {
    //         let msgID = stream.ReadUint16();
    //         //KBEDebug.DEBUG_MSG("NetworkInterface::onmessage:...!msgID:" + msgID);
    //
    //         let handler: Message = Message.clientMassges[msgID];
    //         if(!handler)
    //         {
    //             KBEDebug.ERROR_MSG("NetworkInterface::onmessage:message(%d) has not found.", msgID);
    //         }
    //         else
    //         {
    //             let msgLen = handler.length;
    //             if(msgLen === -1)
    //             {
    //                 msgLen = stream.ReadUint16();
    //                 if(msgLen === 65535)
    //                 {
    //                     msgLen = stream.ReadUint32();
    //                 }
    //             }
    //
    //             let wpos = stream.wpos;
    //             let rpos = stream.rpos + msgLen;
    //             stream.wpos = rpos;
    //             handler.HandleMessage(stream);
    //             stream.wpos = wpos;
    //             stream.rpos = rpos;
    //         }
    //     }
    // }

    private onclose = () =>
    {
        KBEDebug.DEBUG_MSG("NetworkInterface::onclose:...!");
    }
}