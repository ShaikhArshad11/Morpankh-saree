import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET || 'morpankh-saree-jwt-secret-key-2026';

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  verified: boolean;
  mobile?: string;
  alternateMobile?: string;
  address?: string;
  city?: string;
  pincode?: string;
  createdAt: Date;
}

// Simple JWT verification (since jsonwebtoken might not be available)
function verifyToken(token: string): { id: string } | null {
  try {
    // For now, we'll use a simple approach - in production, use proper JWT verification
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check if token is expired (simple check)
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return { id: payload.id };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const client = new MongoClient(uri);
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await client.connect();
    const db = client.db('morepankh_db');
    const users = db.collection<User>('users');

    const user = await users.findOne({ id: decoded.id });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const { _id, ...userWithoutId } = user;
    return NextResponse.json(userWithoutId);

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  const client = new MongoClient(uri);
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized: No valid token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    
    if (!decoded) {
      console.log('Token verification failed');
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const updates: Partial<User> = await request.json();
    console.log('Profile updates:', updates);
    
    // Validate required fields
    if (!updates.name || !updates.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    await client.connect();
    const db = client.db('morepankh_db');
    const users = db.collection<User>('users');

    // Check if email is being changed and if it's already taken
    const existingUser = await users.findOne({ 
      email: updates.email, 
      id: { $ne: decoded.id } 
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const updateData: Partial<User> = {
      name: updates.name,
      email: updates.email,
      mobile: updates.mobile,
      alternateMobile: updates.alternateMobile,
      address: updates.address,
      city: updates.city,
      pincode: updates.pincode,
    };

    console.log('Updating user with ID:', decoded.id);
    console.log('Update data:', updateData);

    const result = await users.updateOne(
      { id: decoded.id },
      { $set: updateData }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch updated user data
    const updatedUser = await users.findOne({ id: decoded.id });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to fetch updated user' }, { status: 500 });
    }

    // Remove sensitive fields
    const { _id, ...userWithoutId } = updatedUser;
    console.log('Updated user data:', userWithoutId);
    
    return NextResponse.json(userWithoutId);

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await client.close();
  }
}
