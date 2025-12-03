import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local when running locally.
// In production on Vercel, environment variables are provided by the platform,
// so we skip this.
if (!process.env.VERCEL) {
  const envPath = path.join(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
}


