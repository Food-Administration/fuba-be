import { Router } from "express";
import RestaurantController from "./restaurant.controller";
import jwtAuth from '../../middleware/jwtAuth';

const router = Router();

// Create a restaurant
router.post("/", jwtAuth, RestaurantController.create);

// Get all restaurants (with optional search and pagination)
router.get("/", jwtAuth, RestaurantController.get);

// Get restaurants with active promotions
router.get("/promos/active", jwtAuth, RestaurantController.getWithPromos);

// Get restaurants by mode (delivery, pickup, both)
router.get("/mode/:mode", jwtAuth, RestaurantController.getByMode);

// Get restaurants by state
router.get("/state/:state", jwtAuth, RestaurantController.getByState);

// Get a restaurant by ID
router.get("/:id", jwtAuth, RestaurantController.getById);

// Update a restaurant by ID
router.put("/:id", jwtAuth, RestaurantController.update);

// Update restaurant rating
router.patch("/:id/rating", jwtAuth, RestaurantController.updateRating);

// Add item to restaurant
router.post("/items/add", jwtAuth, RestaurantController.addItem);

// Remove item from restaurant
router.post("/items/remove", jwtAuth, RestaurantController.removeItem);

// Delete a restaurant by ID
router.delete("/:id", jwtAuth, RestaurantController.delete);

//user mark favorite restaurant
router.post("/:id/favorite", jwtAuth, RestaurantController.toggleFavorite);

export default router;
