import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CampaignModel from '@/models/Campaign';

/**
 * GET /api/campaigns?q=...&tag=...&page=1&limit=12
 * Returns paginated campaign metadata with optional search and tag filter.
 * Response: { items: CampaignMeta[], total: number }
 */
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10));

    // Build filter
    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (tag) {
      filter.tags = tag;
    }

    const [items, total] = await Promise.all([
      CampaignModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CampaignModel.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Creates a new campaign metadata record.
 * Body: Omit<CampaignMeta, 'createdAt'>  (client provides campaignId)
 */
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if campaignId already exists
    const existing = await CampaignModel.findOne({ campaignId: body.campaignId });
    if (existing) {
      return NextResponse.json(
        { error: 'Campaign ID already exists' },
        { status: 409 }
      );
    }

    const campaign = await CampaignModel.create(body);

    return NextResponse.json(campaign.toJSON(), { status: 201 });
  } catch (error) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json(
      { error: 'Invalid campaign data or internal server error' },
      { status: 400 } // Or 500, keeping generic error for client
    );
  }
}
