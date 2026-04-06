import { NextRequest, NextResponse } from 'next/server';
import { Db, MongoClient, WithId, Document } from 'mongodb';

let client: MongoClient;
let db: Db;

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

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

type ColorVariantLike = {
  colorName?: unknown;
  images?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getVariantColorName(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const v = value as ColorVariantLike;
  return typeof v.colorName === 'string' ? v.colorName : undefined;
}

function getVariantImages(value: unknown): string[] {
  if (!isRecord(value)) return [];
  const v = value as ColorVariantLike;
  if (!Array.isArray(v.images)) return [];
  return (v.images as unknown[]).filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export async function GET(_request: NextRequest) {
  try {
    const database = await getDatabase();
    const raw = await database
      .collection('products')
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();

    const products = (raw as WithId<Document>[]).map((p) => {
      const price = toNumber(p.basePrice ?? p.price);
      const comparePrice = toNumber(p.compareAtPrice ?? p.comparePrice, price);

      const rawColors = p.colors as unknown;
      const colorNames = Array.isArray(rawColors)
        ? rawColors
            .map((c) => (typeof c === 'string' ? c : getVariantColorName(c)))
            .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
        : [];

      const imagesFromVariants = Array.isArray(rawColors)
        ? rawColors
            .flatMap((c) => getVariantImages(c))
        : [];

      const images = (
        (Array.isArray(p.images) ? (p.images as unknown[]) : []).filter(
          (u): u is string => typeof u === 'string' && u.length > 0
        )
      ).length
        ? ((p.images as unknown[]) as string[])
        : imagesFromVariants;

      const stock = toNumber(p.stock);
      const salePercent = p.salePercent !== undefined ? toNumber(p.salePercent) : undefined;
      const isSale =
        p.isSale !== undefined
          ? Boolean(p.isSale)
          : Boolean(salePercent) || (comparePrice > price);

      return {
        id: String(p._id),
        name: String(p.name || ''),
        slug: String(p.slug || getSlug(String(p.name || ''))),
        price,
        comparePrice,
        description: String(p.description || ''),
        fabric: String(p.fabricType ?? p.fabric ?? ''),
        images: images.length ? images : ['/placeholder.svg'],
        category: String(p.category || ''),
        colors: colorNames,
        stock,
        sku: String(p.sku || ''),
        tags: Array.isArray(p.tags) ? p.tags : [],
        featured: Boolean(p.isFeatured ?? p.featured),
        isNew: Boolean(p.isNew),
        isSale,
        isPremium: Boolean(p.isPremium),
        isTrending: Boolean(p.isTrending),
        rating: toNumber(p.rating),
        reviews: toNumber(p.reviewCount ?? p.reviews),
        hidden: Boolean(p.hidden),
        salePercent,
      };
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
