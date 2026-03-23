import { MetadataRoute } from 'next';

const SITE_URL = 'https://fukugyo-clicker.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
