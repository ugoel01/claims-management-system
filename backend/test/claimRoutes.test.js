const request = require("supertest");
const { app, server } = require("../server");
const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const User = require("../models/User");
const bcrypt = require("bcrypt");

let adminToken, userToken, claimId, policyId;

describe("Claim Routes", () => {
    beforeAll(async () => {
        await User.deleteMany({});
        await Policy.deleteMany({});
        await Claim.deleteMany({});

        const hashedAdminPassword = await bcrypt.hash("Admin@1234", 10);
        const hashedUserPassword = await bcrypt.hash("User@1234", 10);

        const admin = await User.create({
            username: "adminuser",
            email: "admin@example.com",
            password_hash: hashedAdminPassword,
            role: "admin"
        });

        const user = await User.create({
            username: "testuser",
            email: "user@example.com",
            password_hash: hashedUserPassword,
            role: "user"
        });

        const adminLogin = await request(app).post("/users/login").send({
            email: "admin@example.com",
            password: "Admin@1234"
        });
        adminToken = adminLogin.body.token;

        const userLogin = await request(app).post("/users/login").send({
            email: "user@example.com",
            password: "User@1234"
        });
        userToken = userLogin.body.token;

        const policy = await Policy.create({
            name: "Health Insurance",
            description: "Covers all your diseases.",
            premium_amount: 5000,
            policy_end_date: "2026-12-31"
        });
        policyId = policy._id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Policy.deleteMany({});
        await Claim.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });

    test("Should create a new claim", async () => {
        const res = await request(app)
            .post("/claims")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                policy_id: policyId,
                claim_date: "2025-06-15",
                amount: 2000,
                description: "Medical expenses"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("_id");
        claimId = res.body._id;
    });

    test("Should not allow claim exceeding policy premium", async () => {
        const res = await request(app)
            .post("/claims")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                policy_id: policyId,
                claim_date: "2025-06-15",
                amount: 6000,
                description: "Over limit claim"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Claim amount exceeds policy coverage or is invalid");
    });

    test("Should get all claims (Admin only)", async () => {
        const res = await request(app)
            .get("/claims")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("Should get claims for logged-in user", async () => {
        const res = await request(app)
            .get("/claims/userClaims")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("Should update claim status (Admin only)", async () => {
        const res = await request(app)
            .put(`/claims/${claimId}/status`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "approved" });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("approved");
    });

    test("Should not allow non-admin to update claim status", async () => {
        const res = await request(app)
            .put(`/claims/${claimId}/status`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ status: "approved" });

        expect(res.statusCode).toBe(403);
    });

    test("Should prevent updating claim with invalid status", async () => {
        const res = await request(app)
            .put(`/claims/${claimId}/status`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "invalid_status" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid status");
    });
});
