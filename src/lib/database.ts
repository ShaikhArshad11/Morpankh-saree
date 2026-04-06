import { MongoClient } from 'mongodb';

// Extract database name from MONGODB_URI
export function getDatabaseName(): string {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/morpankh_saree';
  // Extract database name from URI using string splitting
  const parts = uri.split('/');
  return parts.length > 3 ? parts[3] : 'morpankh_saree';
}

export async function getMongoClient(uri: string) {
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
}
