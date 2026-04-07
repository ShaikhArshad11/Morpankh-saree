import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export const runtime = 'nodejs';

interface OrderItem {
  productId: string;
  name: string;
  color: string;
  size?: string;
  quantity: number;
  price: number;
}

interface OrderDoc {
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;

  const raw = authHeader.trim();
  if (raw.toLowerCase().startsWith('bearer ')) return raw.slice(7).trim();
  return raw;
}

function decodeBase64Json(b64: string): unknown {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

  const jsonStr =
    typeof Buffer !== 'undefined'
      ? Buffer.from(padded, 'base64').toString('utf8')
      : atob(padded);

  return JSON.parse(jsonStr) as unknown;
}

function verifyToken(token: string): { id: string; email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = decodeBase64Json(parts[1]);
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;

    const exp = typeof p.exp === 'number' ? p.exp : undefined;
    if (exp && exp < Date.now() / 1000) return null;

    const userId = (p.id ?? p.userId) as unknown;
    if (!userId) return null;

    const email = typeof p.email === 'string' ? p.email : undefined;
    return { id: String(userId), email };
  } catch {
    return null;
  }
}

function normalizeOrderItem(raw: unknown): OrderItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const productId = String(r.productId ?? '').trim();
  const name = String(r.name ?? '').trim();
  const color = String(r.color ?? '').trim();
  const size = typeof r.size === 'string' ? r.size : undefined;
  const quantity = Number(r.quantity);
  const price = Number(r.price);

  if (!productId || !name || !color) return null;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(price) || price < 0) return null;

  return {
    productId,
    name,
    color,
    size,
    quantity,
    price,
  };
}

export async function GET(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured on the server' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morpankh_saree');
    const orders = db.collection<OrderDoc>('orders');

    const docs = await orders
      .find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .toArray();

    const data = docs.map((d) => {
      const oid = (d as unknown as { _id: ObjectId })._id;
      const id = oid ? oid.toString() : undefined;
      return {
        ...d,
        _id: id,
        id,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Orders GET failed', { userId: decoded.id, error: msg });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured on the server' }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const customerName = String(b.customerName ?? '').trim();
  const customerEmail = String(b.customerEmail ?? '').trim();
  const customerPhone = String(b.customerPhone ?? '').trim();
  const address = String(b.address ?? '').trim();
  const city = String(b.city ?? '').trim();
  const state = String(b.state ?? '').trim();
  const pincode = String(b.pincode ?? '').trim();

  const itemsRaw = Array.isArray(b.items) ? b.items : [];
  const items = itemsRaw.map(normalizeOrderItem).filter(Boolean) as OrderItem[];

  const subtotal = Number(b.subtotal);
  const total = Number(b.total);

  const paymentStatus = String(b.paymentStatus ?? 'paid') as OrderDoc['paymentStatus'];
  const orderStatus = String(b.orderStatus ?? 'confirmed') as OrderDoc['orderStatus'];
  const date = String(b.date ?? new Date().toISOString().split('T')[0]);

  if (!customerName || !customerEmail || !customerPhone) {
    return NextResponse.json({ error: 'customerName, customerEmail and customerPhone are required' }, { status: 400 });
  }
  if (!address || !city || !state || !pincode) {
    return NextResponse.json({ error: 'address, city, state and pincode are required' }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'At least one order item is required' }, { status: 400 });
  }
  if (!Number.isFinite(subtotal) || !Number.isFinite(total)) {
    return NextResponse.json({ error: 'subtotal and total must be valid numbers' }, { status: 400 });
  }

  const orderNumber = String(b.orderNumber ?? `MPS-${1000 + Math.floor(Math.random() * 9000)}`);

  const now = new Date();
  const doc: OrderDoc = {
    userId: decoded.id,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    address,
    city,
    state,
    pincode,
    items,
    subtotal,
    total,
    paymentStatus,
    orderStatus,
    date,
    createdAt: now,
    updatedAt: now,
  };

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('morpankh_saree');
    const orders = db.collection<OrderDoc>('orders');

    const result = await orders.insertOne(doc);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...doc,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Orders POST failed', { userId: decoded.id, error: msg });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  } finally {
    await client.close();
  }
}
