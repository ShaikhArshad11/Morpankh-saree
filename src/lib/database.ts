import { MongoClient } from 'mongodb';

// Extract database name from MONGODB_URI
export function getDatabaseName(): string {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/morpankh_saree';
  const lastSegment = uri.split('/').pop() || '';
  const withoutQuery = lastSegment.split('?')[0];
  const dbName = withoutQuery.trim();
  return dbName || 'morpankh_saree';
}

export async function getMongoClient(uri: string) {
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 5_000,
  });
}
