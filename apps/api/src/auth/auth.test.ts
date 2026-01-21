import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
    describe("POST /api/v1/auth/register", () => {
        it("should register a new user and return 201", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "test@example.com",
                    password: "Password123!",
                    name: "Test User",
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data.id");
            expect(response.body).toHaveProperty("data.email", "test@example.com");
        });

        it("should return 400 if email is missing", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    password: "Password123!",
                    name: "Test User",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error");
        });

        it("should return 400 if password is missing", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "test@example.com",
                    name: "Test User",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login with valid credentials and return token", async () => {
            // First register a user
            await request(app)
                .post("/api/v1/auth/register")
                .send({
                    email: "login@example.com",
                    password: "Password123!",
                    name: "Login User",
                });

            // Then login
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "login@example.com",
                    password: "Password123!",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data.token");
        });

        it("should return 401 for invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "wrongpassword",
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("success", false);
        });
    });
});
