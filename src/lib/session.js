
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;

const secret = new TextEncoder().encode(secretKey);

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
