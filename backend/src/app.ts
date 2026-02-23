import express from 'express';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { userRouter } from './routes/userRoutes';
import { PORT } from './config/config';
import { connectDB } from './config/db';
import {directoryRouter} from './routes/directoryRoutes';
import {fileRouter} from './routes/fileRoutes';
import {commentRouter} from './routes/commentRoutes';
import {reactionRouter} from './routes/reactionRoutes';
import {organizationRouter} from './routes/organizationRoutes';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';


const app = express();

app.use(cors({
  origin: '*', // "*" za sve domene
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(logger);

// if (process.env.NODE_ENV == 'development') {
    const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }
app.use('/users', userRouter);
app.use('/directories', directoryRouter);
app.use('/files', fileRouter);
app.use('/comments', commentRouter);
app.use('/reactions', reactionRouter);
app.use('/organizations', organizationRouter);

app.get('/',
    (req: express.Request, res: express.Response) => {
        res.send('Collaborative Editor Backend is running...');
    }
);

app.use(errorHandler);

(async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();


