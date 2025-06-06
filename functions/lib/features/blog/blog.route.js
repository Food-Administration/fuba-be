"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("./blog.controller")); // This file itself exports the controller
const router = (0, express_1.Router)();
// Create a blog
router.post('/', blog_controller_1.default.create);
// Get all blogs (with optional query)
router.get('/', blog_controller_1.default.get);
// Get a blog by ID
router.get('/:id', blog_controller_1.default.getById);
// Update a blog by ID
router.put('/:id', blog_controller_1.default.update);
// Delete a blog by ID
router.delete('/:id', blog_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=blog.route.js.map