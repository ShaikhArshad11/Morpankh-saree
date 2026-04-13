import { NextRequest, NextResponse } from 'next/server';
import { WithId, Document } from 'mongodb';
import { getDatabaseName, getMongoClient } from '@/lib/database';

export async function GET(request: NextRequest) {
  void request;
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
    const categories = await database.collection('categories')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const productCounts = await database
      .collection('products')
      .aggregate([
        { $match: { hidden: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ])
      .toArray();

    const countBySlug = new Map<string, number>();
    for (const row of productCounts as Array<{ _id?: unknown; count?: unknown }>) {
      const slug = typeof row?._id === 'string' ? row._id : '';
      const count = typeof row?.count === 'number' ? row.count : 0;
      if (slug) countBySlug.set(slug, count);
    }
    
    // Transform the data to match the expected format
    const transformedCategories = categories.map((cat: WithId<Document>) => ({
      id: cat._id.toString(),
      name: cat.name as string,
      slug: cat.slug as string,
      image: cat.image as string,
      productCount: countBySlug.get((cat.slug as string) || '') || 0,
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: transformedCategories 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
