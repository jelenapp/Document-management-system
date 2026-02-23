import {Request, Response, Router} from "express";
import * as uc from "../controllers/userController";
import * as validation from "../middlewares/validation/httpRequestValidation";

export const userRouter = Router();

userRouter.all('/',
    (req: Request, res: Response) => {

    const routes: Array<string> = userRouter.stack.map(({route}) =>
        `[${[...new Set(route?.stack?.map(entry => entry.method))]}] ${route?.path}`
    );
    res.json(routes).end();
});

userRouter.post('/create',
    validation.validateUser(),
    uc.createUser
);

userRouter.delete('/:id/delete',
    validation.validateIdFromPath('id'),
    uc.deleteUserWithId
);

userRouter.get('/', uc.getUsers);

userRouter.get('/:id',
    validation.validateIdFromPath('id'),
    uc.getUserById
);

userRouter.get('/email/:email',
    validation.validateEmail(),
    uc.getUserByEmail
);

userRouter.get('/verificationToken/:verificationToken',
    validation.validateToken(),
    uc.getUserByVerificationToken
);

userRouter.get('/verify/:verificationToken',
    validation.validateToken(),
    uc.verifyUser
);

