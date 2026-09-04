import mongoose, { Schema, type Model } from 'mongoose';
import type { CampaignMeta } from '@/lib/types';

// Omit createdAt from CampaignMeta and replace it with Date for the document interface
export interface CampaignDocument extends Omit<CampaignMeta, 'createdAt'>, mongoose.Document {
  createdAt: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
  {
    campaignId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 5000 },
    tags: { type: [String], index: true, default: [] },
    imageCid: { type: String, required: true },
    creatorAddress: { type: String, required: true, lowercase: true, index: true },
    creatorName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        // Convert Date to ISO string to match CampaignMeta interface
        if (ret.createdAt instanceof Date) {
          ret.createdAt = ret.createdAt.toISOString();
        }
        return ret;
      },
    },
  }
);

// Add text index for search
CampaignSchema.index({ title: 'text', description: 'text' });

const CampaignModel: Model<CampaignDocument> =
  mongoose.models.Campaign ??
  mongoose.model<CampaignDocument>('Campaign', CampaignSchema);

export default CampaignModel;
