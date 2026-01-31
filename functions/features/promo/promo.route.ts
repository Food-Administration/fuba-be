import { Router } from "express";
import PromoController from "./promo.controller";
import { uploadImage } from "../../middleware/upload";
import jwtAuth from "../../middleware/jwtAuth";

const router = Router();

// Create promo (with optional image)
router.post("/", jwtAuth, uploadImage.single("image"), PromoController.create);

// Get all promos (with filters: category, type, restaurant)
router.get("/", PromoController.get);

// Get promos by restaurant
router.get("/restaurant/:restaurantId", PromoController.getByRestaurant);

// Get single promo by id
router.get("/:id", PromoController.getById);

// Update promo
router.put("/:id", jwtAuth, PromoController.update);

// Update promo image
router.patch(
  "/:id/image",
  jwtAuth,
  uploadImage.single("image"),
  PromoController.updateImage
);

// Delete promo
router.delete("/:id", jwtAuth, PromoController.delete);

export default router;
