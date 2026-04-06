import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId } from 'mongodb';

interface ReviewDoc {
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  approved: boolean;
  createdAt: Date;
}

function isAdminRequest(request: NextRequest) {
  const auth = (request.headers.get('authorization') || '').trim();
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token === 'admin-token';
}

async function getMongoClient(uri: string) {
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
}

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morpankh_saree');
    const reviews = db.collection<ReviewDoc>('reviews');

    const reviewsRaw = await reviews
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    const items = (reviewsRaw as WithId<ReviewDoc>[]).map((r) => ({
      ...r,
      _id: String(r._id),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ reviews: items });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
