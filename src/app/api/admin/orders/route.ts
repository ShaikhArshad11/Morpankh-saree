import { NextRequest, NextResponse } from 'next/server';
import { Db, MongoClient, WithId, Document } from 'mongodb';

export const runtime = 'nodejs';

let client: MongoClient;
let db: Db;

function isAdminRequest(request: NextRequest) {
  const auth = (request.headers.get('authorization') || '').trim();
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token === 'admin-token';
}

async function getDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('morpankh_saree');
  }
  return db;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const database = await getDatabase();
    const orders = await database
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const transformed = (orders as WithId<Document>[]).map((o) => ({
      ...o,
      _id: o._id.toString(),
      id: o._id.toString(),
    }));

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching admin orders:', msg);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
