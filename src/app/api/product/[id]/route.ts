import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

function getDbNameFromUri(uri: string) {
  const withoutQuery = uri.split('?')[0];
  const parts = withoutQuery.split('/');
  const name = parts.length > 3 ? parts[parts.length - 1] : '';
  return name.trim() || undefined;
}

function withVersion(url: string, version: string) {
  if (!url) return url;
  const hasQuery = url.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { success: false, error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product id' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(getDbNameFromUri(uri) || 'morpankh_saree');
    const products = db.collection('products');

    const product = await products.findOne({
      _id: new ObjectId(id),
      isActive: { $ne: false },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const versionSource = (product.updatedAt ?? product.createdAt ?? product._id) as unknown;
    const version = String(
      versionSource instanceof Date ? versionSource.getTime() : versionSource
    );

    const rawColors = product.colors as unknown;
    const colors = Array.isArray(rawColors)
      ? (rawColors as Array<
          | string
          | { colorName: string; stock: number; images?: string[]; isOutOfStock?: boolean }
        >).map((c) => {
          if (typeof c === 'string') {
            const stock = Number(product.stock) || 0;
            const imgs = ((product.images as string[]) || []).map((u) =>
              u.startsWith('/') ? u : withVersion(u, version)
            );
            return {
              colorName: c,
              stock,
              images: imgs,
              isOutOfStock: stock <= 0,
            };
          }

          const stock = Number(c.stock) || 0;
          const imgs = (c.images || []).map((u) =>
            u.startsWith('/') ? u : withVersion(u, version)
          );
          return {
            colorName: c.colorName,
            stock,
            images: imgs,
            isOutOfStock: c.isOutOfStock ?? stock <= 0,
          };
        })
      : [];

    const base = (product.basePrice ?? product.price) as number;
    const compare = (product.compareAtPrice ?? product.comparePrice) as number | undefined;

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(product._id),
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          category: product.category,
          basePrice: base,
          compareAtPrice: compare,
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
          updatedAt: product.updatedAt ?? product.createdAt ?? null,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
