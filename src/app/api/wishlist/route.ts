import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface WishlistDoc {
  userId: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

async function getMongoClient(uri: string) {
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;

  const raw = authHeader.trim();
  if (raw.toLowerCase().startsWith('bearer ')) return raw.slice(7).trim();
  return raw;
}

function verifyToken(token: string): { id: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.exp && payload.exp < Date.now() / 1000) return null;

    const userId = payload.id ?? payload.userId;
    if (!userId) return null;
    return { id: String(userId) };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured on the server' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morepankh_db');
    const wishlists = db.collection<WishlistDoc>('wishlists');

    const doc = await wishlists.findOne({ userId: decoded.id });

    return NextResponse.json({ wishlist: doc?.productIds || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured on the server' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body?.productId || '').trim();
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morepankh_db');
    const wishlists = db.collection<WishlistDoc>('wishlists');

    const now = new Date();
    await wishlists.updateOne(
      { userId: decoded.id },
      {
        $setOnInsert: { userId: decoded.id, createdAt: now, productIds: [] },
        $addToSet: { productIds: productId },
        $set: { updatedAt: now },
      },
      { upsert: true }
    );

    const updated = await wishlists.findOne({ userId: decoded.id });
    return NextResponse.json({ wishlist: updated?.productIds || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function DELETE(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured on the server' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = String(searchParams.get('productId') || '').trim();
  if (!productId) {
    return NextResponse.json({ error: 'productId query param is required' }, { status: 400 });
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morepankh_db');
    const wishlists = db.collection<WishlistDoc>('wishlists');

    const now = new Date();
    await wishlists.updateOne(
      { userId: decoded.id },
      {
        $pull: { productIds: productId },
        $set: { updatedAt: now },
      }
    );

    const updated = await wishlists.findOne({ userId: decoded.id });
    return NextResponse.json({ wishlist: updated?.productIds || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
