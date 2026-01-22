import { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


export interface AuthRequest extends Request{
    user?:any
}

export const protect = async (req:AuthRequest,res:Response,next:NextFunction)=>{
    let token;

    token=req.cookies.jwt;

    if(token){
        try{
            const decoded:any=jwt.verify(token,process.env.JWT_SECRET!);

            const user=await prisma.admin.findUnique({
                where:{username:decoded.username}
            });

            if(!user){
                return res.status(401).json({message:"user not found (Invalid Token)"});
            }

            req.user = user;

            next();
        }catch(error){
            console.log(error);
        }
    }else{
        res.status(401).json({message:"Not authorized,no token found"})
    }
}