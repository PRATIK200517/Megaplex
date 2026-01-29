import express,{Router,Request,Response} from 'express';
import { deleteAdmin, loginAdmin, logoutAdmin, registerAdmin } from '../controllers/adminController';
import { protect } from '../middlewears/authMiddlewears';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';


export interface AuthRequest extends Request{
    user?:any
}
const adminRouter=Router();

adminRouter.get("/",()=>{
    console.log("hello from admin");
})

//Admin auth
adminRouter.post("/login",loginAdmin);

adminRouter.post("/register",registerAdmin);

adminRouter.post("/logout",logoutAdmin);

adminRouter.post("/delete",protect,deleteAdmin);

adminRouter.post("/isAuthorized",async (req: AuthRequest, res: Response) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token found" });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const user = await prisma.admin.findUnique({
            where: { username: decoded.username }
        });


        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        return res.status(200).json({ 
            authenticated: true, 
            user: { username: user.username } 
        });

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
})

export default adminRouter;