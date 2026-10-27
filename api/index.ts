import type { VercelRequest, VercelResponse } from '@vercel/node';
import bookingsHandler from './bookings';
import contactHandler from './contact';
import newsletterHandler from './newsletter';
import healthHandler from './health';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';

  if (url.includes('/bookings')) {
    return bookingsHandler(req, res);
  }
  if (url.includes('/contact')) {
    return contactHandler(req, res);
  }
  if (url.includes('/newsletter')) {
    return newsletterHandler(req, res);
  }
  if (url.includes('/health')) {
    return healthHandler(req, res);
  }

  return healthHandler(req, res);
}
