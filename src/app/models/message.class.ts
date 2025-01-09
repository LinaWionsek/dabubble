import { messageData } from "../types/types";
import  { Channel } from "./channel.class";

export class Message {
    id: string;
    senderName: string;
    senderAvatar: string;
    senderId: string;
    receiverId: string;
    timeStamp: string;
    reactions: string[];
    messageText: string;
    channel!: Channel;  

    constructor(data?: messageData) {
        this.id = data?.id ?? '';
        this.senderName = data?.senderName ?? '';
        this.senderAvatar = data?.senderAvatar ?? '';
        this.senderId = data?.senderId ?? '';
        this.receiverId = data?.receiverId ?? '';
        this.messageText = data?.messageText ?? '';
        this.timeStamp = data?.timeStamp ?? new Date().toISOString();
        this.reactions = data?.reactions ?? [];
    }

    
}