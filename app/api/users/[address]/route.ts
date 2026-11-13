import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import type { Address } from '@/lib/types';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * GET /api/users/[address]
 * Returns a user profile by wallet address.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await dbConnect();

    const { address } = await params;
    
    if (!ADDRESS_REGEX.test(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const lowerAddress = address.toLowerCase() as Address;
    const user = await UserModel.findOne({ address: lowerAddress }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`GET /api/users/[address] error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[address]
 * Creates or updates a user profile.
 * Body: { displayName: string, bio: string }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await dbConnect();

    const { address } = await params;
    
    if (!ADDRESS_REGEX.test(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const body = await request.json();
    const lowerAddress = address.toLowerCase() as Address;

    const user = await UserModel.findOneAndUpdate(
      { address: lowerAddress },
      {
        address: lowerAddress,
        displayName: body.displayName,
        bio: body.bio ?? '',
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(user!.toJSON());
  } catch (error) {
    console.error(`PUT /api/users/[address] error:`, error);
    return NextResponse.json(
      { error: 'Invalid user data or internal server error' },
      { status: 400 }
    );
  }
}
