const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Message = require("../models/message");

const asyncHandler = require("express-async-handler");

router.get("/", asyncHandler(async (req, res, next) => {
    res.render("index", { title: "Home", user: req.user });
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
                // Redirect to the home page.
                res.redirect("/members-only");
            }
        })
    })
]);

router.get("/log-in", (async (req, res, next) => {
    res.render("login_form", { title: "Log In" });
}));

router.post("/log-in",
    passport.authenticate("local", {
        successRedirect: "/members-only",
        failureRedirect: "/members-only/log-in",
        failureFlash: true
    })
);

router.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/members-only");
    });
});

router.get("/become-a-member", (async (req, res, next) => {
    res.render("become_a_member", { title: "Become a Member", user: req.user });
}));

router.post("/become-a-member", [
    // Validate and sanitize fields.
    body("answer", "Answer must be specified.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request after validation and sanitization.
    (async (req, res, next) => {

        const user = req.user;

        // Check the answer.
        if (req.body.answer === process.env.MEMBER_PASSWORD) {
            user.membership_status = "Member";
            await user.save();
            // Redirect to the home page.
            res.redirect("/members-only");
        } else {
            res.render("become_a_member", {
                title: "Become a Member",
                message: "Your answer is incorrect. Try again.",
            });
            return;
        }
    })
]);

router.get("/become-admin", (async (req, res, next) => {
    res.render("become_admin", { title: "Become Admin", user: req.user });
}));

router.post("/become-admin", [
    // Validate and sanitize fields.
    body("answer", "Answer must be specified.")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request after validation and sanitization.
    (async (req, res, next) => {

        const user = req.user;

        // Check the answer.
        if (req.body.answer === process.env.ADMIN_PASSWORD) {
            user.is_admin = true;
            await user.save();
            // Redirect to the home page.
            res.redirect("/members-only");
        } else {
            res.render("become_admin", {
                title: "Become Admin",
                message: "Your answer is incorrect. Try again.",
            });
            return;
        }
    })
]);

module.exports = router;