const request = require("supertest");
const mongoose = require("mongoose");
const { app, server } = require("../server");
const User = require("../models/User");

describe("User Routes", () => {
    let token;
    let userId;

    beforeAll(async () => {
        const res = await request(app).post("/users").send({
            username: "testuser",
            email: "testuser@example.com",
            password: "Test@1234",
            role: "user"
        });
        token = res.body.token;
        userId = res.body.user.id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });

    test("Should register a new user", async () => {
        const res = await request(app).post("/users").send({
            username: "newuser",
            email: "newuser@example.com",
            password: "Test@1234",
            role: "admin"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("email", "newuser@example.com");
    });

    test("Should not register a user with existing email", async () => {
        const res = await request(app).post("/users").send({
            username: "testuser",
            email: "testuser@example.com",
            password: "Test@1234",
            role: "user"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Email already in use");
    });

    test("Should login a user", async () => {
        const res = await request(app).post("/users/login").send({
            email: "testuser@example.com",
            password: "Test@1234"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    test("Should not login with incorrect password", async () => {
        const res = await request(app).post("/users/login").send({
            email: "testuser@example.com",
            password: "wrongpassword"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "Invalid email or password");
    });
});
