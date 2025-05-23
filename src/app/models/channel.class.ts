import { channelData } from "../types/types";
import { Message } from "./message.class";

export class Channel {
    id: string;
    name: string;
    creator: string;
    userIds: string[];
    description: string;
    
  
    constructor(data?: channelData) {
      this.id = data?.id ?? '';
      this.userIds = data?.userIds ?? [];
      this.creator = data?.creator ?? '';
      this.name = data?.name ?? '';
      this.description = data?.description ?? '';
      
    }

    
}