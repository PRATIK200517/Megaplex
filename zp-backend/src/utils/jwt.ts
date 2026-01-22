import jwt from 'jsonwebtoken'; 

export const generateToken = (username: number | string) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("FATAL: JWT_SECRET is not defined in environment variables.");
    }

    return jwt.sign({ username }, secret, {
        expiresIn: "30d",
    });
};