/**
 * ============================================================
 * API ROUTE: /api/products/[slug]
 * File: src/app/api/products/[slug]/route.ts
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

function getDbNameFromUri(uri: string) {
  const withoutQuery = uri.split('?')[0];
  const parts = withoutQuery.split('/');
  const name = parts.length > 3 ? parts[parts.length - 1] : '';
  return name.trim() || undefined;
}

function getSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function withVersion(url: string, version: string) {
  if (!url) return url;
  const hasQuery = url.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    const { slug } = await context.params;

    await client.connect();
    const db = client.db(getDbNameFromUri(uri) || 'morpankh_saree');
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

    const versionSource = (product.updatedAt ?? product.createdAt ?? product._id) as unknown;
    const version = String(
      versionSource instanceof Date ? versionSource.getTime() : versionSource
    );

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
              images: (((product.images as string[]) || []) as string[]).map((u) =>
                u.startsWith('/') ? u : withVersion(u, version)
              ),
              isOutOfStock: stock <= 0,
            };
          }

          const stock = Number(c.stock) || 0;
          return {
            colorName: c.colorName,
            stock,
            images: (c.images || []).map((u) => (u.startsWith('/') ? u : withVersion(u, version))),
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
      isSale: product.isSale ?? Boolean(product.salePercent),
      isFeatured: product.isFeatured ?? product.featured ?? false,
      rating: product.rating,
      reviewCount: product.reviewCount ?? product.reviews,
    };

    return NextResponse.json(
      response,
      {
        headers: {
          // Cache at Vercel CDN for fast repeat access.
          // 60s fresh, then allow serving stale while revalidating for 10 minutes.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
