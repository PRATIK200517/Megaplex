"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const photoGalleryRoute_1 = __importDefault(require("./photoGalleryRoute"));
const adminRouter_1 = __importDefault(require("./adminRouter"));
const blogRouter_1 = __importDefault(require("./blogRouter"));
const alumniRouter_1 = __importDefault(require("./alumniRouter"));
const routes = express_1.default.Router();
routes.use("/gallery", photoGalleryRoute_1.default);
routes.use("/admin", adminRouter_1.default);
routes.use("/blogs", blogRouter_1.default);
routes.use("/", alumniRouter_1.default);
exports.default = routes;
