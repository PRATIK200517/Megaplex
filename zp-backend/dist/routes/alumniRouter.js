"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alumniController_1 = require("../controllers/alumniController");
const alumniRouter = (0, express_1.Router)();
alumniRouter.post("/Addalumni", alumniController_1.uploadAlumni);
alumniRouter.get("/alumni", alumniController_1.getAlumni);
exports.default = alumniRouter;
