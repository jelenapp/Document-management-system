import * as validator from 'express-validator';
import { getUserWithUsername, getUserWithEmail } from "../../services/userService";
import Directory from "../../data/dao/DirectorySchema";
import File from "../../data/dao/FileSchema";
import {Meta} from "express-validator";
import {IFile} from "../../data/interfaces/IFile";
import {IDirectory} from "../../data/interfaces/IDirectory";

/**
 * Use in pair with <code>validate{Object}</code> to check if the 'id' is included
 * Field 'id' is needed for the update methods
 * @return
 * Validation chain that checks if the body of request has field 'id'
 */
export function validateIdExistsInBody(idName: string){
    return validator.body(idName).exists();
}

export function validateEmail(){
    return validator.param("email", "Field 'email' is required.")
        .trim()
        .isEmail().withMessage("E-mail format is incorrect.");
}

export function validateString(fieldName: string){
    return validator.param(fieldName, `Field '${fieldName}' is required.`)
        .trim()
        .notEmpty()
        .isString();
}

export function validateToken() {
  return validator.param("verificationToken", "Field 'verificationToken' is missing or invalid.")
    .trim()
    .isLength({ min: 64, max: 64 })
    .isHexadecimal()
    .withMessage("Token must be a 64-character hexadecimal string.");
}

/**
 * @param fieldName
 * Name used for field that holds the ID
 *
 * @return
 * Validation chain for validating ID from Query
 */
export function validateIdFromQuery(fieldName: string) {
    return validator.query(fieldName, `Invalid ${fieldName}!`)
        .trim()
        .notEmpty().bail().withMessage(`Field '${fieldName}' is missing!`)
        .isMongoId();
}

/**@param fieldNames
 * Name used for field/s that holds the ID
 *
 * @return
 * Validation chain for validating ID from Path
 *
 */
export function validateIdFromPath(fieldNames: string | Array<string>) {
    return validator.param(fieldNames, `Invalid ${fieldNames}!`)
        .trim()
        .notEmpty().bail()//.withMessage(`Field '${fieldNames}' is missing!`)
        .isMongoId();
}

/**
 * @param fieldName
 * Name used for field that holds the ID
 *
 * @return
 * Object representation of the Mongo ID validation chain
 */
function mongoIdObject(fieldName: string) {
    return {
        trim: true,
        notEmpty: true,
        errorMessage: `Field '${fieldName}' is required!`,
        isMongoId: { errorMessage: `Invalid value for field '${fieldName}'!` },
    }
}

/**
 * @return
 * Object representation of the optional array of Mongo IDs (trimmed) validation chain
 */
function optionalArrayOfTrimmedMongoIdsObject(){
    return {
        optional: true,
        isArray: true,
        trim: true,
        isMongoId: {errorMessage: "Invalid ID!"}
    }
}

/**
 * @return
 * Validation chain for validating Directory from Body
 */
export function validateDirectory()  {
    return validator.checkSchema(
        {
            owner: mongoIdObject('owner'),
            parents: optionalArrayOfTrimmedMongoIdsObject(),
            name: {
                trim: true,
                notEmpty: { errorMessage: "Field 'name' is required!" },
                uniqueNameInParents: {
                    custom: validateDirectoryNameUniqueness,
                }
            },
            children: optionalArrayOfTrimmedMongoIdsObject(),
            files: optionalArrayOfTrimmedMongoIdsObject(),
            collaborators: optionalArrayOfTrimmedMongoIdsObject()
        },
        ['body']
    );
}

/**
 * @return
 * Validation chain for validating User from Body
 */
export function validateUser()  {
    return validator.checkSchema(
        {
            username: {
                trim: true,
                notEmpty: { errorMessage: "Field 'username' is required!" },
                unique:{
                    custom: validateUsernameUniqueness,
                    errorMessage: "Specified username is already taken."
                }
            },
            email: {
                trim: true,
                isEmail: { errorMessage: "Invalid E-mail address!" },
                unique: {
                    custom: validateEmailUniqueness,
                    errorMessage: "Specified e-mail is already taken."
                }
            },
            password: {
                trim: true,
                notEmpty: { errorMessage: "Password is required!" },
                isLength: {
                    options: { min: 8 },
                    errorMessage: "Password must be at least 8 characters long",
                }
            }
        },
        ['body']
    );
}

