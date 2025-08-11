import { WorkOS } from "@workos-inc/node";
import { config } from "../config/env";
import { UnauthorizedError } from "../utils/errors";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const workos = new WorkOS(config.workos.apiKey);

// Initialize JWKS client with proper caching and rate limiting
const jwks = jwksClient({
	jwksUri: `https://api.workos.com/sso/jwks/${config.workos.clientId}`,
	cache: true,
	cacheMaxAge: 12 * 60 * 60 * 1000, // 12 hours
	rateLimit: true,
	jwksRequestsPerMinute: 5,
});

export interface WorkOSUser {
	sub: string; // WorkOS user ID
	email: string;
	firstName?: string;
	lastName?: string;
	emailVerified: boolean;
	orgId?: string;
	role?: string;
	permissions?: string[];
}

interface WorkOSTokenPayload {
	iss: string;
	sub: string; // user ID like 'user_01JXM8GJ6NRDEFVMMZE5VBGFDM'
	sid: string; // session ID
	jti: string; // JWT ID
	org_id?: string; // organization ID
	role?: string;
	permissions?: string[];
	email?: string;
	first_name?: string;
	last_name?: string;
	email_verified?: boolean;
	exp: number;
	iat: number;
}

export class WorkOSService {
	/**
	 * Get signing key for JWT verification
	 * @private
	 * @param kid - Key ID from JWT header
	 * @returns The signing key
	 */
	private static async getSigningKey(kid?: string): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!kid) {
				reject(new Error("Missing key ID"));
				return;
			}

			jwks.getSigningKey(kid, (err: Error | null, key: jwksClient.SigningKey | undefined) => {
				if (err) {
					reject(err);
				} else if (!key) {
					reject(new Error("No signing key found"));
				} else {
					const signingKey = key.getPublicKey();
					resolve(signingKey);
				}
			});
		});
	}

	/**
	 * Verify and decode a WorkOS JWT token
	 * @param token - The JWT token from the Authorization header
	 * @returns The decoded user information
	 */
	static async verifyToken(token: string): Promise<WorkOSUser> {
		if (!token) {
			throw new UnauthorizedError("No token provided");
		}

		try {
			// Decode the token to get the header (for key ID)
			const decoded = jwt.decode(token, { complete: true });

			if (!decoded || typeof decoded === "string" || !decoded.header || !decoded.header.kid) {
				console.warn("Invalid token format: missing key ID");
				throw new UnauthorizedError("Invalid token format");
			}

			// Get the signing key from JWKS
			const signingKey = await this.getSigningKey(decoded.header.kid);

			// Verify the token with proper options
			const tokenPayload = await new Promise<WorkOSTokenPayload>((resolve, reject) => {
				jwt.verify(
					token,
					signingKey,
					{
						algorithms: ["RS256"],
						// The issuer format from the reference: https://api.workos.com/user_management/client_[CLIENT_ID]
						issuer: `https://api.workos.com/user_management/${config.workos.clientId}`,
					},
					(err, payload) => {
						if (err || !payload || typeof payload === "string") {
							console.warn("Token verification failed:", err?.message);
							reject(new UnauthorizedError("Invalid or expired token"));
							return;
						}

						const verified = payload as WorkOSTokenPayload;

						// Log the payload structure for debugging
						console.log("Verified token payload:", {
							sub: verified.sub,
							org_id: verified.org_id,
							role: verified.role,
							exp: new Date(verified.exp * 1000).toISOString(),
						});

						resolve(verified);
					},
				);
			});

			// Fetch full user details from WorkOS API since the token has minimal data
			try {
				const workosUser = await this.getUser(tokenPayload.sub);

				if (!workosUser) {
					throw new UnauthorizedError("User not found");
				}

				console.log("Fetched WorkOS user:", {
					id: workosUser.id,
					email: workosUser.email,
					firstName: workosUser.firstName,
					lastName: workosUser.lastName,
				});

				// Return the full user information
				return {
					sub: workosUser.id,
					email: workosUser.email,
					firstName: workosUser.firstName || undefined,
					lastName: workosUser.lastName || undefined,
					emailVerified: workosUser.emailVerified || false,
					orgId: tokenPayload.org_id,
					role: tokenPayload.role,
					permissions: tokenPayload.permissions,
				};
			} catch (userFetchError) {
				console.error("Failed to fetch user details:", userFetchError);
				// If we can't fetch user details but token is valid, return minimal info
				// This prevents blocking users if WorkOS API is temporarily unavailable
				throw new UnauthorizedError("Failed to fetch user details");
			}
		} catch (error) {
			if (error instanceof UnauthorizedError) {
				throw error;
			}
			console.error("WorkOS token verification failed:", error);
			throw new UnauthorizedError("Token verification failed");
		}
	}

	/**
	 * Use WorkOS User Management API to get user by ID
	 * @param userId - The WorkOS user ID
	 * @returns The user profile
	 */
	static async getUser(userId: string) {
		try {
			const user = await workos.userManagement.getUser(userId);
			return user;
		} catch (error) {
			console.error("Failed to fetch WorkOS user:", error);
			throw new UnauthorizedError("Failed to fetch user information");
		}
	}
}
