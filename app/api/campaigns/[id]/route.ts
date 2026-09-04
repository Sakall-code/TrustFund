import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignModel from '@/models/Campaign';

/**
 * GET /api/campaigns/[id]
 * Returns a single campaign metadata record by campaignId.
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

    const campaign = await CampaignModel.findOne({ campaignId }).lean();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error(`GET /api/campaigns/[id] error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
