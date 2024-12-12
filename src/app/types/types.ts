
export type userData = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    
}

export type channelData = {
    id?: string;
    name: string;
    creator: string;
    userIds: string[];
    description?: string;
    
}

export type threadData = {
    id?: string;
    userIds: string[];
    messageIds: string[];
}

export type reactionData = {
    reactionType: string;
    originatorName: string;
}


export type messageData = {
    id?: string;
    senderName: string;
    senderAvatar: string;
    senderId: string;
    receiverId: string;
    messageText: string;
    timeStamp?: string;
    reactions?: string[];
}