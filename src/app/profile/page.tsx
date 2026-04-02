"use client";

import Link from 'next/link';
import { useStore } from '@/store/useStore';

import PublicLayout from '@/components/PublicLayout';

const ProfilePage = () => {
  const { isLoggedIn, user } = useStore((s) => ({ isLoggedIn: s.isLoggedIn, user: s.user }));

  if (!isLoggedIn || !user) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        <p className="text-base text-muted-foreground mb-4">You need to login to view profile details.</p>
        <Link href="/login" className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          Go to Login
        </Link>
      </div>
    </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">Name</p>
        <p className="text-lg font-semibold mb-3">{user.name}</p>

        <p className="text-sm text-muted-foreground mb-1">Email</p>
        <p className="text-lg font-semibold mb-3">{user.email}</p>

        <p className="text-sm text-muted-foreground mb-1">Verified</p>
        <p className="text-lg font-semibold mb-3">{user.verified ? 'Yes' : 'No'}</p>

        <p className="text-sm text-muted-foreground mb-1">User ID</p>
        <p className="text-lg font-semibold">{user.id}</p>
      </div>
    </div>
    </PublicLayout>
  );
};

export default ProfilePage;
