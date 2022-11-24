import jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
	return jwt.sign({ id }, process.env.JWT_SECRET as string, {
		expiresIn: "30d",
	});
};

export const generateInvitationToken = (
	name: string,
	email: string,
	role: string,
	status: string
) => {
	return jwt.sign(
		{ name, email, role, status },
		process.env.JWT_SECRET as string,
		{
			expiresIn: "1h",
		}
	);
};

export const verfiyToken = (token: string) => {
	const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
	if (!decoded) {
		return {
			isVerified: false,
		};
	}
	return {
		email: decoded.email,
		name: decoded.name,
		role: decoded.role,
		isVerified: true,
	};
};
