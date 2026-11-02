import sys

path = '/var/www/affiliate/scripts/cj_promoradar_sync.cjs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  // Trigger site catalog update if active deals are present
  try {
    const { syncAndBuild } = require('./promoradar_catalog_sync.cjs');
    await syncAndBuild();
  } catch (syncErr) {
    log(`Notice triggering site catalog sync: ${syncErr.message}`);
  }"""

replacement = """  // Trigger site catalog update if active deals are present
  try {
    const { syncAndBuild } = require('./promoradar_catalog_sync.cjs');
    await syncAndBuild();
  } catch (syncErr) {
    log(`Notice triggering site catalog sync: ${syncErr.message}`);
  }

  // Trigger continuous product catalog ingestion and freshness check
  try {
    const { syncAllProducts } = require('./autonomous_product_sync.cjs');
    await syncAllProducts();
  } catch (prodErr) {
    log(`Notice triggering product catalog sync: ${prodErr.message}`);
  }"""

if target not in content:
    print("ERROR: target not found in cj_promoradar_sync.cjs")
    sys.exit(1)

content = content.replace(target, replacement, 1)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: continuous product sync hooked into cj_promoradar_sync daemon")
