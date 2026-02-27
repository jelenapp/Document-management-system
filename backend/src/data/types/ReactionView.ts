import {PlainResource} from "./PlainResource";
import {IReaction} from "../interfaces/IReaction";
import {toUserView, UserView} from "./UserView";
import {IUser} from "../interfaces/IUser";


export type ReactionView = PlainResource<IReaction, "comment" | "reactor"> & { reactor: UserView }

export function toReactionVew(reaction: IReaction): ReactionView{

    return {
        id: reaction.id,
        reactionType: reaction.reactionType,
        reactor: toUserView(reaction.reactor as unknown as IUser)
    }
}