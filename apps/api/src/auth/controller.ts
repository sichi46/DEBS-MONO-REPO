import { Request, Response } from "express";

// In-memory user store (for TDD - will be replaced with real DB)
interface User {
    id: string;
    email: string;
    password: string;
    name: string;
}

const users: User[] = [];

class AuthController {
    register(req: Request, res: Response): void {
        const { email, password, name } = req.body;

        // Validation
        if (!email) {
            res.status(400).json({
                success: false,
                error: "Email is required",
            });
            return;
        }

        if (!password) {
            res.status(400).json({
                success: false,
                error: "Password is required",
            });
            return;
        }

        // Check if user exists
        const existingUser = users.find((u) => u.email === email);
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: "User already exists",
            });
            return;
        }

        // Create user
        const newUser: User = {
            id: Date.now().toString(),
            email,
            password, // In production, hash this!
            name: name || "",
        };

        users.push(newUser);

        res.status(201).json({
            success: true,
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });
    }

    login(req: Request, res: Response): void {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
            return;
        }

        // Find user
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) {
            res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
            return;
        }

        // Generate token (mock - in production use JWT)
        const token = `mock-token-${user.id}-${Date.now()}`;

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
        });
    }
}

export const authController = new AuthController();
