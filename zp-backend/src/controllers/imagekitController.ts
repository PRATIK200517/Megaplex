// controllers/imagekitController.ts
import { Response, NextFunction } from 'express';
import ImageKit from 'imagekit';
import { AuthRequest } from '../middlewears/authMiddlewears'; // Using the interface we made earlier

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});


export const getUploadAuth = async (req: AuthRequest, res: Response) => {
    try {
        if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: ImageKit keys missing' 
            });
        }

        // Generate authentication parameters
        // This helper method creates the token, expire, and signature automatically
        const authenticationParameters = imagekit.getAuthenticationParameters();

        return res.status(200).json({
            ...authenticationParameters,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate upload authentication' 
        });
    }
};