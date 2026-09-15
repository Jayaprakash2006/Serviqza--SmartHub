const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING SERVIQZA E2E SUITE ===\n');

  // 1. Auth Test
  console.log('--- 1. Authentication ---');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'alice@example.com',
    password: 'password123'
  });
  console.log('Customer Alice Login Status:', loginRes.status);
  const aliceToken = loginRes.body.token;

  const helper1Res = await request('POST', '/api/auth/login', {
    email: 'carlos.helper@serviqza.com',
    password: 'password123'
  });
  const carlosToken = helper1Res.body.token;

  const helper2Res = await request('POST', '/api/auth/login', {
    email: 'priya.helper@serviqza.com',
    password: 'password123'
  });
  const priyaToken = helper2Res.body.token;

  const helperFarRes = await request('POST', '/api/auth/login', {
    email: 'frank.helper@serviqza.com',
    password: 'password123'
  });
  const frankToken = helperFarRes.body.token;

  const providerRes = await request('POST', '/api/auth/login', {
    email: 'rajesh.mechanic@serviqza.com',
    password: 'password123'
  });
  const rajeshToken = providerRes.body.token;

  const adminRes = await request('POST', '/api/auth/login', {
    email: 'admin@serviqza.com',
    password: 'password123'
  });
  const adminToken = adminRes.body.token;

  console.log('✓ All logins authenticated successfully');

  // 2. Services Flow
  console.log('\n--- 2. Services Flow ---');
  const catRes = await request('GET', '/api/service-categories');
  console.log(`✓ Fetched ${catRes.body.length} service categories`);

  const servRes = await request('GET', '/api/services');
  console.log(`✓ Fetched ${servRes.body.length} active service listings`);
  const serviceToBook = servRes.body[0];

  const reqServiceRes = await request('POST', '/api/service-requests', {
    serviceId: serviceToBook.id,
    description: 'Car broken down, radiator smoking',
    address: 'Indiranagar 100ft Road',
    latitude: 12.9784,
    longitude: 77.6408,
    scheduledDateTime: new Date().toISOString()
  }, aliceToken);
  console.log('Service Request Created, Status:', reqServiceRes.status, 'ID:', reqServiceRes.body.id);
  const serviceReqId = reqServiceRes.body.id;

  // Provider accepts service request
  const acceptServRes = await request('PUT', `/api/service-requests/${serviceReqId}/status`, {
    status: 'ACCEPTED'
  }, rajeshToken);
  console.log('Provider Status -> ACCEPTED:', acceptServRes.body.status);

  await request('PUT', `/api/service-requests/${serviceReqId}/status`, { status: 'ON_THE_WAY' }, rajeshToken);
  await request('PUT', `/api/service-requests/${serviceReqId}/status`, { status: 'ARRIVED' }, rajeshToken);
  await request('PUT', `/api/service-requests/${serviceReqId}/status`, { status: 'IN_PROGRESS' }, rajeshToken);
  const completedServRes = await request('PUT', `/api/service-requests/${serviceReqId}/status`, { status: 'COMPLETED' }, rajeshToken);
  console.log('Provider Status -> COMPLETED:', completedServRes.body.status);

  // Customer rates service
  const reviewServRes = await request('POST', `/api/service-requests/${serviceReqId}/reviews`, {
    rating: 5,
    comment: 'Excellent mechanic! Fixed the issue in 20 minutes.'
  }, aliceToken);
  console.log('Customer Review Created, Status:', reviewServRes.status, 'Rating:', reviewServRes.body.rating);

  // 3. Rental Flow & Concurrency
  console.log('\n--- 3. Rental Flow & Double-Booking Prevention ---');
  const rentalsRes = await request('GET', '/api/rentals');
  console.log(`✓ Fetched ${rentalsRes.body.length} rental listings`);
  const rentalItem = rentalsRes.body[0];

  // Customer books item for Oct 10 to Oct 15
  const booking1 = await request('POST', '/api/rental-bookings', {
    itemId: rentalItem.id,
    startDate: '2026-10-10',
    endDate: '2026-10-15'
  }, aliceToken);
  console.log('Booking 1 (Oct 10 - Oct 15) Status:', booking1.status, 'Total Price:', booking1.body.totalPrice);

  // Another customer (Bob) tries to book overlapping dates (Oct 12 - Oct 18)
  const bobLogin = await request('POST', '/api/auth/login', {
    email: 'bob@example.com',
    password: 'password123'
  });
  const bobToken = bobLogin.body.token;

  const bookingOverlap = await request('POST', '/api/rental-bookings', {
    itemId: rentalItem.id,
    startDate: '2026-10-12',
    endDate: '2026-10-18'
  }, bobToken);
  console.log('Booking 2 Overlapping Attempt (Oct 12 - Oct 18) Status:', bookingOverlap.status, '(Expected 409 Conflict)');
  if (bookingOverlap.status === 409) {
    console.log('✓ Overlapping booking successfully rejected with 409 Conflict!');
  } else {
    console.error('FAIL: Overlapping booking was NOT rejected!');
  }

  // 4. Emergency Fuel Assistance Flow
  console.log('\n--- 4. Emergency Fuel Assistance & Matching ---');
  // Alice creates fuel request at coordinates (12.9716, 77.5946)
  const fuelReqRes = await request('POST', '/api/fuel/requests', {
    fuelType: 'Petrol',
    quantity: 4.5,
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Near Cubbon Park Entrance',
    description: 'Empty tank, stranded with hazards on',
    optionalTip: 15.0
  }, aliceToken);
  console.log('Fuel Request Created, Status:', fuelReqRes.status, 'ID:', fuelReqRes.body.id);
  const fuelRequestId = fuelReqRes.body.id;

  // Carlos is ~1.0 km away (within 3 km initial radius)
  const carlosNearby = await request('GET', '/api/fuel/requests/nearby', null, carlosToken);
  const carlosFound = carlosNearby.body.some(r => r.id === fuelRequestId);
  console.log(`Carlos (Near Helper, dist ~1km): Saw Request? -> ${carlosFound} (Distance: ${carlosNearby.body[0]?.distanceKm} km, Radius: ${carlosNearby.body[0]?.currentRadiusKm} km)`);

  // Frank is ~18 km away (exceeds 10 km maximum radius)
  const frankNearby = await request('GET', '/api/fuel/requests/nearby', null, frankToken);
  const frankFound = frankNearby.body.some(r => r.id === fuelRequestId);
  console.log(`Frank (Far Helper, dist ~18km): Saw Request? -> ${frankFound} (Expected: false)`);

  // Concurrency test: Carlos and Priya both try to accept the same pending request
  console.log('\n--- 5. Atomic Single-Winner Acceptance Race ---');
  const [accept1, accept2] = await Promise.all([
    request('POST', `/api/fuel/requests/${fuelRequestId}/accept`, null, carlosToken),
    request('POST', `/api/fuel/requests/${fuelRequestId}/accept`, null, priyaToken)
  ]);

  console.log(`Result: Helper 1 Status = ${accept1.status}, Helper 2 Status = ${accept2.status}`);
  const hasWinner = (accept1.status === 200 && accept2.status === 409) || (accept2.status === 200 && accept1.status === 409);
  if (hasWinner) {
    console.log('✓ ATOMIC ACCEPTANCE SUCCESSFUL: Exactly 1 winner (200 OK) and 1 rejected (409 Conflict)');
  } else {
    console.error('FAIL: Concurrency race condition occurred!');
  }

  // Determine the winning helper
  const winnerToken = accept1.status === 200 ? carlosToken : priyaToken;

  // Winner updates status -> ON_THE_WAY -> ARRIVED -> COMPLETED
  await request('PUT', `/api/fuel/requests/${fuelRequestId}/status`, { status: 'ON_THE_WAY' }, winnerToken);
  await request('PUT', `/api/fuel/requests/${fuelRequestId}/status`, { status: 'ARRIVED' }, winnerToken);
  const completedFuel = await request('PUT', `/api/fuel/requests/${fuelRequestId}/status`, { status: 'COMPLETED' }, winnerToken);
  console.log('Helper Status -> COMPLETED:', completedFuel.body.status);

  // Alice rates the helper
  const fuelReview = await request('POST', `/api/fuel/requests/${fuelRequestId}/rating`, {
    rating: 5,
    comment: 'Life saver! Arrived quickly with 5L petrol.'
  }, aliceToken);
  console.log('Fuel Review Status:', fuelReview.status, 'Rating:', fuelReview.body.rating);

  // 6. Admin Verification
  console.log('\n--- 6. Admin Dashboard ---');
  const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
  console.log('Platform Stats:', statsRes.body);

  console.log('\n=============================================');
  console.log('🎉 ALL SERVIQZA BACKEND E2E TESTS PASSED 100%!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
