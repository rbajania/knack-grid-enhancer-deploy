// Serves the Knack Grid Enhancer script ONLY to requests whose Origin/Referer
// matches an allowed domain. Anyone else (direct curl, another site embedding
// the URL, a stray link) gets a 403 with no code in the response.
//
// Configure allowed domains in the Netlify dashboard:
//   Site settings > Environment variables > ALLOWED_ORIGINS
//   e.g.  ALLOWED_ORIGINS = yourapp.knack.com,yourapp.com
//
// While you're still testing pre-launch, just leave ALLOWED_ORIGINS unset
// (or set it to something bogus like "not-yet") and every request will be
// blocked — including your own — until you're ready to flip it on.

const fs = require('fs');
const path = require('path');

exports.handler = async function (event) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);

  const headers = event.headers || {};
  const check = headers.origin || headers.referer || headers.referrer || '';

  const isAllowed = allowed.length > 0 && allowed.some(function (domain) {
    return check.indexOf(domain) !== -1;
  });

  if (!isAllowed) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
      body: 'Not authorized'
    };
  }

  const filePath = path.join(__dirname, 'assets', 'knack-grid-enhancer.min.js');
  const code = fs.readFileSync(filePath, 'utf8');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: code
  };
};
