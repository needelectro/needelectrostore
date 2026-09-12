import http from 'http';

function checkSales() {
  http.get('http://localhost:3000/api/sales', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('API /api/sales status:', res.statusCode);
        console.log('Success:', json.success);
        console.log('Total sales returned:', json.data?.length);
        if (json.data && json.data.length > 0) {
          console.log('First sale:', json.data[0].invoiceNumber, json.data[0].customerName, '৳' + json.data[0].grandTotal);
          console.log('Last sale:', json.data[json.data.length - 1].invoiceNumber, json.data[json.data.length - 1].customerName, '৳' + json.data[json.data.length - 1].grandTotal);
          const totalInvoiced = json.data.reduce((sum, s) => sum + s.grandTotal, 0);
          const totalPaid = json.data.reduce((sum, s) => sum + s.paidAmount, 0);
          const totalDue = json.data.reduce((sum, s) => sum + s.dueAmount, 0);
          console.log(`Aggregates: Total Invoiced = ৳${totalInvoiced.toLocaleString()}, Paid = ৳${totalPaid.toLocaleString()}, Due = ৳${totalDue.toLocaleString()}`);
        }
      } catch (e) {
        console.error('Error parsing JSON:', e.message, data.slice(0, 150));
      }
    });
  }).on('error', (e) => {
    console.log('Connecting to server... (' + e.message + ')');
    setTimeout(checkSales, 1000);
  });
}

checkSales();
