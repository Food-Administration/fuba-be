import { Request, Response } from 'express';
import BlogService from './blog.service';
import asyncHandler from '../../utils/asyncHandler';

export class BlogController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogService.create(req.body);
    res.status(201).json(blog);
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const blogs = await BlogService.get(req.query);
    res.status(200).json(blogs);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogService.getById(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'blog not found' });
      return;
    }
    res.status(200).json(blog);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogService.update(req.params.id, req.body);
    if (!blog) {
      res.status(404).json({ error: 'blog not found' });
      return;
    }
    res.status(200).json(blog);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogService.delete(req.params.id);
    if (!blog) {
      res.status(404).json({ error: 'blog not found' });
      return;
    }
    res.status(204).json({ message: 'blog deleted successfully' });
  });
}

export default new BlogController();
