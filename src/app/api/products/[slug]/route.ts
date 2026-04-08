/**
 * ============================================================
 * API ROUTE: /api/products/[slug]
 * File: src/app/api/products/[slug]/route.ts
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

const DB_NAME = 'morpankh_saree';

function getSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const client = new MongoClient(uri);

  try {
    const { slug } = await context.params;

    await client.connect();
    const db = client.db(DB_NAME);
    const products = db.collection('products');

    // Find by slug field OR by generating slug from name
    const product = await products.findOne({
      $or: [
        { slug },
        { slug: { $exists: false }, name: { $regex: slug.replace(/-/g, ' '), $options: 'i' } },
      ],
      isActive: { $ne: false }, // Only active products
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // ── Compute derived fields ──────────────────────────────
    const base = (product.basePrice ?? product.price) as number;
    const compare = (product.compareAtPrice ?? product.comparePrice) as number | undefined;
    const discountPercent =
      compare && compare > base
        ? Math.round((1 - base / compare) * 100)
        : undefined;

    // ── Enrich colors with isOutOfStock ─────────────────────
    const rawColors = product.colors as unknown;
    const colors = Array.isArray(rawColors)
      ? (rawColors as Array<
          | string
          | { colorName: string; stock: number; images?: string[]; isOutOfStock?: boolean }
        >).map((c) => {
          if (typeof c === 'string') {
            const stock = Number(product.stock) || 0;
            return {
              colorName: c,
              stock,
              images: (product.images as string[]) || [],
              isOutOfStock: stock <= 0,
            };
          }

          const stock = Number(c.stock) || 0;
          return {
            colorName: c.colorName,
            stock,
            images: c.images || [],
            isOutOfStock: c.isOutOfStock ?? stock <= 0,
          };
        })
      : [];

    // ── Shape the API response ──────────────────────────────
    const response = {
      _id: String(product._id),
      name: product.name,
      slug: product.slug || getSlug(product.name),
      sku: product.sku,
      category: product.category,
      basePrice: base,
      compareAtPrice: compare,
      discountPercent,
      shortDescription: product.shortDescription,
      description: product.description,
      fabricType: product.fabricType ?? product.fabric,
      sareeLength: product.sareeLength,
      blouseIncluded: product.blouseIncluded ?? false,
      tags: product.tags || [],
      colors,
      isSale: product.isSale ?? Boolean(compare && compare > base),
      isFeatured: product.isFeatured ?? product.featured ?? false,
      rating: product.rating,
      reviewCount: product.reviewCount ?? product.reviews,
    };

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
