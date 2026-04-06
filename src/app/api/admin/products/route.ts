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

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const productsRaw = await products
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    const productsWithId = productsRaw.map((product) => ({
      ...product,
      _id: String(product._id)
    }));

    return NextResponse.json({ data: productsWithId });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const newProduct = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await products.insertOne(newProduct);
    
    return NextResponse.json({
      message: 'Product created successfully',
      data: { ...newProduct, _id: String(result.insertedId) }
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
