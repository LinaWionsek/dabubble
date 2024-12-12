import { reactionData } from "../types/types";

export class Reaction {
    reactionType: string;
    originatorName: string;

    constructor(data?: reactionData) {
        this.reactionType = data?.reactionType ?? '';
        this.originatorName = data?.originatorName ?? '';
    }

}