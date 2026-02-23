import Comment from "../data/dao/CommentSchema";
import File from "../data/dao/FileSchema";
import User from "../data/dao/UserSchema";
import {IFile} from "../data/interfaces/IFile";
import {IComment, INewComment} from "../data/interfaces/IComment";
import {IUser} from "../data/interfaces/IUser";
import {IReaction} from "../data/interfaces/IReaction";

export async function getCommentById(commentId: string): Promise<IComment | null> {
    return await Comment.findById(commentId).exec();
}

export async function createComment(comment: INewComment) {

    const commenter: IUser | null = await User.findById(comment.commenterId).exec();
    if(commenter == null)
        return Error("User not found!");

    const file: IFile | null = await File.findById(comment.fileId).exec();
    if(file == null)
        return Error("File not found!");

    const newComment: IComment = await Comment.create(comment);

    file.comments.push(newComment._id);
    await file.save();

    return newComment;
}

export async function updateComment(commentId: string, content: string): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(commentId, {content: content, edited: true}, { new: true }).exec();
}

export async function deleteComment(commentId: string): Promise<IComment | null> {
    return await Comment.findByIdAndDelete(commentId).exec();
}

export async function getAllReactionsForComment(commentId: string): Promise<Array<IReaction> | null> {

    return await Comment.findById(commentId)
                                .select('reactions')
                                .populate('reactions')
                                .lean()
                                .exec() as Array<IReaction> | null;
}
