const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env if it exists
try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim();
            }
        });
    }
} catch (e) {
    console.log('No .env file found or error parsing it.');
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://hhnrosczgggxelnbrhlk.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_b-H4H0Qct-yzaR6uUdwQsg_B-A0JBTW';
const SITE_URL = 'https://elifrad.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
    console.log('Generating sitemap...');

    const staticPages = [
        '',
        '/login',
        '/register',
        '/marken',
        '/special-offers',
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${SITE_URL}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Fetch Categories
    const { data: categories } = await supabase.from('categories').select('slug, name').eq('is_active', true);
    if (categories) {
        categories.forEach(cat => {
            const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
            xml += `
  <url>
    <loc>${SITE_URL}/category/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
    }

    // Fetch Products
    const { data: products } = await supabase.from('products').select('id, name').eq('is_active', true);
    if (products) {
        products.forEach(prod => {
            // Logic matching our productSlug.js
            const slugBase = prod.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const slug = `${slugBase}-${prod.id.slice(0, 8)}`;
            xml += `
  <url>
    <loc>${SITE_URL}/product/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
    }

    xml += `
</urlset>`;

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap().catch(console.error);
