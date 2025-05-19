import Role, { RoleDocument } from '../models/role.model';
import CustomError from '../utils/customError';
import {  Types } from 'mongoose';

class RoleService {
    static async createRole(name: string, permissions: string[]): Promise<RoleDocument> {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            throw new CustomError('Role already exists', 400);
        }

        const role = new Role({ name, permissions });
        await role.save();
        return role;
    }

    static async getRoles(): Promise<RoleDocument[]> {
        return Role.find().populate('permissions');
    }

    static async getRoleById(roleId: string): Promise<RoleDocument | null> {
        return Role.findById(roleId).populate('permissions');
    }

    static async getRoleIdsByNames(names: string[]): Promise<string[]> {
        const roles = await Role.find({ name: { $in: names } });
        return roles.map(role => role._id.toString());
    }

    static async updateRole(roleId: string, name: string, permissions: any[]): Promise<RoleDocument | null> {
        // Ensure permissions are valid ObjectId strings
        const permissionsObjectIds = permissions.map((perm) => {
          if (typeof perm === 'object' && perm._id) {
            perm = perm._id;
          }
          if (!Types.ObjectId.isValid(perm)) {
            throw new CustomError(`Invalid permission ID: ${perm}`, 400);
          }
          return new Types.ObjectId(perm);
        });
    
        const role = await Role.findByIdAndUpdate(
          roleId,
          { name, permissions: permissionsObjectIds },
          { new: true, runValidators: true }
        );
        return role;
      }

    static async deleteRole(roleId: string): Promise<void> {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new CustomError('Role not found', 404);
        }

        await role.deleteOne();
    }
}

export default RoleService;