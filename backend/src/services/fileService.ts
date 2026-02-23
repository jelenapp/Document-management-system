import File from "../data/dao/FileSchema"
import Directory from "../data/dao/DirectorySchema";
import {IFile, IFilePopulated, INewFile} from "../data/interfaces/IFile";
import {IDirectory} from "../data/interfaces/IDirectory";
import {IComment} from "../data/interfaces/IComment";


export async function createFile (file: INewFile): Promise<IFile | null> {

    const dir: IDirectory | null = await Directory.findById(file.parent).exec();

    if (dir != null) {
        let newFile: IFile | null = await File.create(file);
        if (newFile != null) {
            dir.files.push(newFile._id);
            await dir.save();
        }
        return newFile;
    }
    return null;
}

export async function deleteFile(fileId: string): Promise<IFile | null> {

    const file: IFile | null = await File.findById(fileId).exec();
    if (file == null)
        return null;

    const parentDir: IDirectory | null = await Directory.findById(file.parent).exec();
    if (parentDir != null) {
        parentDir.files = parentDir.files.filter(fId => !fId.equals(file.id));
        await parentDir.save();
    }

    return await File.findByIdAndDelete(file.id).exec();
}

export async function getFileById(fileId: string): Promise<IFile | null> {
    return await File.findById(fileId)
        .populate(["owner", "comments"])
        .exec();
}

export async function getCommentsForFile(fileId: string): Promise<Array<IComment> | null> {

    const file = await File.findById(fileId).populate("comments").exec() as IFilePopulated | null;
    if (file != null)
        return file.comments;
    else
        return null;
}

export async function getStateForFileWithId(fileId: string): Promise<Buffer | null> {

    const file = await File.findById(fileId).exec() as IFile | null;

    if(file != null)
        return file.yDocState
    else
        return null;
}

export async function setStateForFileWithId(fileId: string, documentState: Buffer): Promise<boolean> {

    const file = await File.findById(fileId).exec() as IFile | null;
    if(file != null) {
        file.yDocState = documentState;
        await file.save();
        return true;
    }
    else
        return false;
}