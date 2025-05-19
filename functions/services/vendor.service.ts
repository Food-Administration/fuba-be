import EmailService from './email.service';
import User, { UserDocument } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { Role } from '../models/index';
import crypto from 'crypto';
import { VendorDto } from '../models/Dtos/entities.dto';
import CustomError from '../utils/customError';
import VendorTypeService from './vendorType.service';
import { isValidObjectId } from '../utils/helper';

class VendorService {
  async createVendor(vendorData: VendorDto): Promise<UserDocument> {
    const { ...rest } = vendorData;
  
    const existingVendor = await User.findOne({ email: vendorData.email });
    if (existingVendor) {
      throw new CustomError('User with this email already exists', 409);
    }
  
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const vendorRole = await Role.findOne({ name: 'vendor' });
    if (!vendorRole) {
      throw new CustomError('Vendor role not found', 404);
    }
  
    if (!vendorData.vendorBusinessDetails?.vendorType) {
      throw new CustomError('Vendor type is required', 400);
    }
  
    let vendorTypeId = vendorData.vendorBusinessDetails.vendorType;
  
    if (typeof vendorTypeId === 'string' && !isValidObjectId(vendorTypeId)) {
      const vendorType = await VendorTypeService.getVendorTypeByName(vendorTypeId);
      if (!vendorType) {
        throw new CustomError(`Vendor type "${vendorTypeId}" not found`, 404);
      }
      vendorTypeId = vendorType._id;
    }
  
    const vendor = new User({
      ...rest,
      password: hashedPassword,
      roles: [vendorRole._id],
      vendorBusinessDetails: {
        ...rest.vendorBusinessDetails,
        vendorType: vendorTypeId,
      },
    });
  
    await vendor.save();
  
    await EmailService.sendUserPasswordEmail(
      vendor.email,
      vendor.vendorCompanyInfo.vendorLegalName,
      vendor.email,
      password
    );
  
    return vendor;
  }

  async getVendorById(id: string): Promise<UserDocument | null> {
    return await User.findById(id).populate('roles');
  }

  async getVendors(): Promise<UserDocument[]> {
    const vendorRole = await Role.findOne({ name: 'vendor' });
    if (!vendorRole) {
      throw new CustomError('Vendor role not found', 404);
    }
    return await User.find({ roles: { $in: [vendorRole._id] } })
      .populate('roles')
      .populate('vendorCompanyInfo')
      .populate('contactInfo')
      .populate('businessAddress')
      .populate('bankingInfo')
      .populate('vendorBusinessDetails.vendorType');
  }

  async findVendorByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email, roles: { $in: ['vendor'] } });
  }

  async updateVendor(id: string, updateData: Partial<VendorDto>): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteVendor(id: string): Promise<UserDocument | null> {
    return await User.findByIdAndDelete(id);
  }

  async blockVendor(id: string, isBlocked: boolean): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
  }

  async assignRole(vendorId: string, roleName: string): Promise<UserDocument> {
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      throw new CustomError('Vendor not found', 404);
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new CustomError('Vendor role not found', 404);
    }

    vendor.roles.push(role._id);
    await vendor.save();

    return vendor;
  }

  async importVendors(vendors: any[]): Promise<{
    successCount: number;
    duplicateEmails: string[];
    errors: Array<{ email: string; error: string }>;
  }> {
    const results = {
      successCount: 0,
      duplicateEmails: [] as string[],
      errors: [] as Array<{ email: string; error: string }>,
    };

    const vendorRole = await Role.findOne({ name: 'vendor' });
    if (!vendorRole) {
      throw new CustomError('Vendor role not found', 404);
    }

    for (const vendorData of vendors) {
      try {
        const existingVendor = await User.findOne({ email: vendorData.email });
        if (existingVendor) {
          results.duplicateEmails.push(vendorData.email);
          continue;
        }

        if (!vendorData.password) {
          console.warn(`Password is required for vendor with email: ${vendorData.email}`, 400);
          vendorData.password = crypto.randomBytes(8).toString('hex');
        }

        console.log(`Hashing password for vendor: ${vendorData.email}`);

        const hashedPassword = await bcrypt.hash(vendorData.password, 10);

        const newVendor = new User({
          ...vendorData,
          password: hashedPassword,
          roles: [vendorRole._id],
        });

        await newVendor.save();

        await EmailService.sendUserPasswordEmail(
          newVendor.email,
          newVendor.vendorCompanyInfo?.vendorLegalName || 'Vendor',
          newVendor.email,
          vendorData.password
        );

        results.successCount++;
      } catch (error) {
        results.errors.push({
          email: vendorData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

export default new VendorService();