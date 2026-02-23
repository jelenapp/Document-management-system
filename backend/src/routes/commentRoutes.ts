import { Router } from "express";
import * as cc from "../controllers/commentController";
import {
    validateComment,
    validateCommentUpdate,
    validateIdFromPath
} from "../middlewares/validation/httpRequestValidation";


export const commentRouter = Router();

commentRouter.post('/create',
    validateComment(),
    cc.createComment
);

commentRouter.get('/:id',
    validateIdFromPath('id'),
    cc.getCommentById
);

commentRouter.get('/:id/reactions',
    validateIdFromPath('id'),
    cc.getAllReactionsForComment
);

commentRouter.put('/:id/update',
    validateCommentUpdate(),
    cc.updateComment
);

commentRouter.delete('/:id/delete',
    validateIdFromPath('id'),
    cc.deleteComment
);