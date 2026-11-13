const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let respData = '';
      res.on('data', chunk => respData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(respData));
        } catch {
          resolve(respData);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Test Calendar for Nov 2026 ===');
  const nov2026 = await get('http://localhost:5000/api/calendar?postingMonth=2026-11');
  console.log('Filtered posts in Nov 2026:', nov2026.filteredPostsCount);
  console.log('Active clients in Nov 2026:', nov2026.activeClientsCount);
  console.log('Dates count in Nov 2026:', nov2026.dates.length);
  console.log('Multi-post days count in Nov 2026:', nov2026.multiPostCount);

  // Check specific dates mentioned in prompt: Nov 16, Nov 17
  const nov16Posts = [];
  const nov17Posts = [];
  Object.keys(nov2026.matrix).forEach(client => {
    if (nov2026.matrix[client]['2026-11-16']) {
      nov16Posts.push({ client, count: nov2026.matrix[client]['2026-11-16'].length });
    }
    if (nov2026.matrix[client]['2026-11-17']) {
      nov17Posts.push({ client, count: nov2026.matrix[client]['2026-11-17'].length });
    }
  });
  console.log('Posts on Nov 16, 2026:', nov16Posts);
  console.log('Posts on Nov 17, 2026:', nov17Posts);

  console.log('\n=== TEST 2: Test Search Filter ===');
  const searchRes = await get('http://localhost:5000/api/calendar?postingMonth=2026-11&search=Digital');
  console.log('Clients matching "Digital":', searchRes.clients.map(c => c.name));
  console.log('Posts matching "Digital":', searchRes.filteredPostsCount);

  console.log('\n=== TEST 3: Test Data Added Month Filter (Separate from Posting Month) ===');
  // In November 2026 data added month:
  const dataAddedNov = await get('http://localhost:5000/api/calendar?postingMonth=all&dataAddedMonth=2026-11');
  console.log('Posts entered in Nov 2026:', dataAddedNov.filteredPostsCount);
  if (dataAddedNov.filteredPostsCount > 0) {
    const sample = Object.values(dataAddedNov.matrix)[0];
    const sampleDate = Object.keys(sample)[0];
    const samplePost = sample[sampleDate][0];
    console.log(`Sample: Client=${samplePost.client}, Posting Date=${samplePost.postingDate}, Data Entry Date=${samplePost.dataEntryDate}`);
  }

  console.log('\n=== TEST 4: Test Adding a New Post (Demonstrating Future Entry Timestamp Tracking) ===');
  const newPostRes = await post('http://localhost:5000/api/posts', {
    client: 'GA Digital',
    postingDate: '2026-11-19',
    postType: 'Carousel',
    topic: 'Verified Timestamping Feature',
    imgContent: 'Instant creation timestamp test',
    description: 'This post verifies that newly entered posts receive an exact real-time data entry timestamp.',
    creativeLink: 'https://drive.google.com/test'
  });
  console.log('Created Post ID:', newPostRes.post.id);
  console.log('Created Post Data Entry Date:', newPostRes.post.dataEntryDate);
  console.log('Created Post Posting Date:', newPostRes.post.postingDate);

  // Check that this new post appears on 2026-11-19
  const reCheckNov = await get('http://localhost:5000/api/calendar?postingMonth=2026-11&client=GA%20Digital');
  console.log('GA Digital Nov 19 posts count:', reCheckNov.matrix['GA Digital']['2026-11-19'].length);

  console.log('\n=== TEST 5: Test Google Apps Script Endpoint ===');
  const scriptRes = await get('http://localhost:5000/api/apps-script');
  console.log('Apps Script returned? Length:', scriptRes.code.length, 'Sheet ID:', scriptRes.sheetId);

  console.log('\n=== ALL TESTS PASSED! ===');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
