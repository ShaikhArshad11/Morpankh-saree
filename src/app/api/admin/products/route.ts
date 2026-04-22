import { NextRequest, NextResponse } from 'next/server';
import { Db, MongoClient, WithId, Document } from 'mongodb';
import { getDatabaseName, getMongoClient } from '@/lib/database';

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
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/morpankh_saree';
    client = await getMongoClient(uri);
    await client.connect();
    db = client.db(getDatabaseName());
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize')) || 6));

    const database = await getDatabase();

    const total = await database.collection('products').countDocuments();

    const skip = (page - 1) * pageSize;
    const products = await database
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const transformed = (products as WithId<Document>[]).map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: transformed,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
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
      size: body?.size || '',
      hasSizes: Boolean(body?.hasSizes || false),
      sizes: body?.hasSizes ? (Array.isArray(body?.sizes) ? body.sizes : []) : [],

      hidden: Boolean(body?.hidden),
      featured: Boolean(body?.featured),
      isNew: Boolean(body?.isNew),
      isPremium: Boolean(body?.isPremium),
      isTrending: Boolean(body?.isTrending),
      isLimitedOffer: Boolean(body?.isLimitedOffer),
      limitedStock: body?.isLimitedOffer ? Number(body?.limitedStock) || undefined : undefined,
      limitedOfferMessage: body?.isLimitedOffer ? String(body?.limitedOfferMessage || '') : undefined,
      cardOfferText: typeof body?.cardOfferText === 'string' ? body.cardOfferText.trim() : '',

      // Prebooking fields
      isPrebooking: Boolean(body?.isPrebooking),
      prebookingPrice: body?.isPrebooking ? Number(body?.prebookingPrice) || undefined : undefined,
      prebookingDeliveryDays: body?.isPrebooking ? Number(body?.prebookingDeliveryDays) || undefined : undefined,
      prebookingMessage: body?.isPrebooking ? String(body?.prebookingMessage || '') : undefined,

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
