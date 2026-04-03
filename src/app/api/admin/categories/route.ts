import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { uploadImage } from '@/lib/cloudinary';

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

export async function GET(request: NextRequest) {
  try {
    const database = await getDatabase();
    const categories = await database.collection('categories').find({}).toArray();
    
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const imageFile = formData.get('image') as File;
    const imageUrl = formData.get('imageUrl') as string;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    let imageUrlToUse = imageUrl;
    
    // Upload image to Cloudinary if file is provided
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrlToUse = await uploadImage(imageFile);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const database = await getDatabase();
    const category = {
      name,
      slug: finalSlug,
      image: imageUrlToUse || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.collection('categories').insertOne(category);
    
    return NextResponse.json({
      success: true,
      data: { ...category, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
