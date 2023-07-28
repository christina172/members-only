const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const format = require("date-fns/format");

const User = require("../models/user");
const Message = require("../models/message");

const asyncHandler = require("express-async-handler");

router.get("/", asyncHandler(async (req, res, next) => {
    const allMessages = await Message.find()
        .populate("author")
        .sort({ timestamp: -1 })
        .exec();

    res.render("index", { title: "Home", user: req.user, messages: allMessages, format: format });
}));

router.get("/sign-up", checkNotAuthenticated, (async (req, res, next) => {
    res.render("sign_up_form", { title: "Sign Up" });
}));

router.post("/sign-up", [
    // Validate and sanitize fields.
    body("first_name").trim().escape(),
    body("last_name").trim().escape(),
    body("username")
        .trim()
        .escape()
        .custom(async (value) => {
            const existingUser = await User.find({ username: value }).exec();
            if (existingUser.length) {
                throw new Error("The provided username is already in use. Please, choose another username.");
            } else {
                return true;
            }
        }),
    body("password").trim().escape(),
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

        // Hash the password and create User object with escaped and trimmed data
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

router.get("/log-in", checkNotAuthenticated, (async (req, res, next) => {
    res.render("login_form", { title: "Log In" });
}));

router.post("/log-in",
    passport.authenticate("local", {
        successRedirect: "/members-only",
        failureRedirect: "/members-only/log-in",
        failureFlash: true
    })
);

router.get("/log-out", checkAuthenticated, (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/members-only");
    });
});

router.get("/become-a-member", checkAuthenticatedNotAMember, (async (req, res, next) => {
    res.render("become_a_member", { title: "Become a Member", user: req.user });
}));

router.post("/become-a-member", [
    body("answer").trim().escape(),

    // Process request after sanitization.
    (async (req, res, next) => {

        const user = req.user;

        // Check the answer.
        if (req.body.answer.toLowerCase() === "future") {
            user.membership_status = "Member";
            await user.save();
            // Redirect to the home page.
            res.redirect("/members-only");
        } else {
            res.render("become_a_member", {
                title: "Become a Member",
                user: user,
                message: "Your answer is incorrect. Try again.",
            });
            return;
        }
    })
]);

router.get("/become-admin", checkAuthenticatedNotAdmin, (async (req, res, next) => {
    res.render("become_admin", { title: "Become Admin", user: req.user });
}));

router.post("/become-admin", [
    body("answer").trim().escape(),

    // Process request after sanitization.
    (async (req, res, next) => {
        const user = req.user;

        // Check the answer.
        if (req.body.answer.toLowerCase === "envelope") {
            user.is_admin = true;
            await user.save();
            // Redirect to the home page.
            res.redirect("/members-only");
        } else {
            res.render("become_admin", {
                title: "Become Admin",
                user: user,
                message: "Your answer is incorrect. Try again.",
            });
            return;
        }
    })
]);

router.get("/write-a-message", checkAuthenticated, (async (req, res, next) => {
    res.render("message_form", { title: "Write a Message", user: req.user });
}));

router.post("/write-a-message", [
    // Validate and sanitize fields.
    body("title").trim().escape(),
    body("text").trim().escape(),

    // Process request after sanitization.
    (async (req, res, next) => {

        // Create Message object escaped and trimmed data
        const message = new Message({
            title: req.body.title,
            timestamp: Date.now(),
            text: req.body.text,
            author: req.user,
        });

        await message.save();
        res.redirect("/members-only");
    })
]);

router.post("/delete-message", (async (req, res, next) => {
    await Message.findByIdAndRemove(req.body.messageid);
    res.redirect("/members-only");
}))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/members-only");
};

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/members-only");
    }
    next();
};

function checkAuthenticatedNotAMember(req, res, next) {
    if (req.isAuthenticated() && req.user.membership_status == "Not a member") {
        return next();
    }
    res.redirect("/members-only");
};

function checkAuthenticatedNotAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.membership_status == "Member" && !req.user.is_admin) {
        return next();
    }
    res.redirect("/members-only");
};

module.exports = router;