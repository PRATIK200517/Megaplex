"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddlewears_1 = require("../middlewears/authMiddlewears");
const adminRouter = (0, express_1.Router)();
adminRouter.get("/", () => {
    console.log("hello from admin");
});
//Admin auth
adminRouter.post("/login", adminController_1.loginAdmin);
adminRouter.post("/register", adminController_1.registerAdmin);
adminRouter.post("/logout", authMiddlewears_1.protect, adminController_1.logoutAdmin);
adminRouter.post("/delete", authMiddlewears_1.protect, adminController_1.deleteAdmin);
exports.default = adminRouter;