/**
 * @return
 * Validation chain for validating Comment from Body
 */
export function validateComment()  {
    return validator.checkSchema(
        {
            commentId:{
                optional: true,
                ...mongoIdObject('commentId')
            },
            commenter: mongoIdObject('commenter'),
            file: mongoIdObject('file'),
            content: {
                trim: true,
                notEmpty: true,
                errorMessage: `Field 'content' is required!`,
            },
        },
        ['body']
    );
}

/**
 * @return
 * Validation chain for validating Comment update from Body
 */
export function validateCommentUpdate()  {
    return validator.checkSchema(
        {
            id: mongoIdObject('id'),
            content: {
                trim: true,
                notEmpty: true,
                errorMessage: `Field 'content' is required!`,
            },
        },
    );
}

/**
 * @return
 * Validation chain for validating Reaction from Body
 */
export function validateReaction()  {
    return validator.checkSchema(
        {
            comment: mongoIdObject('comment'),
            reactor: mongoIdObject('reactor'),
            reactionType: {
                trim: true,
                notEmpty: true,
                errorMessage: `Field 'reactionType' is required!`,
            },
        },
        ['body']
    );
}

/**
 *@return
 * Validation chain for validating children to be added to the directory
 */
export function validateChildrenAdmission(){
    return validator.checkSchema(
        {
            children: optionalArrayOfTrimmedMongoIdsObject()
        },
        ["body"]
    )
}

/**
 *@return
 * Validation chain for validating files to be added to the directory
 */
export function validateFilesAdmission(){
    return validator.checkSchema(
        {
            files: optionalArrayOfTrimmedMongoIdsObject()
        },
        ["body"]
    )
}

/**
 *@return
 * Validation chain for validating members to be added to the organization
 */
export function validateMembersIds(){
    return validator.checkSchema(
        {
            members: optionalArrayOfTrimmedMongoIdsObject()
        },
        ["body"]
    )
}

/**
 * @return
 * Validation chain for validating Organization from Body
 */
export function validateOrganization()  {
    return validator.checkSchema(
        {
            name: {
                trim: true,
                notEmpty: true,
                isString: true,
                errorMessage: "Field 'name' is required!"
            },
            organizer: mongoIdObject('organizer'),
            // children: optionalArrayOfTrimmedMongoIdsObject(),
            // members: optionalArrayOfTrimmedMongoIdsObject(),
            // projections: optionalArrayOfTrimmedMongoIdsObject()
        },
        ['body']
    );
}

export function validateFile(){
    return validator.checkSchema(
        {
            owner: mongoIdObject('owner'),
            parent: mongoIdObject('parent'),
            name: {
                trim: true,
                notEmpty: { errorMessage: "Field 'name' is required!" },
                uniqueness: {
                    custom: validateFileNameUniqueness
                }
            },
            //collaborators: optionalArrayOfTrimmedMongoIdsObject(),
        },
        ['body']
    );
}


///////////////////////////////////////////
//////////// Custom validators ////////////
///////////////////////////////////////////
async function validateUsernameUniqueness(username: string){
    const user = await getUserWithUsername(username);
    if (user)
        throw new Error("Username is already taken!");
}

async function validateEmailUniqueness(email: string){
    const user = await getUserWithEmail(email);
    if (user)
        throw new Error("E-mail is already taken!");
}

async function validateDirectoryNameUniqueness(value: string, meta: Meta){
        const p: Array<string> = meta.req.body.parents;

        if(p.length == 0)
            return true;

        const dirs: Array<IDirectory> | null = await Directory.find(
            {
                name: value,
                parents: { $in: p }
            }
        ).select('parents');

        console.log(dirs);

        if (dirs.length > 0) {

            const s = dirs.flatMap(x => x.parents)
                .filter(x => p.includes(x.toString()));

            const problematic = (await Directory.find(
                {
                    _id: { $in: s }
                }
            ).select('name')).map(x => x.name);

            throw new Error(`Directory with that name already exists! Parents: ${problematic}`);

        }

        return true;
}

async function validateFileNameUniqueness(value: string, meta: Meta){
    const p: string = meta.req.body.parent;

    const file: IFile | null = await File.findOne(
        {
            name: value,
            parent: p
        }
    );

    if (file) {
        throw new Error(`File with that name already exists!`);
    }

    return true;
}