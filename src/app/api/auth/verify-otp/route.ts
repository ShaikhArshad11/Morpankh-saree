import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpExpiry?: Date;
  verified: boolean;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json(
      { error: 'JWT_SECRET is not configured on the server' },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('morpankh_saree');
    const users = db.collection<User>('users');

    // Find user with matching email and OTP
    const user = await users.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() }, // OTP not expired
      verified: false,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Update user as verified and remove OTP
    await users.updateOne(
      { _id: user._id },
      {
        $set: { verified: true },
        $unset: { otp: 1, otpExpiry: 1 },
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Account verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: true,
      },
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}