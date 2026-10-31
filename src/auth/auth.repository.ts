import { UserCreateInput } from "../../generated/prisma/models.js";
import { UpdateUserDto } from "./dto/update.user.dto.js";
import {prisma} from "../lib/prisma.js";


export class AuthRepository {
    
    finduserById (id:string){
        return prisma.user.findUnique({
            where:{id}
        });
    };
    

    findUserByEmail (email:string){
        return prisma.user.findUnique({
            where: {email}
        });
    };

    createUser (data: UserCreateInput){
        return prisma.user.create({
            data
        });
    };

    updateUser (id:string,data:UpdateUserDto){
        return prisma.user.update({
            where:{id},
            data
        });
    };

    deleteUserById (id:string){
        return prisma.user.delete({
            where : {id}
        });
    };
}

