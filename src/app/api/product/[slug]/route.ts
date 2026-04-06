/**
 * ============================================================
 * API ROUTE: /api/products/[slug]
 * File: src/app/api/products/[slug]/route.ts
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;

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
    const db = client.db('morpankh_db');
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
    const base = product.basePrice as number;
    const compare = product.compareAtPrice as number | undefined;
    const discountPercent =
      compare && compare > base
        ? Math.round((1 - base / compare) * 100)
        : undefined;

    // ── Enrich colors with isOutOfStock ─────────────────────
    const colors = ((product.colors as Array<{
      colorName: string;
      stock: number;
      images: string[];
    }>) || []).map((c) => ({
      colorName: c.colorName,
      stock: c.stock,
      images: c.images || [],
      isOutOfStock: c.stock <= 0,
    }));

    // ── Shape the API response ──────────────────────────────
    const response = {
      _id: String(product._id),
      name: product.name,
      slug: product.slug || getSlug(product.name),
      sku: product.sku,
      category: product.category,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      discountPercent,
      shortDescription: product.shortDescription,
      description: product.description,
      fabricType: product.fabricType,
      sareeLength: product.sareeLength,
      blouseIncluded: product.blouseIncluded ?? false,
      tags: product.tags || [],
      colors,
      isSale: product.isSale ?? false,
      isFeatured: product.isFeatured ?? false,
      rating: product.rating,
      reviewCount: product.reviewCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}

/**
 * ============================================================
 * API ROUTE: /api/admin/products  (POST — Create)
 * File: src/app/api/admin/products/route.ts
 * ============================================================
 * Add this POST handler to your existing admin products route.
 */
export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);
  try {
    const body = await request.json();

    const {
      name,
      sku,
      barcode,
      category,
      basePrice,
      compareAtPrice,
      costPrice,
      shortDescription,
      description,
      fabricType,
      sareeLength,
      blouseIncluded,
      tags,
      colors,           // Array of { colorName, stock, images[] }
      isActive,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isSale,
      isPremiumPattern,
      isTrendingPattern,
      isPreBooking,
    } = body;

    if (!name || !sku || !category || !basePrice || !colors?.length) {
      return NextResponse.json(
        { error: 'name, sku, category, basePrice, and at least one color are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await client.connect();
    const db = client.db('morpankh_db');

    const doc = {
      name,
      slug,
      sku,
      barcode,
      category,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      shortDescription,
      description,
      fabricType,
      sareeLength,
      blouseIncluded: Boolean(blouseIncluded),
      tags: tags || [],
      colors: colors.map((c: { colorName: string; stock: number; images: string[] }) => ({
        colorName: c.colorName,
        stock: Number(c.stock) || 0,
        images: c.images || [],
      })),
      isActive: isActive !== false,
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      isSale: Boolean(isSale),
      isPremiumPattern: Boolean(isPremiumPattern),
      isTrendingPattern: Boolean(isTrendingPattern),
      isPreBooking: Boolean(isPreBooking),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('products').insertOne(doc);
    return NextResponse.json({ success: true, _id: String(result.insertedId), slug });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}