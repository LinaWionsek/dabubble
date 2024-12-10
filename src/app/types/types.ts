import { Message } from "../models/message.class";

export type userData = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    channelIds?: string[];
    chatIds?: string[];
}

export type channelData = {
    id?: string;
    name: string;
    creator: string;
    userIds: string[];
    description?: string;
    messageIds?: string[];
    threadIds?: string[];
}

export type threadData = {
    id?: string;
    userIds: string[];
    messageIds: string[];
}

export type messageData = {
    id?: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    messageText: string;
    timeStamp?: Date;
    reactions?: string[];
}