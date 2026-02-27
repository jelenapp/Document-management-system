import Comment from "../data/dao/CommentSchema";
import File from "../data/dao/FileSchema";
import User from "../data/dao/UserSchema";
import {IFile} from "../data/interfaces/IFile";
import {IComment, INewComment} from "../data/interfaces/IComment";
import {IUser} from "../data/interfaces/IUser";
import {IReaction} from "../data/interfaces/IReaction";
import {CommentView, toCommentView} from "../data/types/CommentView";
import {ReactionView} from "../data/types/ReactionView";
import {toUserView} from "../data/types/UserView";


export async function getCommentById(commentId: string): Promise<CommentView | null> {
    const comment: IComment | null = await Comment.findById(commentId).exec();
    if (comment != null){

        const view = await toCommentView(comment);
        view.reactions = await getAllReactionsForComment(commentId);

        return view;
    }
    return null;
}

export async function createComment(comment: INewComment): Promise<CommentView | Error> {

    const commenter: IUser | null = await User.findById(comment.commenter).exec();
    if(commenter == null)
        return Error("User not found!");

    const file: IFile | null = await File.findById(comment.file).exec();
    if(file == null)
        return Error("File not found!");

    const newComment: IComment = await Comment.create(comment);

    file.comments.push(newComment._id);
    await file.save();

   return  await toCommentView(newComment);
}

export async function updateComment(commentId: string, content: string): Promise<CommentView | null> {
    const comment = await Comment.findByIdAndUpdate(commentId, {content: content, edited: true}, { new: true }).exec();

    if (comment == null)
        return null;

    const view = await toCommentView(comment);
    view.reactions =  await getAllReactionsForComment(commentId);

    return view;
}

export async function deleteComment(commentId: string): Promise<string | null> {
    const comment = await Comment.findByIdAndDelete(commentId).exec();

    return comment?.id;
}

export async function getAllReactionsForComment(commentId: string): Promise<Array<ReactionView>> {

    const comment = await Comment.findById(commentId)
                                .populate('reactions')
                                .select('reactions')
                                .lean()
                                .exec() as IComment | null;

    if (comment == null)
        return [];

    const reactions = comment.reactions as unknown as Array<IReaction>;

    if (reactions == null || reactions.length == 0)
        return [];

    const views: ReactionView[] = [];

    for (const reaction of reactions) {
        const reactor: IUser | null = await User.findById(reaction.reactor);
        if (reactor != null)
            views.push( {
                id: reaction.id,
                reactionType: reaction.reactionType,
                reactor: toUserView(reactor)
            } as ReactionView
        );
    }
    return views;
}
