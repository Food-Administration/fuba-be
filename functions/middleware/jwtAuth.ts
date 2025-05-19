import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import CustomError from '../utils/customError';
import { UserDocument } from '../models/user.model';

const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new CustomError('Unauthorized', 401)); 
    }

    const token = authHeader.split(' ')[1];
    try { 
        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET_KEY!);
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new CustomError('User not found', 404));
        }
        
        // Type assertion here
        (req as unknown as { user: UserDocument }).user = user;
        next();
    } catch (error) {
        next(new CustomError('Unauthorized', 401));
    }
};

export default jwtAuth;