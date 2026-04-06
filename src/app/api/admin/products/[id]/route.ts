import { NextRequest, NextResponse } from 'next/server';
import { Db, MongoClient, ObjectId, WithId, Document } from 'mongodb';

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

type IncomingColorVariant = {
  colorName: string;
  stock: number;
  images: string[];
};

function normalizeColors(value: unknown): IncomingColorVariant[] {
  if (!Array.isArray(value)) return [];

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product id' }, { status: 400 });
    }

    const body = await request.json();

    const database = await getDatabase();

    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body?.name !== undefined) update.name = String(body.name).trim();
    if (body?.slug !== undefined) update.slug = String(body.slug).trim();
    if (body?.sku !== undefined) update.sku = String(body.sku).trim();
    if (body?.category !== undefined) update.category = String(body.category).trim();

    const nextPrice = body?.price ?? body?.salePrice ?? body?.basePrice;
    const nextCompare = body?.comparePrice ?? body?.compareAtPrice ?? body?.originalPrice;

    if (nextPrice !== undefined) {
      const p = Number(nextPrice);
      if (!Number.isFinite(p)) {
        return NextResponse.json({ success: false, error: 'Valid price is required' }, { status: 400 });
      }
      update.price = p;
      update.basePrice = p;
    }

    if (nextCompare !== undefined) {
      const cp = Number(nextCompare);
      if (!Number.isFinite(cp)) {
        return NextResponse.json({ success: false, error: 'Valid compare price is required' }, { status: 400 });
      }
      update.comparePrice = cp;
      update.compareAtPrice = cp;
    }

    if (body?.stock !== undefined) update.stock = Number(body.stock) || 0;

    if (body?.colors !== undefined) {
      const colors = normalizeColors(body.colors);
      if (colors.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one color variant is required' },
          { status: 400 }
        );
      }
      update.colors = colors;
      update.images = colors.flatMap((c) => c.images || []).filter(Boolean);
    }

    if (body?.description !== undefined) update.description = body.description || '';

    if (body?.fabric !== undefined) {
      update.fabric = body.fabric || '';
      update.fabricType = body.fabricType ?? body.fabric ?? '';
    } else if (body?.fabricType !== undefined) {
      update.fabricType = body.fabricType ?? '';
    }

    if (body?.shortDescription !== undefined) update.shortDescription = body.shortDescription;

    if (body?.salePercent !== undefined) {
      update.salePercent = body.salePercent ? Number(body.salePercent) : undefined;
    }

    if (body?.hidden !== undefined) update.hidden = Boolean(body.hidden);
    if (body?.featured !== undefined) update.featured = Boolean(body.featured);
    if (body?.isNew !== undefined) update.isNew = Boolean(body.isNew);
    if (body?.isPremium !== undefined) update.isPremium = Boolean(body.isPremium);
    if (body?.isTrending !== undefined) update.isTrending = Boolean(body.isTrending);

    if (body?.rating !== undefined) update.rating = Number(body.rating) || 0;
    if (body?.reviews !== undefined) update.reviews = Number(body.reviews) || 0;
    if (body?.sareeLength !== undefined) update.sareeLength = body.sareeLength || '';
    if (body?.blouseIncluded !== undefined) update.blouseIncluded = Boolean(body.blouseIncluded);
    if (body?.tags !== undefined) update.tags = Array.isArray(body.tags) ? body.tags : [];

    const result = await database
      .collection('products')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      );

    if (!result) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const transformed = {
      ...(result as WithId<Document>),
      _id: String((result as WithId<Document>)._id),
    };

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product id' }, { status: 400 });
    }

    const database = await getDatabase();

    const result = await database
      .collection('products')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
