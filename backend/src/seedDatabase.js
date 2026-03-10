import { ObjectId } from "mongodb";
import { connectMongo } from "./connectMongo.js";
import { getEnvVar } from "./getEnvVar.js";

const mongoClient = connectMongo();

const users = [
    { _id: new ObjectId("69a36b84607e5fe9961ae49c"), username: "chunkylover23", email: "alice@example.com" },
    { _id: new ObjectId("69a36b84607e5fe9961ae49d"), username: "silas_meow", email: "silas@example.com" },
    { _id: new ObjectId("69a36b84607e5fe9961ae49e"), username: "fluffycoat", email: "fluffy@example.com" }
];

const images = [
    {
        _id: new ObjectId("69a36b75607e5fe9961ae496"),
        src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Blue_merle_koolie_short_coat_heading_sheep.jpg",
        name: "Blue merle herding sheep",
        author: new ObjectId("69a36b84607e5fe9961ae49c")
    },
    {
        _id: new ObjectId("69a36b75607e5fe9961ae497"),
        src: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg",
        name: "Huskies",
        author: new ObjectId("69a36b84607e5fe9961ae49c")
    },
    {
        _id: new ObjectId("69a36b75607e5fe9961ae498"),
        src: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Taka_Shiba.jpg",
        name: "Shiba",
        author: new ObjectId("69a36b84607e5fe9961ae49c")
    },
    {
        _id: new ObjectId("69a36b75607e5fe9961ae499"),
        src: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg",
        name: "Tabby cat",
        author: new ObjectId("69a36b84607e5fe9961ae49d")
    },
    {
        _id: new ObjectId("69a36b75607e5fe9961ae49a"),
        src: "https://upload.wikimedia.org/wikipedia/commons/8/84/Male_and_female_chicken_sitting_together.jpg",
        name: "Chickens",
        author: new ObjectId("69a36b84607e5fe9961ae49e")
    }
];

async function seed() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db();

        const usersCollection = db.collection(getEnvVar("USERS_COLLECTION_NAME"));
        const imagesCollection = db.collection(getEnvVar("IMAGES_COLLECTION_NAME"));

        await usersCollection.deleteMany({});
        await imagesCollection.deleteMany({});

        await usersCollection.insertMany(users);
        console.log(`Inserted ${users.length} users`);

        await imagesCollection.insertMany(images);
        console.log(`Inserted ${images.length} images`);

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoClient.close();
    }
}

seed();
