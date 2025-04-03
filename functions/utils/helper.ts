import { Types } from 'mongoose';

export function isValidObjectId(id: any): boolean {
  return Types.ObjectId.isValid(id);
}