import {PlainResource} from "./PlainResource";
import {IComment} from "../interfaces/IComment";
import {ReactionView} from "./ReactionView";
import {toUserView, UserView} from "./UserView";
import User from "../dao/UserSchema";
import {IUser} from "../interfaces/IUser";

export type CommentView = PlainResource<IComment, "file" | "commenter" | "reactions"> & { commenter: UserView, reactions: Array<ReactionView>}

/**
 * Sets reactions to an empty array.
 **/
export async function toCommentView(comment: IComment): Promise<CommentView> {

    const user: IUser | null = await User.findById(comment.commenter).select(['id', 'username', 'email']).exec();

    return {
        id: comment.id,
        commenter: user ? toUserView(user) : {id: "", username: "", email: ""},
        content: comment.content,
        edited: comment.edited,
        reactions: []
    }
}