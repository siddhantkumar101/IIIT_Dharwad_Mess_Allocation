const express = require("express");
const router = express.Router();
const { uploadMenu, getMenu } = require("../controllers/menu.controller");
const authMiddleware = require("../middleware/auth.middleware");
const allow = require("../middleware/role.middleware");
const { validateMenu } = require("../middleware/validate.middleware");

router.post("/", authMiddleware, allow("admin"), validateMenu, uploadMenu);
router.get("/", authMiddleware, getMenu);

module.exports = router;
