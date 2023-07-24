#! /usr/bin/env node

console.log(
    'This script populates some test users and messages to your database.'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const User = require("./models/user");
const Message = require("./models/message");

const users = [];
const messages = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createUsers();
    await createMessages();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
};

async function userCreate(index, first_name, last_name, username, password) {
    const user = new User({
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: password,
        membership_status: "Not a member",
        is_admin: false,
    });

    await user.save();
    users[index] = user;
    console.log(`Added user: ${first_name} ${last_name}`);
};

async function messageCreate(index, title, text, author) {
    const message = new Message({
        title: title,
        timestamp: Date.now(),
        text: text,
        author: author,
    });

    await message.save();
    messages[index] = message;
    console.log(`Added message: ${title}`);
};

async function createUsers() {
    console.log("Adding users");
    await Promise.all([
        userCreate(0, "Charlotte", "Thompson", "lottie85", "password"),
        userCreate(1, "William", "Lawrence", "will36", "123456789"),
    ]);
};

async function createMessages() {
    console.log("Adding messages");
    await Promise.all([
        messageCreate(0, "Hello everybody!", "Hello everybody! Welcome to our website. Here you can share your messages. Sign up to leave a message. Become a member to see who writes the messages.", users[0]),
        messageCreate(1, "Good morning!", "Good morning! Happy to see you all here. Become an admin to be able to delete messages.", users[1]),
        messageCreate(2, "Thank you!", "Thank you for using our app. Share your thoughts and ideas with the world!", users[0]),
    ]);
};