const request = require("supertest");
const { app, server } = require("../server"); // Ensure server.js exports app
const mongoose = require("mongoose");
const Policy = require("../models/Policy");
const User = require("../models/User");

let adminToken, userToken, policyId, policyToDelete;

const bcrypt = require("bcrypt");



describe("Policy Routes", () => {
    beforeAll(async () => {
        // Clear database before running tests
        await User.deleteMany({});
        await Policy.deleteMany({});

        // Hash passwords
        const hashedPassword = await bcrypt.hash("Admin@1234", 10);
        const hashedUserPassword = await bcrypt.hash("User@1234", 10);

        // Create a test admin user
        const admin = await User.create({
            username: "adminuser",
            email: "admin@example.com",
            password_hash: hashedPassword,
            role: "admin"
        });

        // Create a test policyholder user
        const user = await User.create({
            username: "testuser",
            email: "user@example.com",
            password_hash: hashedUserPassword,
            role: "user",
            purchased_policies: []
        });

        // Login as admin to get token
        const adminLogin = await request(app).post("/users/login").send({
            email: "admin@example.com",
            password: "Admin@1234"
        });
        adminToken = adminLogin.body.token;

        // Login as policyholder to get token
        const userLogin = await request(app).post("/users/login").send({
            email: "user@example.com",
            password: "User@1234"
        });
        userToken = userLogin.body.token;

        // Create a test policy for deletion
        policyToDelete = await Policy.create({
            name: "Temporary Policy",
            description: "This is a policy for testing",
            premium_amount: 500,
            policy_end_date: "2025-06-30",
            users: []
        });

        // Create a policy to buy
        const newPolicy = await Policy.create({
            name: "Health Insurance",
            description: "Covers all your diseases.",
            premium_amount: 5000,
            policy_end_date: "2026-12-31",
            users: []
        });

        policyId = newPolicy._id;
    });
    
    
    afterAll(async () => {
        await User.deleteMany({});
        await Policy.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });
    test("Should get all policies", async () => {
        const res = await request(app).get("/policies");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Should create a new policy (Admin only)", async () => {
        const res = await request(app)
            .post("/policies")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Health Insurance",
                description: "Covers all your diseases.",
                premium_amount: 5000,
                policy_end_date: "2026-12-31",
                users: []
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.name).toBe("Health Insurance");
        policyId = res.body._id;
    });

    test("Should not allow non-admins to create a policy", async () => {
        const res = await request(app)
            .post("/policies")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                name: "Car Insurance",
                premium_amount: 300,
                policy_end_date: "2025-12-31"
            });

        expect(res.statusCode).toBe(403); // Forbidden
    });

    test("Should allow user to buy a policy", async () => {
        const res = await request(app)
            .post(`/policies/buy/${policyId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Policy purchased successfully");
    });

    test("Should prevent buying the same policy twice", async () => {
        const res = await request(app)
            .post(`/policies/buy/${policyId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Policy already purchased");
    });

    test("Should delete a policy (Admin only)", async () => {
        const res = await request(app)
            .delete(`/policies/${policyToDelete._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Policy deleted successfully");
    });

    test("Should prevent deleting a policy that doesn't exist", async () => {
        const nonExistentPolicyId = new mongoose.Types.ObjectId(); // Generate a fake ID

        const res = await request(app)
            .delete(`/policies/${nonExistentPolicyId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Policy not found");
    });
});

