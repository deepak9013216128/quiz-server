import mongoose, { Schema, ObjectId, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
	name: string;
	password: string;
	email: string;
	role: string;
	status: string;
}

interface IUserDocument extends IUser, Document {
	matchPassword: (password: string) => Promise<Boolean>;
}

const userSchema: Schema<IUserDocument> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			index: true,
			trim: true,
		},
		password: { type: String, required: true, select: false },
		role: {
			type: String,
			required: true,
			default: "student",
			enum: {
				values: ["student", "instructor", "admin"],
				message: "{VALUE} is not supported",
			},
		},
		status: {
			type: String,
			required: true,
			default: "invited",
			enum: {
				values: ["invited", "active", "blocked"],
				message: "{VALUE} is not supported",
			},
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);

export default User;
