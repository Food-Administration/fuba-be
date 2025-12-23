"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restaurant_controller_1 = __importDefault(require("./restaurant.controller"));
const jwtAuth_1 = __importDefault(require("../../middleware/jwtAuth"));
const router = (0, express_1.Router)();
// Create a restaurant
router.post("/", jwtAuth_1.default, restaurant_controller_1.default.create);
// Get all restaurants (with optional search and pagination)
router.get("/", jwtAuth_1.default, restaurant_controller_1.default.get);
// Get restaurants with active promotions
router.get("/promos/active", jwtAuth_1.default, restaurant_controller_1.default.getWithPromos);
// Get restaurants by mode (delivery, pickup, both)
router.get("/mode/:mode", jwtAuth_1.default, restaurant_controller_1.default.getByMode);
// Get restaurants by state
router.get("/state/:state", jwtAuth_1.default, restaurant_controller_1.default.getByState);
// Get a restaurant by ID
router.get("/:id", jwtAuth_1.default, restaurant_controller_1.default.getById);
// Update a restaurant by ID
router.put("/:id", jwtAuth_1.default, restaurant_controller_1.default.update);
// Update restaurant rating
router.patch("/:id/rating", jwtAuth_1.default, restaurant_controller_1.default.updateRating);
// Add item to restaurant
router.post("/items/add", jwtAuth_1.default, restaurant_controller_1.default.addItem);
// Remove item from restaurant
router.post("/items/remove", jwtAuth_1.default, restaurant_controller_1.default.removeItem);
// Delete a restaurant by ID
router.delete("/:id", jwtAuth_1.default, restaurant_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=restaurant.route.js.map