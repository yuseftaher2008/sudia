import bcrypt from 'bcrypt';
import { UserCreateInput } from "../../generated/prisma/models.js";
import { AuthRepository } from "./auth.repository.js";


export class AuthService {
    
    constructor (private authRepository : AuthRepository){}
    
    async createUser (data:UserCreateInput){
        
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser){
            throw new Error("Registration failed");
        }
        const hashedPassword = await bcrypt.hash(data.passwordHash,Number(process.env.BCRYPT_SALT_ROUNDS));
        const newUser = await this.authRepository.createUser({

            fullName:data.fullName,
            email:data.email,
            passwordHash:hashedPassword

        });

        const {passwordHash:_password, ...safeUser} = newUser;
        
        
        
    }
    
}