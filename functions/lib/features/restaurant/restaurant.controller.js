"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantController = void 0;
const restaurant_service_1 = __importDefault(require("./restaurant.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class RestaurantController {
    constructor() {
        /**
         * Creates a new restaurant.
         */
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const restaurant = await restaurant_service_1.default.create(req.body);
            res.status(201).json({ success: true, data: restaurant });
        });
        /**
         * Retrieves all restaurants with optional filters and pagination.
         */
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const { offset = "0", limit = "10", search } = req.query;
            // Parse query parameters
            const numericOffset = parseInt(offset, 10) || 0;
            const numericLimit = parseInt(limit, 10) || 10;
            // Initialize filter object
            const filter = {};
            // Add search condition if search is a valid, non-empty string
            if (typeof search === "string" && search.trim().length > 0) {
                const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                filter.name = { $regex: escapedSearch, $options: "i" };
            }
            const { restaurants, total } = await restaurant_service_1.default.get(filter, {
                offset: numericOffset,
                limit: numericLimit,
            });
            res.status(200).json({
                success: true,
                data: restaurants,
                meta: { total, offset: numericOffset, limit: numericLimit },
            });
        });
        /**
         * Retrieves a restaurant by its ID.
         */
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const restaurant = await restaurant_service_1.default.getById(req.params.id);
            if (!restaurant) {
                res
                    .status(404)
                    .json({ success: false, error: "Restaurant not found" });
                return;
            }
            res.status(200).json({ success: true, data: restaurant });
        });
        /**
         * Retrieves restaurants by mode (delivery, pickup, or both).
         */
        this.getByMode = (0, asyncHandler_1.default)(async (req, res) => {
            const { mode } = req.params;
            const { offset = "0", limit = "10" } = req.query;
            const numericOffset = parseInt(offset, 10) || 0;
            const numericLimit = parseInt(limit, 10) || 10;
            if (!["delivery", "pickup", "both"].includes(mode)) {
                res.status(400).json({
                    success: false,
                    error: "Mode must be 'delivery', 'pickup', or 'both'",
                });
                return;
            }
            const { restaurants, total } = await restaurant_service_1.default.getByMode(mode, {
                offset: numericOffset,
                limit: numericLimit,
            });
            res.status(200).json({
                success: true,
                data: restaurants,
                meta: { total, offset: numericOffset, limit: numericLimit },
            });
        });
        /**
         * Retrieves restaurants by state.
         */
        this.getByState = (0, asyncHandler_1.default)(async (req, res) => {
            const { state } = req.params;
            const { offset = "0", limit = "10" } = req.query;
            const numericOffset = parseInt(offset, 10) || 0;
            const numericLimit = parseInt(limit, 10) || 10;
            const { restaurants, total } = await restaurant_service_1.default.getByState(state, {
                offset: numericOffset,
                limit: numericLimit,
            });
            res.status(200).json({
                success: true,
                data: restaurants,
                meta: { total, offset: numericOffset, limit: numericLimit },
            });
        });
        /**
         * Retrieves restaurants with active promotions.
         */
        this.getWithPromos = (0, asyncHandler_1.default)(async (req, res) => {
            const { offset = "0", limit = "10" } = req.query;
            const numericOffset = parseInt(offset, 10) || 0;
            const numericLimit = parseInt(limit, 10) || 10;
            const { restaurants, total } = await restaurant_service_1.default.getWithPromos({
                offset: numericOffset,
                limit: numericLimit,
            });
            res.status(200).json({
                success: true,
                data: restaurants,
                meta: { total, offset: numericOffset, limit: numericLimit },
            });
        });
        /**
         * Updates a restaurant by its ID.
         */
        this.update = (0, asyncHandler_1.default)(async (req, res) => {
            const restaurant = await restaurant_service_1.default.update(req.params.id, req.body);
            if (!restaurant) {
                res
                    .status(404)
                    .json({ success: false, error: "Restaurant not found" });
                return;
            }
            res.status(200).json({ success: true, data: restaurant });
        });
        /**
         * Deletes a restaurant by its ID.
         */
        this.delete = (0, asyncHandler_1.default)(async (req, res) => {
            const restaurant = await restaurant_service_1.default.delete(req.params.id);
            if (!restaurant) {
                res
                    .status(404)
                    .json({ success: false, error: "Restaurant not found" });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Restaurant deleted successfully",
            });
        });
        /**
         * Adds a food item to a restaurant.
         */
        this.addItem = (0, asyncHandler_1.default)(async (req, res) => {
            const { restaurantId, itemId } = req.body;
            if (!restaurantId || !itemId) {
                res.status(400).json({
                    success: false,
                    error: "restaurantId and itemId are required",
                });
                return;
            }
            const restaurant = await restaurant_service_1.default.addItem(restaurantId, itemId);
            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    error: "Restaurant or item not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: restaurant,
                message: "Item added to restaurant",
            });
        });
        /**
         * Removes a food item from a restaurant.
         */
        this.removeItem = (0, asyncHandler_1.default)(async (req, res) => {
            const { restaurantId, itemId } = req.body;
            if (!restaurantId || !itemId) {
                res.status(400).json({
                    success: false,
                    error: "restaurantId and itemId are required",
                });
                return;
            }
            const restaurant = await restaurant_service_1.default.removeItem(restaurantId, itemId);
            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    error: "Restaurant or item not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: restaurant,
                message: "Item removed from restaurant",
            });
        });
        /**
         * Updates the rating of a restaurant.
         */
        this.updateRating = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const { rating } = req.body;
            if (rating === undefined) {
                res.status(400).json({
                    success: false,
                    error: "Rating is required",
                });
                return;
            }
            if (rating < 0 || rating > 5) {
                res.status(400).json({
                    success: false,
                    error: "Rating must be between 0 and 5",
                });
                return;
            }
            const restaurant = await restaurant_service_1.default.updateRating(id, rating);
            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    error: "Restaurant not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: restaurant,
                message: "Rating updated successfully",
            });
        });
    }
}
exports.RestaurantController = RestaurantController;
exports.default = new RestaurantController();
//# sourceMappingURL=restaurant.controller.js.map