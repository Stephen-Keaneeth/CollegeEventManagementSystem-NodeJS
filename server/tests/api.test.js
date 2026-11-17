/**
 * Automated End-to-End API Test Suite
 * Tests all core backend workflows: Authentication, Events, Registration, Attendance, Feedback, Dashboard
 * Uses Windows Named Pipe / Unix Domain Socket to run seamlessly and reliably inside sandbox.
 */

const http = require('http');
const path = require('path');
const { app } = require('../src/server');
const db = require('../src/database/db');
const { runSeed } = require('../src/database/seed');

const PIPE_NAME = process.platform === 'win32'
  ? `\\\\.\\pipe\\campuspulse-test-${Date.now()}`
  : path.join(__dirname, `test-${Date.now()}.sock`);

async function request(method, routePath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        socketPath: PIPE_NAME,
        path: '/api' + routePath,
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 Running Automated Integration Tests for CampusPulse');
  console.log('======================================================\n');

  // Test 1: Health Check
  const health = await request('GET', '/health');
  assert(health.status === 200 && health.data.status === 'healthy', 'API Health check returns 200 healthy');

  // Test 2: Admin Login
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@college.edu',
    password: 'Password123!'
  });
  assert(adminLogin.status === 200 && adminLogin.data.data.token, 'Admin login succeeds with JWT');
  const adminToken = adminLogin.data.data.token;

  // Test 3: Organizer Login
  const orgLogin = await request('POST', '/auth/login', {
    email: 'organizer@college.edu',
    password: 'Password123!'
  });
  assert(orgLogin.status === 200 && orgLogin.data.data.token, 'Organizer login succeeds with JWT');
  const orgToken = orgLogin.data.data.token;

  // Test 4: Student Login
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@college.edu',
    password: 'Password123!'
  });
  assert(studentLogin.status === 200 && studentLogin.data.data.token, 'Student login succeeds with JWT');
  const studentToken = studentLogin.data.data.token;

  // Test 5: Fetch Events list
  const eventsRes = await request('GET', '/events', null, studentToken);
  assert(eventsRes.status === 200 && Array.isArray(eventsRes.data.data.events), 'Events list returns array');
  const targetEvent = eventsRes.data.data.events.find(e => e.title.includes('Cloud-Native'));
  assert(!!targetEvent, 'Found Cloud-Native Masterclass event');

  // Test 6: Student registers for event
  const regRes = await request('POST', `/registrations/${targetEvent.id}`, {}, studentToken);
  assert(regRes.status === 201 && regRes.data.data.ticket_code, 'Student successfully registers and receives digital ticket code');

  // Test 7: Duplicate registration rejection
  const dupRegRes = await request('POST', `/registrations/${targetEvent.id}`, {}, studentToken);
  assert(dupRegRes.status === 409, 'Duplicate registration is rejected with 409 Conflict');

  // Test 8: Fetch Student My Events
  const myEventsRes = await request('GET', '/registrations/my-events', null, studentToken);
  assert(
    myEventsRes.status === 200 && myEventsRes.data.data.registrations.some(r => r.event_id === targetEvent.id),
    'Registered event appears in student My Events list'
  );

  // Test 9: Organizer views attendance sheet
  const attRes = await request('GET', `/attendance/event/${targetEvent.id}`, null, orgToken);
  assert(attRes.status === 200 && Array.isArray(attRes.data.data.attendees), 'Organizer can view attendance sheet');

  // Test 10: Organizer marks attendance
  const studentReg = attRes.data.data.attendees.find(a => a.student_email === 'student@college.edu');
  assert(!!studentReg, 'Student found in attendance sheet');

  const markRes = await request('POST', '/attendance/mark', {
    registration_id: studentReg.registration_id,
    status: 'present',
    notes: 'Verified via named pipe test'
  }, orgToken);
  assert(markRes.status === 200 && markRes.data.data.status === 'present', 'Organizer marks student attendance as present');

  // Test 11: Submit Feedback
  const fbRes = await request('POST', `/feedback/${targetEvent.id}`, {
    rating: 5,
    review: 'Automated test review: outstanding event organization and clear instructions!'
  }, studentToken);
  assert(fbRes.status === 201 && fbRes.data.data.rating === 5, 'Student submits 5-star rating & review');

  // Test 12: Admin Dashboard Analytics
  const adminDash = await request('GET', '/dashboard/admin', null, adminToken);
  assert(adminDash.status === 200 && adminDash.data.data.stats.total_events > 0, 'Admin dashboard returns statistics & charts data');

  // Test 13: Organizer Dashboard Analytics
  const orgDash = await request('GET', '/dashboard/organizer', null, orgToken);
  assert(orgDash.status === 200 && orgDash.data.data.stats.total_events > 0, 'Organizer dashboard returns performance metrics');

  // Test 14: Student Dashboard
  const studentDash = await request('GET', '/dashboard/student', null, studentToken);
  assert(studentDash.status === 200 && studentDash.data.data.stats.total_registered > 0, 'Student dashboard returns registered schedule & stats');

  console.log('\n======================================================');
  console.log('🎉 ALL 14/14 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

(async () => {
  let server;
  try {
    await db.initDb();
    await runSeed();
    server = app.listen(PIPE_NAME, async () => {
      try {
        await runTests();
        server.close(() => process.exit(0));
      } catch (testErr) {
        server.close(() => process.exit(1));
      }
    });
  } catch (err) {
    console.error('Fatal test error:', err);
    if (server) server.close();
    process.exit(1);
  }
})();
