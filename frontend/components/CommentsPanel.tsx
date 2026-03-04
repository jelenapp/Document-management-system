"use client";

import {useCallback, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {getRequestSingle, postRequest, putRequest, deleteRequest} from "@/app/api/serverRequests/methods";

type User = { id: string; username: string; email?: string };

type ReactionType =
    | "thumbs_up"
    | "heart"
    | "smile"
    | "sad"
    | "angry"
    | "wow"
    | "relaxed";

type Reaction = {
    _id: string;
    reactionType: ReactionType;
    reactor: User,
};

type CommentDto = {
    id: string;
    content: string;
    commenter: User;
    createdAt?: string;
    edited?: boolean;
    reactions?: Reaction[];
};

export default function CommentsPanel({fileId}: { fileId: string }) {

    const {data} = useSession();
    const myUserId = data == null ? "" : (data.user as unknown as User)?.id ?? (data?.user as unknown as {_id: string})?._id;

    const [comments, setComments] = useState<CommentDto[]>([]);
    const [newText, setNewText] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await getRequestSingle(`files/${fileId}/comments`);
            if (!res.ok) return;

            const payload = await res.json();
            const data = payload?.data ?? payload;
            setComments(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [fileId]);

    // const getUsername = (c: CommentDto) => {
    //   if (typeof c.commenter === "object" && c.commenter) return c.commenter;
    //   // fallback ako backend ne populuje username:
    //   if (myUserId && c.commenter === myUserId) return (session?.user as any)?.username ?? "me";
    //   return "unknown";
    // };

    const addComment = async () => {
        if (!newText.trim() || !myUserId) return;

        const res = await postRequest("comments/create", {
            content: newText.trim(),
            file: fileId,        //backend očekuje "file"
            commenter: myUserId,
        });

        const errPayload = await res.json().catch(() => null);
        console.log("create comment status:", res.status);
        console.log("create comment response:", errPayload);
        if (!res.ok) return;

        if (res.ok) {
            setNewText("");
            await fetchComments();
        }
    };

    const updateComment = async (commentId: string, content: string) => {
        const res = await putRequest(`comments/${commentId}/update`, {content});
        if (res.ok) await fetchComments();
    };

    const removeComment = async (commentId: string) => {
        const res = await deleteRequest(`comments/${commentId}/delete`);
        if (res.ok) await fetchComments();
    };

    const addReaction = async (commentId: string, emoji: string, alreadyReacted: boolean) => {

        if (!myUserId) return;

        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        let res: Response;

        try {
            if (alreadyReacted) {
                res = await getRequestSingle(`reactions/comment/${commentId}/user/${myUserId}`);

                console.log(res);
                if (!res.ok) return;
                const payload = await res.json();
                console.log("payload");
                console.log(payload);
                const data = payload?.data ?? payload;
                console.log("data");
                console.log(data);

                res = await deleteRequest(`reactions/${data.id}/delete`)
            } else {
                res = await putRequest(`reactions/createOrUpdate`, {
                    comment: commentId,
                    reactionType: emoji,
                    reactor: myUserId,
                });
            }
            if (res.ok) await fetchComments();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="w-full h-full flex flex-col p-4 bg-slate-900/50 text-white overflow-hidden">
            <div className="flex gap-2 mb-6">
                <input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Napiši komentar..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                />
                <button
                    onClick={addComment}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium transition-colors shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    Dodaj
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3">
                        <div
                            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-sm text-slate-400">Učitavam komentare...</div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500 italic">Još uvek nema komentara.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comments.map((c) => {
                            return (
                                <CommentItem
                                    key={c.id}
                                    myUserId={myUserId}
                                    comment={c}
                                    user={c.commenter}
                                    onUpdate={updateComment}
                                    onDelete={removeComment}
                                    onReact={(emoji, alreadyReacted) => addReaction(c.id, emoji, alreadyReacted)}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function CommentItem({
                         myUserId,
                         comment,
                         user,
                         onUpdate,
                         onDelete,
                         onReact,
                     }: {
    myUserId: string,
    comment: CommentDto;
    user: User;
    onUpdate: (id: string, content: string) => void;
    onDelete: (id: string) => void;
    onReact: (emoji: string, alreadyReacted: boolean) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(comment.content);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

    useEffect(() => setText(comment.content), [comment.content]);

    const emojis = new Map<string, string>([
        ["thumbs_up", '👍'],
        ["heart", '💗'],
        ["smile", '😊'],
        ["sad", '😢'],
        ["angry", '😠'],
        ["scared", '😱'],
        ["wow", '😲'],
        ["relaxed", '😌']
    ]);

    let myReaction: string = '';
    let firstEmoji: string = '';

    for (const reaction of comment.reactions || []) {

        if (reaction.reactor.id == myUserId) {
            myReaction = reaction.reactionType;
            break;
        }

        if (firstEmoji == '') {
            firstEmoji = reaction.reactionType;
        }
    }


    return (
        <div
            className="group rounded-2xl border border-slate-800 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition-all">
            <div className="text-sm text-slate-400 mb-2.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold border border-blue-500/20">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-300">@{user.username}</span>
                    {comment.edited && <span
                        className="text-[10px] opacity-50 px-1.5 py-0.5 rounded-full bg-slate-700">(izmenjeno)</span>}
                </div>

                {(user.id == myUserId || (user as unknown as {_id: string})._id == myUserId) && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-yellow-500/70 hover:text-yellow-400 transition-colors"
                            onClick={() => setEditing((p) => !p)}
                            title="Izmeni"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                        </button>
                        <button
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-red-500/70 hover:text-red-400 transition-colors"
                            onClick={() => onDelete(comment.id)}
                            title="Obriši"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {editing ? (
                <div className="flex flex-col gap-2">
          <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[80px] resize-none"
          />
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium transition-colors"
                            onClick={() => setEditing(false)}
                        >
                            Otkaži
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-medium transition-colors"
                            onClick={() => {
                                onUpdate(comment.id, text);
                                setEditing(false);
                            }}
                        >
                            Sačuvaj
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-slate-200 leading-relaxed text-sm">{comment.content}</div>
            )}

            {/* Reactions Section */}
            <div className="mt-4 flex flex-wrap gap-2 items-center relative">
                {/* Reactions*/}
                {/*{Object.entries(groupedReactions).map(([emoji, users]) => (*/}
                {(comment.reactions || []).length > 0 && (<div
                        key={myReaction}
                        className="relative"
                        // onMouseEnter={() => setHoveredReaction(myReaction)}
                        // onMouseLeave={() => setHoveredReaction(null)}
                    >
                        <button
                            onClick={() => {
                                console.log("clicked reaction");
                                console.log(myReaction);
                                if (myReaction != "") onReact(myReaction, true)
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-colors${
                                myReaction != "" ? 
                                "bg-blue-600/30 border-blue-500 text-white"
                                : "bg-slate-900/50 border-slate-700 hover:border-slate-500"
                            }`}
                        >
                            <span
                                className="text-lg leading-none">{emojis.get(myReaction) || emojis.get(firstEmoji) || emojis.get('thumbs_up')}</span>
                            <span className="text-slate-400 font-bold">{comment.reactions?.length}</span>
                        </button>

                        {/*Hover details for reaction*/}
                        {/*{hoveredReaction == emoji && (*/}
                        {/*    <div*/}
                        {/*        className="absolute bottom-full mb-2 left-0 w-64 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">*/}
                        {/*        <div*/}
                        {/*            className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider px-1">Reagovali su:*/}
                        {/*        </div>*/}
                        {/*        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">*/}
                        {/*            {users.map((u) => (*/}
                        {/*                <div key={u}*/}
                        {/*                     className="flex items-center gap-2.5 p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">*/}
                        {/*                    <div className="text-lg shrink-0">{emojis/*s.get(emoji)*!/</div>*/}
                        {/*                    <div className="flex flex-col min-w-0">*/}
                        {/*                        <div className="text-sm font-semibold text-slate-100 truncate">{u}</div>*/}
                        {/*                        <div className="text-[10px] text-slate-500 truncate">{u}</div>*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                )}


                {/* Add Reaction Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 transition-colors"
                        title="Dodaj reakciju"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </button>

                    {showEmojiPicker && (
                        <div
                            className="absolute bottom-full mb-2 left-0 z-50 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2">
                            {emojis.keys().map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => {
                                        onReact(emoji, false);
                                        setShowEmojiPicker(false);
                                    }}
                                    className="text-xl p-2 hover:bg-slate-700 rounded-xl transition-all hover:scale-125"
                                >
                                    {emojis.get(emoji)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
        ;
}