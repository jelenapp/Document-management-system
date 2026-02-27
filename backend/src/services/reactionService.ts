import {INewReaction, IReaction} from "../data/interfaces/IReaction";
import Reaction from "../data/dao/ReactionSchema";
import Comment from "../data/dao/CommentSchema";
import {IComment} from "../data/interfaces/IComment";
import {ReactionView, toReactionVew} from "../data/types/ReactionView";
import {toUserView, UserView} from "../data/types/UserView";
import {IUser} from "../data/interfaces/IUser";


export async function getReactionById(reactionId: string): Promise<ReactionView | null> {
    const reaction: IReaction | null = await Reaction.findById(reactionId)
                                                        .populate("reactor")
                                                        .exec();

    return reaction != null ? {
        ...reaction,
        reactor: toUserView(reaction.reactor as unknown as IUser)
    } as ReactionView : null
}

export async function getReactionByCommentAndUser(userId: string, commentId: string): Promise<ReactionView | null> {
    const reaction: IReaction | null = await Reaction.findOne({
        reactor: userId,
        comment: commentId
    })
    .populate("reactor")
    .exec();

    return reaction != null ? toReactionVew(reaction) : null
}

export async function createOrUpdateReaction(reaction: INewReaction) {

    const r: IReaction | null = await Reaction.findOne({
        reactor: reaction.reactor,
        comment: reaction.comment
    })
    .populate("reactor")
    .exec();

    return r != null ?
        { updated: true, reaction: await updateReaction(r, reaction.reactionType)} :
        { updated: false, reaction: await createNewReaction(reaction)};
}

export async function createNewReaction(reaction: INewReaction): Promise<ReactionView> {

    const newReaction: IReaction = await Reaction.create(reaction);
    await newReaction.populate('comment');
    if(newReaction.populated('comment')) {
        const comment = newReaction.comment as unknown as IComment;
        comment.reactions.push(newReaction._id);
        await comment.save();
    }

    await newReaction.populate('reactor');

    const view = toReactionVew(newReaction);

    newReaction.depopulate('comment');

    return view;
}

export async function updateReaction(reaction: IReaction, newReactionType: string): Promise<ReactionView | null> {
    reaction.reactionType = newReactionType;
    const r =  await Reaction.findByIdAndUpdate(reaction._id, reaction, {new: true})
        .populate("reactor")
        .exec();

    return r != null ? toReactionVew(r) : null
}

export async function deleteReaction(reactionId: string): Promise<ReactionView | null> {
    const r = await Reaction.findByIdAndDelete(reactionId).exec();

    return r != null ? toReactionVew(r) : null
}