import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, WithId, Document } from 'mongodb';

let client: MongoClient;
let db: Db;

function getDbNameFromUri(uri: string) {
  const withoutQuery = uri.split('?')[0];
  const parts = withoutQuery.split('/');
  const name = parts.length > 3 ? parts[parts.length - 1] : '';
  return name.trim() || undefined;
}

async function getDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(getDbNameFromUri(uri) || 'morpankh_saree');
  }
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const database = await getDatabase();
    const categories = await database.collection('categories')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform the data to match the expected format
    const transformedCategories = categories.map((cat: WithId<Document>) => ({
      id: cat._id.toString(),
      name: cat.name as string,
      slug: cat.slug as string,
      image: cat.image as string,
      productCount: (cat.productCount as number) || 0,
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
  }
}
