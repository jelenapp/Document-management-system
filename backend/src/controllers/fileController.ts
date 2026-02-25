import {INewFile} from "../data/interfaces/IFile";
import * as fs from "../services/fileService";
import {checkForValidationErrors} from "../middlewares/validation/checkForValidationErrors";
import {matchedData} from "express-validator";
import {Request, Response, NextFunction} from "express";
import {CommentView} from "../data/types/CommentView";
import * as Y from "yjs";
import {setStateForFileWithId} from "../services/fileService";
import {FileView} from "../data/types/FileView";


export async function createFile(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res)) {
        return;
    }

    try {
        const data: INewFile = matchedData(req);

        const result: FileView | null = await fs.createFile(data);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(400).json({
                success: false,
                message: "Couldn't create a file.",
            });
    }
    catch (err) {
       next(err);
    }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction) {

    if(checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string} = matchedData(req);

        const result: FileView | null = await fs.deleteFile(data.id);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(400).json({
                success: false,
                message: "File not found.",
            });

    } catch (err) {
       next(err);
    }
}

export async function getFile(req: Request, res: Response, next: NextFunction){

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string} = matchedData(req);

        const result: FileView | null = await fs.getFileById(data.id);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "File not found.",
            });
    }
    catch (err) {
       next(err);
    }
}

export async function getCommentsForFile(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string } = matchedData(req);

        const result: Array<CommentView> | null = await fs.getCommentsForFile(data.id);

        if (result != null)
            res.status(200).json({
                success: true,
                data: result,
            });
        else
            res.status(404).json({
                success: false,
                message: "File not found.",
            });
    }
    catch (err){
        next(err)
    }
}

export async function getFileState(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: {id: string} = matchedData(req);

        const result: Buffer | null = await fs.getStateForFileWithId(data.id);

        if (result != null) {

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', result.length);

            res.status(200).send(result);
        }
        else {
            res.status(404).json({
                success: false,
                message: "File not found.",
            });
        }
    }
    catch (err) {
        next(err);
    }
}

export async function updateFileState(req: Request, res: Response, next: NextFunction) {

    if (checkForValidationErrors(req, res))
        return;

    try {
        const data: { id: string } = matchedData(req);

        if (!req.body || !(req.body instanceof Buffer)) {
             res.status(400).json({
                success: false,
                message: 'Invalid file state. No body.'
            });
             return;
        }

        const snapshotBuffer: Buffer = req.body;

        if (snapshotBuffer.length === 0) {
             res.status(400).json({
                success: false,
                message: 'Empty file state.'
            });
            return;
        }

        if (snapshotBuffer.length > 10 * 1024 * 1024) {
            res.status(400).json({
                success: false,
                message: 'File state too large.'
            });
            return;
        }

        // try {
        //     const yDoc = new Y.Doc();
        //     Y.applyUpdate(yDoc, new Uint8Array(snapshotBuffer));
        // } catch (err) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid Y.js update'
        //     });
        // }

        console.log('Valid Y.js snapshot');

        const result = await setStateForFileWithId(data.id, snapshotBuffer);

        if (result)
            res.status(200).json({
                success: true,
                message: 'Snapshot saved'
            });
        else
            res.status(404).json({
                success: false,
                message: "File not found.",
            });

    } catch (err) {
        next(err);
    }
}
