import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        this.credsCollection = this.mongoClient.db().collection(credsCollectionName);
        this.usersCollection = this.mongoClient.db().collection(usersCollectionName);
    }

    async registerUser(username, email, password) {
        const existing = await this.credsCollection.findOne({ username });
        if (existing) {
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.credsCollection.insertOne({
            username,
            password: hashedPassword
        });

        await this.usersCollection.insertOne({
            username,
            email
        });

        return true;
    }

    async verifyPassword(username, password) {
        const userCreds = await this.credsCollection.findOne({ username });
        if (!userCreds) {
            return false;
        }
        return bcrypt.compare(password, userCreds.password);
    }
}
