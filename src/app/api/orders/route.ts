import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

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

async function sendInvoiceEmail(order: OrderDoc): Promise<boolean> {
  try {
    console.log('📧 Attempting to send invoice email to:', order.customerEmail);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_USE_SSL === 'true',
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
      logger: true,
      debug: true,
    });

    // Verify SMTP Connection
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully');

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.color}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.size || 'N/A'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const mailOptions = {
      from: `"Morpankh Saree" <${process.env.EMAIL_HOST_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber} | Morpankh Saree`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dbeafe; padding-bottom: 20px;">
              <h1 style="margin: 0; color: #1f2937; font-size: 28px;">Morpankh Saree</h1>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Celebrating Indian Tradition</p>
            </div>

            <!-- Order Status -->
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
              <h2 style="margin: 0 0 8px; color: #059669; font-size: 18px;">✓ Order Confirmed!</h2>
              <p style="margin: 0; color: #047857;">Thank you for your purchase. Your order has been successfully placed.</p>
            </div>

            <!-- Order Details -->
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold; width: 50%;">Order Number:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Order Date:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${order.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: #10b981; font-weight: bold;">Confirmed</td>
                </tr>
              </table>
            </div>

            <!-- Customer Details -->
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Delivery Address</h3>
              <p style="margin: 0; color: #1f2937; font-weight: bold;">${order.customerName}</p>
              <p style="margin: 5px 0; color: #4b5563;">${order.address}</p>
              <p style="margin: 5px 0; color: #4b5563;">${order.city}, ${order.state} ${order.pincode}</p>
              <p style="margin: 5px 0; color: #4b5563;">Phone: ${order.customerPhone}</p>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Product</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151;">Color</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151;">Size</th>
                    <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Order Summary -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px 15px; text-align: right; color: #1f2937;">₹${order.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: bold; font-size: 18px; text-align: right;">Total Amount:</td>
                  <td style="padding: 10px 15px; background-color: #dbeafe; color: #1e40af; font-weight: bold; font-size: 18px; text-align: right; border-radius: 4px;">₹${order.total.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
              <h4 style="margin: 0 0 8px; color: #92400e; font-weight: bold;">What's Next?</h4>
              <p style="margin: 0; color: #78350f; font-size: 14px;">Your order will be processed shortly. You will receive a shipping confirmation email with tracking details once your order is dispatched.</p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Thank you for shopping with Morpankh Saree!</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email. Please do not reply. For any queries, contact us at support@morpankh.com
              </p>
            </div>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Invoice email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('✗ Failed to send invoice email:', error);
    return false;
  }
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

    // Send invoice email asynchronously (don't wait for it to complete response)
    const completeOrder = {
      ...doc,
      _id: result.insertedId,
    };
    sendInvoiceEmail(completeOrder).catch(err => console.error('Email sending error:', err));

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
