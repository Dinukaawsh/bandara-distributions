import { MongoClient, MongoServerError } from 'mongodb';

const uri = process.env.MONGO_URL?.trim();

if (!uri) {
  throw new Error('MONGO_URL is not defined in environment variables.');
}

function normalizeMongoUri(connectionString: string) {
  // Atlas hostnames only resolve via SRV records, not plain mongodb:// on port 27017.
  if (
    connectionString.startsWith('mongodb://') &&
    connectionString.includes('.mongodb.net')
  ) {
    return connectionString.replace('mongodb://', 'mongodb+srv://').replace(':27017', '');
  }
  return connectionString;
}

const normalizedUri = normalizeMongoUri(uri);

let cachedClient: MongoClient | null = null;

export function getMongoConnectionHelp(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('ENOTFOUND') || message.includes('querySrv')) {
    return 'Cannot reach MongoDB. For Atlas, use mongodb+srv:// in MONGO_URL (copy the string from MongoDB Atlas → Connect).';
  }

  if (message.includes('bad auth') || message.includes('Authentication failed')) {
    return 'MongoDB login failed. Check your database username and password in MONGO_URL.';
  }

  return 'Unable to connect to MongoDB. Check MONGO_URL and your internet connection.';
}

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(normalizedUri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
  } catch (error) {
    if (error instanceof MongoServerError) {
      throw new Error(getMongoConnectionHelp(error));
    }
    throw new Error(getMongoConnectionHelp(error));
  }

  cachedClient = client;
  return client;
}
