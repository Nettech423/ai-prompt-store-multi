
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const token = req.query.token;
  const promptId = req.query.prompt;
  const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');
  let orders = [];
  try { orders = JSON.parse(fs.readFileSync(ORDERS_PATH,'utf8')||'[]'); } catch(e){ orders=[]; }
  const idx = orders.findIndex(o=>o.downloadLink && o.downloadLink.includes(token) && o.productId===promptId);
  if (idx===-1) return res.status(404).send('Link not found or expired');
  // invalidate token by removing order
  const order = orders.splice(idx,1)[0];
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders,null,2));
  const products = JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','products.json'),'utf8'));
  const product = products.find(p=>p.id===promptId);
  if (!product) return res.status(404).send('Product not found');
  res.setHeader('Content-Disposition', `attachment; filename=product-${product.id}.txt`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(`${product.name}\n\n${product.description}`);
}
