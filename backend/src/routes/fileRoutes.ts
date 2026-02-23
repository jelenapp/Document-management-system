import {Router, raw} from "express";
import * as fc from "../controllers/fileController";
import {validateFile, validateIdFromPath} from "../middlewares/validation/httpRequestValidation";

export const fileRouter = Router();


fileRouter.post('/create',
    validateFile(),
    fc.createFile
);

fileRouter.get('/:id',
    validateIdFromPath('id'),
    fc.getFile
);

fileRouter.delete('/:id/delete',
    validateIdFromPath('id'),
    fc.deleteFile
);

fileRouter.get('/:id/state',
    validateIdFromPath('id'),
    fc.getFileState
);

fileRouter.post('/:id/state',
    raw({
        type: 'application/octet-stream',
        limit: '10mb'
    }),
    validateIdFromPath('id'),
    fc.updateFileState
);

fileRouter.get('/:id/comments',
    validateIdFromPath("id"),
    fc.getCommentsForFile
);
