import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper to check admin
async function isAdmin(req: NextApiRequest): Promise<boolean> {
  const token = req.cookies.token;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    return decoded.role === 'ADMIN';
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAdmin(req))) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.method === 'POST') {
    // Add product
    const { name, slug, description, price, image, categoryId, stock } = req.body;
    if (!name || !slug || !description || !price || !image || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
      const product = await prisma.product.create({
        data: { name, slug, description, price: parseFloat(price), image, categoryId, stock: stock ? parseInt(stock) : 0 },
      });
      return res.status(201).json(product);
    } catch (e) {
      return res.status(500).json({ message: 'Error creating product', error: e });
    }
  }

  if (req.method === 'GET') {
    // List products
    try {
      const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(products);
    } catch (e) {
      return res.status(500).json({ message: 'Error fetching products', error: e });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 