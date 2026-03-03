import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword, generateResetToken, getResetTokenExpiry } from "../utils/password.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from "../utils/jwt.js";
import { JwtPayload, TokenPair, UserResponse } from "../types/index.js";

// =============================================================================
// Types
// =============================================================================

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: UserResponse;
  tokens: TokenPair;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatUserResponse(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// =============================================================================
// Auth Service
// =============================================================================

export const authService = {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, name, phone } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Store refresh token (hashed)
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(tokens.refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: formatUserResponse(user),
      tokens,
    };
  },

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error("Account is not active. Please contact support.");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Store refresh token (hashed)
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(tokens.refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: formatUserResponse(user),
      tokens,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error("Invalid or expired refresh token");
    }

    const tokenHash = hashRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error("Refresh token not found");
    }

    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error("Refresh token expired");
    }

    // Check user status
    if (storedToken.user.status !== UserStatus.ACTIVE) {
      throw new Error("Account is not active");
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new token pair
    const newPayload: JwtPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };
    const tokens = generateTokenPair(newPayload);

    // Store new refresh token (hashed)
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(tokens.refreshToken),
        userId: storedToken.user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return tokens;
  },

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
  },

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Do not reveal if email exists
      return "If the email exists, a reset link has been sent.";
    }

    // Generate reset token
    const token = generateResetToken();

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Store reset token
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: getResetTokenExpiry(),
      },
    });

    return "If the email exists, a reset link has been sent.";
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest) {
      throw new Error("Invalid or expired reset token");
    }

    if (resetRequest.used) {
      throw new Error("Reset token has already been used");
    }

    if (resetRequest.expiresAt < new Date()) {
      throw new Error("Reset token has expired");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      }),
      // Invalidate all refresh tokens for security
      prisma.refreshToken.deleteMany({
        where: { userId: resetRequest.userId },
      }),
    ]);
  },

  /**
   * Change password (requires current password)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await comparePassword(currentPassword, user.password);

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return formatUserResponse(user);
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; address?: string }
  ): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return formatUserResponse(user);
  },
};
