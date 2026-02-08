#!/usr/bin/env node

/**
 * Script pour enregistrer manuellement les webhooks Shopify
 *
 * Utilité: Permet de tester/dédéboguer l'enregistrement des webhooks
 * sans avoir à redémarrer Strapi
 *
 * Utilisation:
 * node scripts/register-shopify-webhooks.js
 *
 * Variables d'env requises:
 * - SHOPIFY_SHOP_NAME
 * - SHOPIFY_ADMIN_API_ACCESS_TOKEN
 * - SHOPIFY_API_VERSION
 * - STRAPI_PUBLIC_URL
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'env depuis .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

const shopName = process.env.SHOPIFY_SHOP_NAME;
const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || '2023-04';
const publicUrl = process.env.STRAPI_PUBLIC_URL;

const webhookTopics = [
  'products/create',
  'products/update',
  'products/delete',
  'collections/create',
  'collections/update',
  'collections/delete',
];

const webhookUrl = `${publicUrl}/api/shopify/webhook`;

// Validation
if (!shopName || !accessToken || !publicUrl) {
  console.error('❌ Missing required environment variables:');
  if (!shopName) console.error('   - SHOPIFY_SHOP_NAME');
  if (!accessToken) console.error('   - SHOPIFY_ADMIN_API_ACCESS_TOKEN');
  if (!publicUrl) console.error('   - STRAPI_PUBLIC_URL');
  process.exit(1);
}

console.log('🔄 Starting Shopify webhook registration...');
console.log(`   Shop: ${shopName}`);
console.log(`   Webhook URL: ${webhookUrl}`);
console.log(`   Topics: ${webhookTopics.length}`);

async function getExistingWebhooks() {
  const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks.json`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.webhooks || [];
  } catch (error) {
    console.error('❌ Error fetching existing webhooks:', error.message);
    return [];
  }
}

async function createWebhook(topic) {
  const url = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/webhooks.json`;

  const payload = {
    webhook: {
      topic,
      address: webhookUrl,
      format: 'json',
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    console.log(`✅ Webhook registered: ${topic} (ID: ${data.webhook?.id})`);
    return data.webhook;
  } catch (error) {
    console.error(`❌ Error creating webhook for ${topic}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('\n📋 Fetching existing webhooks...');
    const existingWebhooks = await getExistingWebhooks();
    console.log(
      `   Found ${existingWebhooks.length} existing webhook(s)\n`
    );

    let registered = 0;
    let skipped = 0;

    for (const topic of webhookTopics) {
      const exists = existingWebhooks.some(
        (wh) => wh.topic === topic && wh.address === webhookUrl
      );

      if (exists) {
        console.log(`⏭️  Webhook already registered: ${topic}`);
        skipped++;
      } else {
        await createWebhook(topic);
        registered++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Registered: ${registered}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${registered + skipped}`);

    if (registered > 0 || skipped > 0) {
      console.log(
        `\n✅ All webhooks processed successfully!`
      );
      console.log(
        `\n📍 Verify in Shopify Admin:`
      );
      console.log(
        `   Settings → Notifications → Webhooks`
      );
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
