import { Router } from "express";
import RestaurantController from "./restaurant.controller";

const router = Router();

// Create a restaurant
router.post("/", RestaurantController.create);

// Get all restaurants (with optional search and pagination)
router.get("/", RestaurantController.get);

// Get restaurants with active promotions
router.get("/promos/active", RestaurantController.getWithPromos);

// Get restaurants by mode (delivery, pickup, both)
router.get("/mode/:mode", RestaurantController.getByMode);

// Get restaurants by state
router.get("/state/:state", RestaurantController.getByState);

// Get a restaurant by ID
router.get("/:id", RestaurantController.getById);

// Update a restaurant by ID
router.put("/:id", RestaurantController.update);

// Update restaurant rating
router.patch("/:id/rating", RestaurantController.updateRating);

// Add item to restaurant
router.post("/items/add", RestaurantController.addItem);

// Remove item from restaurant
router.post("/items/remove", RestaurantController.removeItem);

// Delete a restaurant by ID
router.delete("/:id", RestaurantController.delete);

export default router;
