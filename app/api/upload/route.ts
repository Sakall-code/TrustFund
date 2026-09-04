import { NextResponse } from 'next/server';
import { pinFileToIPFS } from '@/lib/ipfs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * POST /api/upload
 * Accepts a multipart form with a "file" field, uploads it to Pinata IPFS,
 * and returns { cid: string }.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Send a "file" field in multipart form data.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only PNG, JPEG, WEBP, and GIF are allowed.' },
        { status: 415 }
      );
    }

    try {
      const cid = await pinFileToIPFS(file, file.name);
      return NextResponse.json({ cid });
    } catch (_pinataError) {
      return NextResponse.json(
        { error: 'Failed to upload to IPFS. Gateway might be down.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
