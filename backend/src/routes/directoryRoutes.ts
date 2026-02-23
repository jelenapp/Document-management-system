import { Router } from "express";
import * as dc from "../controllers/directoryController";
import * as validation from "../middlewares/validation/httpRequestValidation";

export const directoryRouter = Router();


directoryRouter.post('/create',
    validation.validateDirectory(),
    dc.createDirectory
);

directoryRouter.delete('/:id/delete',
    validation.validateIdFromPath('id'),
    dc.deleteDirectory
);

directoryRouter.get('/:userId/unstructured',
    validation.validateIdFromPath('userId'),
    dc.getUsersDirectories
);

directoryRouter.get('/:userId/structured',
    validation.validateIdFromPath('userId'),
    dc.getUsersDirectoriesStructured
);

directoryRouter.get('/:id/children&files',
    validation.validateIdFromPath('id'),
    dc.getDirectoryWithChildrenAndFiles
);

directoryRouter.get('/:id/files',
    validation.validateIdFromPath('id'),
    dc.getFilesInDirectory
);

directoryRouter.get('/:userId/root',
    validation.validateIdFromPath('userId'),
    dc.getUserRootDirectories
);

directoryRouter.put('/:id/addChildren',
    validation.validateChildrenAdmission(),
    dc.addChildrenByIds
);

directoryRouter.put('/:id/removeChildren',
    validation.validateChildrenAdmission(),
    dc.removeFromChildrenByIds
);

directoryRouter.put('/:id/addFiles',
    validation.validateFilesAdmission(),
    dc.addFilesByIds
);

directoryRouter.put('/:id/removeFiles',
    validation.validateFilesAdmission(),
    dc.removeFromFilesByIds
);