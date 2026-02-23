import * as rc from "../controllers/reactionController";
import {Router} from "express";
import {validateIdFromPath, validateReaction} from "../middlewares/validation/httpRequestValidation";

export const reactionRouter = Router();

reactionRouter.put('/createOrUpdate',
    validateReaction(),
    rc.createOrUpdateReaction
);

reactionRouter.get('/:id',
    validateIdFromPath('id'),
    rc.getReactionById
);

reactionRouter.get('/comment/:commentId/user/:userId',
    validateIdFromPath(['commentId', 'userId']),
    rc.getReactionByCommentAndUser
);

reactionRouter.delete('/:id/delete',
    validateIdFromPath('id'),
    rc.deleteReaction
);

