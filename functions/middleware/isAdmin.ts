// filepath: /c:/Users/edogh/OneDrive/Desktop/Ferncot/ferncot/ferncotbackend/src/middleware/isAdmin.ts
import { Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/user.model';
import Role from '../models/role.model';
import CustomError from '../utils/customError';

const isAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user as UserDocument;
        const user = await User.findById(userId._id).populate('roles');
        console.log("user: ", user)
        if (!user) {
            return next(new CustomError('User not found', 404));
        }

        const role = await Role.findById(user.role);
        if (!role || role.name !== 'admin') {
            return next(new CustomError('Forbidden: Admins only', 403));
        }

        next();
    } catch (error) {
        next(new CustomError('Unauthorized', 401));
    }
};

export default isAdmin;