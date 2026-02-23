import {Request, Response, Router} from "express";
import * as oc from "../controllers/organizationController";
import * as validation from "../middlewares/validation/httpRequestValidation";
import {
    validateChildrenAdmission,
    validateIdFromPath, validateMembersIds,
    validateOrganization,
    validateString
} from "../middlewares/validation/httpRequestValidation";

export const organizationRouter = Router();

organizationRouter.get('/name/:name',
    validateString('name'),
    oc.getOrganizationByName
);

organizationRouter.get('/:id',
    validateIdFromPath('id'),
    oc.getOrganizationById
);

organizationRouter.post('/create',
    validateOrganization(),
    oc.createOrganization
);

organizationRouter.put('/:id/addChildren',
    validateIdFromPath('id'),
    validateChildrenAdmission(),
    oc.addChildrenByIds
);

organizationRouter.put('/:id/removeChildren/',
    validateIdFromPath('id'),
    validateChildrenAdmission(),
    oc.removeFromChildrenByIds
);

// organizationRouter.put('/addFilesByIds/',
//     oc.addFilesByIds
// );
//
// organizationRouter.put('/removeFromFilesByIds/',
//     oc.removeFromFilesByIds
// );

organizationRouter.put('/:id/addMembers',
    validateIdFromPath('id'),
    validateMembersIds(),
    oc.addMembersByIds
);

organizationRouter.put('/:id/removeMembers/',
    validateIdFromPath('id'),
    validateMembersIds(),
    oc.removeFromMembersByIds
);

organizationRouter.put('/:id/addProjections/',
    validateIdFromPath("id"),
    validateChildrenAdmission(),
    oc.addProjectionsByIds
);

organizationRouter.put('/:id/removeProjections/',
    validateIdFromPath("id"),
    validateChildrenAdmission(),
    oc.removeFromProjectionsByIds
);

organizationRouter.delete('/:id/delete/userId/:userId',
    validation.validateIdFromPath("id"),
    validation.validateIdFromPath("userId"),
    oc.deleteOrganization
);