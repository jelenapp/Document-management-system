import {IOrganization, INewOrganization} from "../data/interfaces/IOrganization";
import Organization from "../data/dao/OrganizationSchema";
import { Types } from "mongoose";
import { deleteFile } from "./fileService"
import {createDirectory, deleteDirectory} from "./directoryService";
import {IDirectory} from "../data/interfaces/IDirectory";
import Directory from "../data/dao/DirectorySchema";
import {IUser} from "../data/interfaces/IUser";
import {NumberOfDeletions} from "../data/classes/NumberOfDeletions";


export async function getOrganizationByName (orgName: string): Promise<IOrganization | null> {

    return await Organization.findOne({name: orgName}).exec();
}

export async function getOrganizationById(orgId: string): Promise<IOrganization | null> {

    return await Organization.findById(orgId).exec();
}


export async function createOrganization (organization: INewOrganization): Promise<IOrganization | null> {

    return await Organization.create(organization);
}


export async function addChildrenByIds (organizationId: string, childrenIds: Array<string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId);

    if (org != null) {
        childrenIds = [...new Set(
            childrenIds.concat(
                org.children.map(child => child.toHexString())
            )
        )];

        org.children = childrenIds.map(childId =>
            new Types.ObjectId(childId)
        );
        await org.save();
    }
    return org;
}

export async function removeFromChildrenByIds (organizationId: string, childrenIdsToRemove: Array<string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId);

    if (org) {
        const toRemove = new Set(childrenIdsToRemove);
        const childrenIds = org.children
            .map(child => child.toHexString())
            .filter(el => !toRemove.has(el));

        org.children = childrenIds.map(childId =>
            new Types.ObjectId(childId)
        );
        await org.save();
    }
    return org;
}

// export async function addFilesByIds (organizationId: string, filesIds: Array<string>): Promise<IOrganization | null> {

//     const org: IOrganization | null = await Organization.findById(organizationId);

//     if (org) {
//         filesIds = [...new Set(
//             filesIds.concat(
//                 org.files.map(file => file.toHexString())
//             )
//         )];

//         org.files = filesIds.map(fileId =>
//             new Types.ObjectId(fileId)
//         );
//         await org.save();
//     }
//     return org;

// }


export async function addMembersByIds (organizationId: string, membersIdsAndPrivilages: Map<string,string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId);

    if (org != null) {        
        membersIdsAndPrivilages.forEach((value,key) => org.members.set(key,value));
        await org.save()
    }

    return org;
}

export async function removeFromMembersByIds(organizationId: string,membersIdsToRemove: Array<string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId);

    if (org != null) {

        membersIdsToRemove.forEach(memberId => {
            org.members.delete(memberId);
        });

        await org.save();
    }

    return org;
}


export async function addProjectionsByIds (organizationId: string, projectionsIds: Array<string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId).select('projections').populate('projections').exec()

    if (org != null) {

        const projectionsDict = new Map<string, IDirectory>();

        org.projections.forEach(projection => {
            const proj = projection as unknown as IDirectory;
            projectionsDict.set(proj.name, proj);
        });

        const projections: Array<IDirectory> = await Directory.find({ _id: { $in: projectionsIds } })
                                                                .select('owner')
                                                                .populate('owner')
                                                                .exec();
        
        for (const projection of projections) {

            const owner = projection.owner as unknown as IUser;

            if (projectionsDict.has(owner.username)) {

               const dir = projectionsDict.get(owner.username)
               if (dir) {
                   dir.children = [...new Set(dir.children.concat(projection._id as Types.ObjectId))];
                   await dir.save();

                   projection.parents = [...new Set(projection.parents.concat(dir._id as Types.ObjectId))];
               }
            }
            else {

               const newNamespace = await createDirectory({
                   name: owner.username,
                   owner: owner.id,
                   
                   parents: [org.id],
               });

               if (newNamespace != null) {

                   await addChildrenByIds(newNamespace.id, [projection.id]);
                   projection.parents.push(newNamespace._id as Types.ObjectId);
                   org.projections.push(newNamespace._id as Types.ObjectId);
               }
            }

           await projection.save();
        }

        await org.save();
    }
    return org;
}

export async function removeFromProjectionsByIds (organizationId: string, projectionsIdsToRemove: Array<string>): Promise<IOrganization | null> {

    const org: IOrganization | null = await Organization.findById(organizationId)
                                                        .populate('projections')
                                                        .select('projections');

    if (org != null) {

        if (org.projections.length == 0)
            return org;

        const mapOfProjections = new Map<string, IDirectory>();
        for (const projection of org.projections){
                const proj = projection as unknown as IDirectory;
                mapOfProjections.set(proj.name, proj)
            }
      
        const toRemove = new Set(projectionsIdsToRemove);
        const projectionsToRemove: Array<IDirectory> | null = await Directory.find({ _id: { $in: toRemove }})
                                                                            .populate(['owner', 'parents'])
                                                                            .select(['owner', 'parents']);

        if (projectionsToRemove.length == 0)
            return org;

        const mapOfProjectionsToRemove = new Map< string, Array<IDirectory> >();
        for (const projection of projectionsToRemove) {
             const proj = projection as unknown as IDirectory;
                const name = (proj.owner as unknown as IUser).username;
                if (mapOfProjectionsToRemove.has(name))
                    mapOfProjectionsToRemove.get(name)?.push(proj);
                else
                    mapOfProjectionsToRemove.set(name, [proj]);
            }

        for ( const name_projection of mapOfProjections.entries()){
            const childrenToRemove = mapOfProjectionsToRemove.get(name_projection[0]);
            if (childrenToRemove != null) {
                const forRemoval = new Set(...childrenToRemove.map(dir => dir.id));
                name_projection[1].children.map(childObjId => childObjId.toHexString())
                                            .filter(childId => !forRemoval.has(childId));
                if (name_projection[1].children.length == 0)
                    await deleteDirectory(name_projection[1].id);
                else
                    await name_projection[1].save();
            }
        }

        await org.save();
    }
    return org;
    }

export async function deleteOrganization (organizationId: string, applicantId: string) {

    const org = await Organization.findById(organizationId)
                                    .populate(['projections', 'members'])
                        .exec() as IOrganization & { projections: Array<IDirectory>,  members: Array<IUser> } | null;

    const numberOfDeletions = new NumberOfDeletions();

    if (org == null)
        return numberOfDeletions;

    if (org.organizer.toHexString() !== applicantId)
        return new Error('Only organizer can delete the organization.');

    for(const c of org.children) {
        numberOfDeletions.accumulate( await deleteDirectory(c.toHexString()) );
    }

    for (const p of org.projections){
            p.parents = p.parents.filter(el => el.toHexString() !== organizationId);
            // if(p.parents.length == 0) {
            //     numberOfDeletions.accumulate( await deleteDirectory(p.id) );
            // }
    }

    return numberOfDeletions;
}