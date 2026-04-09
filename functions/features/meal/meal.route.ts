import { Router } from "express";
import MealController from "./meal.controller";
import { uploadImage } from "../../middleware/upload";
import jwtAuth from "../../middleware/jwtAuth";

const router = Router();

// Create a meal (vendor only, with optional image)
router.post("/", jwtAuth, uploadImage.single("image"), MealController.create);

// Get all meals (public, with filters)
router.get("/", MealController.get);

// Get current vendor's meals
router.get("/my-meals", jwtAuth, MealController.getMyMeals);

// Get meals by vendor ID
router.get("/vendor/:vendorId", MealController.getByVendor);

// Get a meal by ID
router.get("/:id", MealController.getById);

// Update a meal (owner only)
router.put("/:id", jwtAuth, MealController.update);

// Update meal image (owner only)
router.patch("/:id/image", jwtAuth, uploadImage.single("image"), MealController.updateImage);

// Toggle meal stock status (owner only)
router.patch("/:id/stock", jwtAuth, MealController.toggleStock);

// Delete a meal (owner only)
router.delete("/:id", jwtAuth, MealController.deleteMeal);

export default router;
