const fs = require('fs');
const prodPath = 'deals-portal/src/data/productsData.ts';
let content = fs.readFileSync(prodPath, 'utf8');

if (!content.includes('"nike":')) {
  const nikeProductBlock = `  "nike": [
    {
      "id": "nike-air-max-running",
      "storeSlug": "nike",
      "title": "Nike Air Max Performance Athletic Running Sneakers",
      "description": "Iconic Air Max cushioning engineered for maximum shock absorption, daily comfort, and breathability.",
      "price": "$129.99",
      "currency": "USD",
      "imageUrl": "/promo-media/nike/nike_air_max_product.jpg",
      "productUrl": "https://www.awin1.com/awclick.php?mid=17652&id=3148787&p=https%3A%2F%2Fwww.nike.com.br",
      "badge": "Top Pick"
    }
  ],
`;
  content = content.replace('export const STORE_PRODUCTS: Record<string, StoreProduct[]> = {', 'export const STORE_PRODUCTS: Record<string, StoreProduct[]> = {\n' + nikeProductBlock);
  fs.writeFileSync(prodPath, content, 'utf8');
  console.log('Added Nike to productsData.ts');
} else {
  console.log('Nike already present in productsData.ts');
}

