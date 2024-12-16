import { reactionData } from "../types/types";

export class Reaction {
    reactionType: string;
    originatorName: string;
    originatorId: string;

    constructor(data?: reactionData) {
        this.reactionType = data?.reactionType ?? '';
        this.originatorName = data?.originatorName ?? '';
        this.originatorId = data?.originatorId ?? '';
    }

}