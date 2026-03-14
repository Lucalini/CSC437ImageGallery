import { ObjectId } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(collectionName);
    }

    async getAllImages() {
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        const pipeline = [];

        pipeline.push({
            $lookup: {
                from: usersCollectionName,
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        });

        pipeline.push({
            $unwind: "$author"
        });

        return this.collection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        const pipeline = [];

        pipeline.push({
            $match: { _id: new ObjectId(imageId) }
        });

        pipeline.push({
            $lookup: {
                from: usersCollectionName,
                localField: "author",
                foreignField: "_id",
                as: "author"
            }
        });

        pipeline.push({
            $unwind: "$author"
        });

        const results = await this.collection.aggregate(pipeline).toArray();
        return results.length > 0 ? results[0] : null;
    }

    async updateImageName(imageId, newName) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }

    async createImage(src, name, authorUsername) {
        const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
        const usersCollection = this.mongoClient.db().collection(usersCollectionName);
        const user = await usersCollection.findOne({ username: authorUsername });

        const result = await this.collection.insertOne({
            src,
            name,
            author: user._id
        });
        return result.insertedId;
    }
}
