import {Request, Response, NextFunction} from "express";
import {checkForValidationErrors} from "../middlewares/validation/checkForValidationErrors";
import {matchedData} from "express-validator";
import * as rs from "../services/reactionService";
import {INewReaction} from "../data/interfaces/IReaction";
import {ReactionView} from "../data/types/ReactionView";


export async function createOrUpdateReaction(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data = matchedData(req) as INewReaction;

        const result: {updated: boolean, reaction: ReactionView | null} = await rs.createOrUpdateReaction(data);

        if (result.updated && result.reaction != null)
            res.status(200).json({
                success: true,
                message: "Reaction updated successfully.",
                data: result,
            });
        else if (!result.updated && result.reaction != null)
            res.status(201).json({
                success: true,
                message: "Reaction created successfully.",
                data: result,
            });
        else
            res.status(400).json({
                success: false,
                message: "Couldn't create or update reaction.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function getReactionById(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string } = matchedData(req);

        const result: ReactionView | null  = await rs.getReactionById(data.id);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Reaction not found.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function getReactionByCommentAndUser(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { userId: string, commentId: string } = matchedData(req);

        const result: ReactionView | null = await rs.getReactionByCommentAndUser(data.userId, data.commentId);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Reaction not found.",
            });
    }
    catch (err) {
        next(err);
    }
}

export async function deleteReaction(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string } = matchedData(req);

        const result: ReactionView | null = await rs.deleteReaction(data.id);

        if (result != null)
            res.status(200).json({
                success: true,
                message: "Reaction deleted successfully.",
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "Reaction not found.",
            });
    }
    catch (err) {
        next(err);
    }
}