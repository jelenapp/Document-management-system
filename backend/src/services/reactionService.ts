import {INewReaction, IReaction} from "../data/interfaces/IReaction";
import Reaction from "../data/dao/ReactionSchema";
import Comment from "../data/dao/CommentSchema";
import {IComment} from "../data/interfaces/IComment";


export async function getReactionById(reactionId: string): Promise<IReaction | null> {
    return await Reaction.findById(reactionId).exec();
}

export async function getReactionByCommentAndUser(userId: string, commentId: string): Promise<IReaction | null> {
    return await Reaction.findOne({reactor: userId, comment: commentId}).exec();
}

export async function createOrUpdateReaction(reaction: INewReaction) {

    const r = await getReactionByCommentAndUser(reaction.reactorId, reaction.commentId);

    if (r != null)
        return { updated: true, reaction: await updateReaction(r, reaction.reactionType)};
    else
        return { updated: false, reaction: await createNewReaction(reaction)};
}

export async function createNewReaction(reaction: INewReaction): Promise<IReaction> {

    const newReaction: IReaction = await Reaction.create(reaction);
    await newReaction.populate('comment');
    if(newReaction.populated('comment')) {
        const comment = newReaction.comment as unknown as IComment;
        comment.reactions.push(newReaction._id);
        await comment.save();
    }
    newReaction.depopulate('comment');
    return newReaction;
}

export async function updateReaction(reaction: IReaction, newReactionType: string): Promise<IReaction | null> {
    reaction.reactionType = newReactionType;
    return await Reaction.findByIdAndUpdate(reaction._id, reaction, {new: true}).exec();
}

export async function deleteReaction(reactionId: string): Promise<IReaction | null> {
    return await Reaction.findByIdAndDelete(reactionId).exec();
}