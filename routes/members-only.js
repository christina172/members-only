const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Message = require("../models/message");

const asyncHandler = require("express-async-handler");

router.get("/", asyncHandler(async (req, res, next) => {
    res.render("index", { title: "Home" });
}));

router.get("/sign-up", (async (req, res, next) => {
    res.render("sign_up_form", { title: "Sign Up" });
}));

router.post("/sign-up", [
    // Validate and sanitize fields.
    body("first_name", "First name must be specified.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("last_name", "Last name must be specified.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Username must be specified.")
        .custom(async (value) => {
            const existingUser = await User.find({ username: value }).exec();
            if (existingUser.length) {
                throw new Error("The provided username is already in use. Please, choose another username.");
            } else {
                return true;
            }
        }),
    body("password", "Password must be at least 8 characters long.")
        .trim()
        .isLength({ min: 8 })
        .escape(),
    body('confirm_password').custom((value, { req }) => {
        console.log(req.body);
        if (value !== req.body.password) {
            throw new Error('Confirmation password does not match your password.');
        } else {
            return true;
        }
    }),

    // Process request after validation and sanitization.
    (async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log(errors);

        // Create User object with escaped and trimmed data and hash the password
        bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) {
                return next(err)
            }
            const user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                password: hashedPassword,
                membership_status: "Not a member",
                is_admin: false
            });
            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/errors messages.
                res.render("sign_up_form", {
                    title: "Sign Up",
                    user: user,
                    errors: errors.array(),
                });
                return;
            } else {
                // Data from form is valid.

                // Save user.
                await user.save();
                // Redirect to the login form record.
                res.redirect("/");
            }
        })
    })
]);

router.get("/log-in", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Login form GET");
}));

router.post("/log-in", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Login form POST");
}));

router.get("/become-a-member", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Become a member form GET");
}));

router.post("/become-a-member", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Become a member form POST");
}));

router.get("/become-admin", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Become admin form GET");
}));

router.post("/become-admin", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Become admin form POST");
}));

module.exports = router;