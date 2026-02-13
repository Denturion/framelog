import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
	throw new Error('Please define the MONGO_URI environment variable');
}

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

declare global {
	var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
	conn: null,
	promise: null,
};

if (!global.mongooseCache) {
	global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
			console.log('MongoDB connected');
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}
