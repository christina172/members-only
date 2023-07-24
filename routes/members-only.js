const express = require("express");
const router = express.Router();

const asyncHandler = require("express-async-handler");

router.get("/", asyncHandler(async (req, res, next) => {
    res.render("index", { title: "Home" });
    // res.send("NOT IMPLEMENTED: Site Home Page");
}));

router.get("/sign-up", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Sign-up form GET");
}));

router.post("/sign-up", (async (req, res, next) => {
    res.send("NOT IMPLEMENTED: Sign-up form POST");
}));

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