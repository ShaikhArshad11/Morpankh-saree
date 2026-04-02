"use client";

import Link from 'next/link';
import { useStore } from '@/store/useStore';

const OrdersPage = () => {
  const { isLoggedIn, user, orders } = useStore((s) => ({ isLoggedIn: s.isLoggedIn, user: s.user, orders: s.orders }));

  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-base text-muted-foreground mb-4">Login to see your order history.</p>
        <Link href="/login" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  const myOrders = orders.filter((order) => order.customerEmail.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">My Orders</h1>
      {myOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-base text-muted-foreground mb-2">You do not have any past orders yet.</p>
          <Link href="/products" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {myOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Order #{order.orderNumber}</h2>
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">{order.orderStatus}</span>
              </div>
              <p className="text-sm text-muted-foreground">Date: {order.date}</p>
              <p className="text-sm text-muted-foreground">Payment: {order.paymentStatus}</p>
              <div className="mt-2 text-sm">
                <p>Items:</p>
                <ul className="list-disc pl-5">
                  {order.items.map((item, index) => (
                    <li key={`${item.productId}-${index}`}>{item.name} x{item.quantity} ({item.color}{item.size ? `, ${item.size}` : ''})</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 text-sm font-semibold">Total: ₹{order.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
