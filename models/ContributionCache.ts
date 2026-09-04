import mongoose, { Schema, type Model } from 'mongoose';
import type { Contribution } from '@/lib/types';

/**
 * ContributionCache — caches on-chain contribution data in MongoDB
 * for fast lookups without hitting the blockchain every time.
 */
export interface ContributionCacheDocument extends Contribution, mongoose.Document {}

const ContributionCacheSchema = new Schema<ContributionCacheDocument>(
  {
    campaignId: { type: Number, required: true, index: true },
    backer: { type: String, required: true, lowercase: true },
    amountWei: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
    timestamp: { type: Number, required: true },
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

// Compound index on (campaignId, backer)
ContributionCacheSchema.index({ campaignId: 1, backer: 1 });

const ContributionCacheModel: Model<ContributionCacheDocument> =
  mongoose.models.ContributionCache ??
  mongoose.model<ContributionCacheDocument>('ContributionCache', ContributionCacheSchema);

export default ContributionCacheModel;
