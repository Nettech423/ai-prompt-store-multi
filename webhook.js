
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');

function saveOrder(order) {
  let orders = [];
  try { orders = JSON.parse(fs.readFileSync(ORDERS_PATH,'utf8')||'[]'); } catch(e){ orders=[]; }
  orders.push(order);
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders,null,2));
}

function generateDownloadLink(promptId) {
  return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/download?token=${uuidv4()}&prompt=${promptId}`;
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const buf = await new Promise((resolve, reject) => {
    const chunks=[];
    req.on('data', c=>chunks.push(c));
    req.on('end', ()=>resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email || 'unknown@example.com';
    const productId = session.metadata?.productId || 'unknown';
    const downloadLink = generateDownloadLink(productId);
    const order = { id: uuidv4(), productId, email, sessionId: session.id, downloadLink, createdAt: new Date().toISOString() };
    saveOrder(order);

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_SENDER || 'no-reply@example.com',
          subject: 'Your AI Prompt Purchase - Download Link',
          html: `<p>Thanks! Here is your one-time download link (expires in 24 hours):</p><p><a href="${downloadLink}">${downloadLink}</a></p>`
        });
        console.log('Email sent to', email);
      } catch (e) { console.error('SendGrid error', e); }
    }
  }

  res.status(200).send('ok');
}
