const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, required: true, maxLength: 100 },
    username: { type: String, required: true, maxLength: 100 },
    password: { type: String, required: true },
    membership_status: {
        type: String,
        required: true,
        enum: ["Not a member", "Member"],
        default: "Not a member",
    },
    is_admin: { type: Boolean, required: true }
});

// Virtual for user's full name
UserSchema.virtual("name").get(function () {
    return `${this.first_name} ${this.last_name}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
