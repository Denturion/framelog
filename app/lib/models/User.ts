import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface IMovie {
	_id?: Types.ObjectId;
	movie_id: string;
	title: string;
	year?: string;
	poster_url?: string;
	date_added: Date;
	rating?: number | null;
	note?: string;
}

export interface IUser extends Document {
	_id: Types.ObjectId;
	username: string;
	email: string;
	password_hash: string;
	created_at: Date;
	movies: IMovie[];
	users_followed: Types.ObjectId[];
	followers: Types.ObjectId[];
}

const movieSchema = new Schema<IMovie>({
	movie_id: String,
	title: String,
	year: String,
	poster_url: String,
	date_added: {
		type: Date,
		default: Date.now,
	},
	rating: Number,
	note: String,
});

const userSchema = new Schema<IUser>({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
	},
	password_hash: {
		type: String,
		required: true,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	movies: [movieSchema],
	users_followed: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	followers: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

export const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', userSchema);
