const { Client } = require('pg');

const regions = [
  'ap-southeast-1', // Singapore
  'ap-southeast-3', // Jakarta
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'us-east-1',      // N. Virginia
  'us-west-1',      // N. California
  'eu-central-1',   // Frankfurt
  'eu-west-1'       // Ireland
];

async function testConnection(region) {
  const url = `postgresql://postgres.mmofdqpfgbjqyrcnbzpr:BopeA124399@aws-0-${region}.pooler.supabase.com:5432/postgres`;
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`SUCCESS: ${region}`);
    await client.end();
    return region;
  } catch (err) {
    console.log(`FAIL ${region}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("Testing pooler regions...");
  for (const region of regions) {
    const success = await testConnection(region);
    if (success) {
      console.log(`\nFound working region: ${success}`);
      process.exit(0);
    }
  }
  console.log("None worked.");
}

main();
