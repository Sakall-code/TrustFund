import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContributionCacheModel from '@/models/ContributionCache';

/**
 * GET /api/campaigns/[id]/contributions
 * Returns all cached contributions for a specific campaign.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const campaignId = parseInt(id, 10);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    const contributions = await ContributionCacheModel.find({ campaignId })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json(contributions);
  } catch (error) {
    console.error('GET /api/campaigns/[id]/contributions error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
