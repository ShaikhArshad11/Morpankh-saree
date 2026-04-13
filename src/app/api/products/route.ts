import { NextRequest, NextResponse } from 'next/server';
import { WithId, Document } from 'mongodb';
import { getDatabaseName, getMongoClient } from '@/lib/database';

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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { success: false, error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  const client = await getMongoClient(uri);
  try {
    await client.connect();
    const database = client.db(getDatabaseName());
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
        ? rawColors.flatMap((c) => getVariantImages(c))
        : [];

      const images = Array.isArray(p.images) && p.images.length
        ? (p.images as unknown[]).filter((u): u is string => typeof u === 'string' && u.length > 0)
        : imagesFromVariants;

      const stock = toNumber(p.stock);
      const isSale =
        p.isSale !== undefined
          ? Boolean(p.isSale)
          : (comparePrice > price);

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
      };
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
