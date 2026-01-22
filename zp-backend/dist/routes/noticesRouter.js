"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noticeController_1 = require("../controllers/noticeController");
const noticeRouter = (0, express_1.default)();
noticeRouter.post("/addNotice", noticeController_1.uploadNotice);
noticeRouter.get("/notices", noticeController_1.getNotices);
exports.default = noticeRouter;
