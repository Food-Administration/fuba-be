"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const blog_service_1 = __importDefault(require("./blog.service"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
class BlogController {
    constructor() {
        this.create = (0, asyncHandler_1.default)(async (req, res) => {
            const blog = await blog_service_1.default.create(req.body);
            res.status(201).json(blog);
        });
        this.get = (0, asyncHandler_1.default)(async (req, res) => {
            const blogs = await blog_service_1.default.get(req.query);
            res.status(200).json(blogs);
        });
        this.getById = (0, asyncHandler_1.default)(async (req, res) => {
            const blog = await blog_service_1.default.getById(req.params.id);
            if (!blog) {
                res.status(404).json({ error: 'blog not found' });
                return;
            }
            res.status(200).json(blog);
        });
        this.update = (0, asyncHandler_1.default)(async (req, res) => {
            const blog = await blog_service_1.default.update(req.params.id, req.body);
            if (!blog) {
                res.status(404).json({ error: 'blog not found' });
                return;
            }
            res.status(200).json(blog);
        });
        this.delete = (0, asyncHandler_1.default)(async (req, res) => {
            const blog = await blog_service_1.default.delete(req.params.id);
            if (!blog) {
                res.status(404).json({ error: 'blog not found' });
                return;
            }
            res.status(204).json({ message: 'blog deleted successfully' });
        });
    }
}
exports.BlogController = BlogController;
exports.default = new BlogController();
//# sourceMappingURL=blog.controller.js.map