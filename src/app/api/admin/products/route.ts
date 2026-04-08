import { NextRequest, NextResponse } from 'next/server';
import { Db, MongoClient, WithId, Document } from 'mongodb';

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

function getSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

type IncomingColorVariant = {
  colorName: string;
  stock: number;
  images: string[];
};

function normalizeColors(value: unknown): IncomingColorVariant[] {
  if (!Array.isArray(value)) return [];

  // allow both old schema colors: string[] and new schema colors: {colorName, stock, images}[]
  if (value.every((v) => typeof v === 'string')) {
    return (value as string[]).map((c) => ({
      colorName: c,
      stock: 0,
      images: [],
    }));
  }

  return (value as Array<Partial<IncomingColorVariant>>)
    .filter((c) => typeof c?.colorName === 'string')
    .map((c) => ({
      colorName: String(c.colorName),
      stock: Number(c.stock) || 0,
      images: Array.isArray(c.images) ? (c.images as string[]) : [],
    }));
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const database = await getDatabase();
    const products = await database
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const transformed = (products as WithId<Document>[]).map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const name = String(body?.name || '').trim();
    const category = String(body?.category || '').trim();

    const price = Number(body?.price ?? body?.salePrice ?? body?.basePrice);
    const comparePrice = Number(body?.comparePrice ?? body?.compareAtPrice ?? body?.originalPrice);

    if (!name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }
    if (!Number.isFinite(price)) {
      return NextResponse.json({ success: false, error: 'Valid price is required' }, { status: 400 });
    }
    if (!Number.isFinite(comparePrice)) {
      return NextResponse.json({ success: false, error: 'Valid compare price is required' }, { status: 400 });
    }

    const colors = normalizeColors(body?.colors);
    if (colors.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one color variant is required' }, { status: 400 });
    }

    const slug = String(body?.slug || getSlug(name));

    const database = await getDatabase();

    const doc = {
      name,
      slug,
      sku: body?.sku || '',
      category,

      // store both for compatibility
      price,
      comparePrice,
      basePrice: price,
      compareAtPrice: comparePrice,

      stock: Number(body?.stock) || 0,
      colors,

      description: body?.description || '',
      fabric: body?.fabric || '',
      fabricType: body?.fabricType ?? body?.fabric ?? '',
      shortDescription: body?.shortDescription,

      hidden: Boolean(body?.hidden),
      featured: Boolean(body?.featured),
      isNew: Boolean(body?.isNew),
      isPremium: Boolean(body?.isPremium),
      isTrending: Boolean(body?.isTrending),

      rating: Number(body?.rating) || 0,
      reviews: Number(body?.reviews) || 0,
      sareeLength: body?.sareeLength || '',
      blouseIncluded: Boolean(body?.blouseIncluded),
      tags: Array.isArray(body?.tags) ? body.tags : [],

      // fallbacks for legacy UI usage
      images: colors.flatMap((c) => c.images || []).filter(Boolean),

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.collection('products').insertOne(doc);

    return NextResponse.json({
      success: true,
      data: { ...doc, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
