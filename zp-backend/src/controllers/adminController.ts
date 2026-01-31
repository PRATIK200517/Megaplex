import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

// --- ZOD SCHEMAS ---

const adminCredentialsSchema = z.object({
    username: z.string().min(5, "Username must be at least 5 characters long"),
    password: z.string().min(8, "Password must be at least 8 characters long")
});

const loginCredentialsSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

const deleteAdminSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

// --- CONTROLLERS ---

export const registerAdmin = async (req: Request, res: Response) => {
    try {
        const validation = adminCredentialsSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const { username, password } = validation.data;

        const userExists = await prisma.admin.findFirst({
            where: {
                username: username
            }
        });

        if (userExists) {
            return res.status(400).json({ message: "User Already exists with this username. Please try with a different username" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await prisma.admin.create(
            {
                data: {
                    username: username,
                    password: hashedPassword
                }
            }
        )

        if (admin) {
            return res.status(201).json({
                _id: admin.adminId,
                name: admin.username,
            });
        } else {
            return res.status(500).json({ message: "Admin creation failed." });
        }
    } catch (e) {
        console.error("Register Admin Error:", e);
        return res.status(500).json({ message: "An unexpected server error occurred during registration." });
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    try {
        const validation = loginCredentialsSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const { username, password } = validation.data;

        const admin = await prisma.admin.findFirst({
            where: {
                username: username
            }
        });

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            // Note: Assuming generateToken is properly imported and defined
            const token = generateToken(admin.username);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                partitioned: true,
                maxAge: 3 * 24 * 60 * 60 * 1000,
                path: "/"
            });

            return res.status(200).json(
                {
                    _id: admin.adminId,
                    username: admin.username,
                }
            );
        } else {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

    } catch (error) {
        console.error("Login Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during login." });
    }
}

export const logoutAdmin = async (req: Request, res: Response) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            partitioned: true,
            expires: new Date(0), 
            path: '/'
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during logout." });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const validation = deleteAdminSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const { username, password } = validation.data;

        const userMatch = await prisma.admin.findUnique({
            where: {
                username: username,
            }
        });

        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passMatch = await bcrypt.compare(password, userMatch.password);
        if (!passMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const deletedAdmin = await prisma.admin.delete({
            where: {
                adminId: userMatch.adminId
            }
        });

        if (deletedAdmin) {
            // Clear the cookie upon successful deletion
            res.cookie('jwt', '', {
                httpOnly: true,
                expires: new Date(0)
            });
            return res.status(200).json({ message: "Admin deleted successfully!" });
        }

    } catch (error) {
        console.error("Delete Admin Error:", error);
        return res.status(500).json({ message: "An unexpected server error occurred during admin deletion." });
    }
}

