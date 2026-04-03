import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId } from 'mongodb';

interface ContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

function isAdminRequest(request: NextRequest) {
  const auth = (request.headers.get('authorization') || '').trim();
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token === 'admin-token';
}

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server' },
      { status: 500 }
    );
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morepankh_db');
    const contactMessages = db.collection<ContactMessage>('contact_messages');

    const messagesRaw = await contactMessages
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const messages = (messagesRaw as WithId<ContactMessage>[]).map((m) => ({
      ...m,
      _id: String(m._id),
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
