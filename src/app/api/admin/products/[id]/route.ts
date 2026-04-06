import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoClient, getDatabaseName } from '@/lib/database';

interface DbProduct {
  _id?: ObjectId;
  name: string;
  slug: string;
  price: number;
  comparePrice: number;
  category: string;
  stock: number;
  colors: string[];
  description: string;
  fabric: string;
  salePercent?: number;
  hidden: boolean;
  images: string[];
  sku?: string;
  tags?: string[];
  featured?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  isTrending?: boolean;
  rating?: number;
  reviews?: number;
  sareeLength?: string;
  blouseIncluded?: boolean;
}

// Simple admin check
function isAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ?? false;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 500 });
  }

  const client = await getMongoClient(uri);
  try {
    const body = await request.json();
    
    await client.connect();
    const db = client.db(getDatabaseName());
    const products = db.collection<DbProduct>('products');

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      data: { _id: id, ...updateData }
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 500 });
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const db = client.db(getDatabaseName());
    const products = db.collection<DbProduct>('products');

    const result = await products.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
