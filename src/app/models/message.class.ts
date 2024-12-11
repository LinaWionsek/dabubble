import { messageData } from "../types/types";

export class Message {
    id: string;
    senderName: string;
    senderAvatar: string;
    senderId: string;
    receiverId: string;
    timeStamp: string;
    reactions: string[];
    messageText: string;

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