import mongoose, { Schema, type Model } from 'mongoose';
import type { UserProfile } from '@/lib/types';

export interface UserDocument extends UserProfile, mongoose.Document {}

const UserSchema = new Schema<UserDocument>(
  {
    address: { type: String, required: true, unique: true, lowercase: true, index: true },
    displayName: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 500 },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const UserModel: Model<UserDocument> =
  mongoose.models.User ??
  mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
