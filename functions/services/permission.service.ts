import Permission from '../models/permission.model';
import CustomError from '../utils/customError';

class PermissionService {
  async createPermission(data: { name: string; description: string }) {
    const permission = new Permission(data);
    return await permission.save();
  }

  async getPermissions() {
    return await Permission.find();
  }

  async getPermissionById(id: string) {
    const permission = await Permission.findById(id);
    if (!permission) {
      throw new CustomError('Permission not found', 404);
    }
    return permission;
  }

  async updatePermission(
    id: string,
    data: { name?: string; description?: string }
  ) {
    const permission = await Permission.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!permission) {
      throw new CustomError('Permission not found', 404);
    }
    return permission;
  }

  async deletePermission(id: string) {
    const permission = await Permission.findByIdAndDelete(id);
    if (!permission) {
      throw new CustomError('Permission not found', 404);
    }
    return { message: 'Permission deleted successfully' };
  }
}

export default new PermissionService();
