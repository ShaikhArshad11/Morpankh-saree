import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { uploadImage, deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';

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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    const database = await getDatabase();
    
    // Get existing category to check for image changes
    const existingCategory = await database.collection('categories').findOne({ _id: new ObjectId(id) });
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    let imageUrlToUse = existingCategory.image;
    
    // Upload new image to Cloudinary if file is provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Delete old image from Cloudinary if it's a Cloudinary URL
        if (existingCategory.image && existingCategory.image.includes('cloudinary')) {
          const publicId = getPublicIdFromUrl(existingCategory.image);
          await deleteImage(publicId).catch(console.error);
        }
        
        imageUrlToUse = await uploadImage(imageFile);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    } else if (imageUrl && imageUrl !== existingCategory.image) {
      // If URL is provided and different from existing, use it
      imageUrlToUse = imageUrl;
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const updateData = {
      name,
      slug: finalSlug,
      image: imageUrlToUse,
      updatedAt: new Date(),
    };

    const result = await database.collection('categories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get updated category
    const updatedCategory = await database.collection('categories').findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const database = await getDatabase();
    
    // Get category before deletion to remove image from Cloudinary
    const category = await database.collection('categories').findOne({ _id: new ObjectId(id) });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it's a Cloudinary URL
    if (category.image && category.image.includes('cloudinary')) {
      const publicId = getPublicIdFromUrl(category.image);
      await deleteImage(publicId).catch(console.error);
    }

    // Delete category from database
    const result = await database.collection('categories').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
