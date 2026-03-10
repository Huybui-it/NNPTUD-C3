const http = require('http');

const categoryData = JSON.stringify({ name: 'Sample Category' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/categories',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': categoryData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Category created:', data);
    const category = JSON.parse(data);
    
    // Create product
    const productData = JSON.stringify({
      title: 'Sample Product 123',
      price: 1000,
      description: 'A very nice product',
      category: category._id
    });
    
    const req2 = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(productData)
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', (chunk) => { data2 += chunk; });
      res2.on('end', () => {
        console.log('\n\n--- HÌNH ẢNH POST THÀNH CÔNG 1 OBJECT ---');
        console.log(JSON.stringify(JSON.parse(data2), null, 2));
      });
    });
    req2.write(productData);
    req2.end();
  });
});

req.on('error', (error) => { console.error(error); });
req.write(categoryData);
req.end();
