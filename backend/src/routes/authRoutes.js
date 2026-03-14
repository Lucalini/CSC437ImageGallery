import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        const payload = { username };
        jwt.sign(
            payload,
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token);
            }
        );
    });
}

export function registerAuthRoutes(app, credentialsProvider) {
    // Account creation: POST /api/users
    app.post("/api/users", async (req, res) => {
        const { username, email, password } = req.body || {};

        if (!username || !email || !password) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username, email, or password"
            });
        }

        try {
            const created = await credentialsProvider.registerUser(username, email, password);
            if (!created) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
            }
            const token = await generateAuthToken(username);
            res.status(201).json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create user" });
        }
    });

    // Login: POST /api/auth/tokens
    app.post("/api/auth/tokens", async (req, res) => {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
        }

        try {
            const valid = await credentialsProvider.verifyPassword(username, password);
            if (!valid) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
            }
            const token = await generateAuthToken(username);
            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Login failed" });
        }
    });
}
