const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const rawData = `_legacy_auth0.PNSvFDQzkiyy1A668z5ZsxXGEgRGN88h.is.authenticated	true	members.cj.com	/	2026-11-09T08:08:04.000Z	67		✓				Medium	
_pendo___sg__.0bf9feab-a219-417f-515f-391beeeb147d	%7B%22visitormetadata%22%3A%7B%22agent__brandedcontext%22%3Anull%7D%7D	.cj.com	/	2027-02-16T19:03:38.000Z	120		✓	None			Medium	
_pendo___sg__.6f6e9e64-2f81-4d5e-823e-848582caa2d9	%7B%7D	.cj.com	/	2027-02-16T08:07:59.000Z	56		✓	None			Medium	
_pendo_accountId.3527410929	8102806	.cj.com	/	2027-02-16T19:03:38.000Z	34		✓	None			Medium	
_pendo_meta.3527410929	1293201171	.cj.com	/	2027-02-16T19:03:38.000Z	32		✓	None			Medium	
_pendo_oldVisitorId.3527410929	_PENDO_T_LP0eKYBxyv7	.cj.com	/	2027-02-07T12:12:34.000Z	50		✓	None			Medium	
_pendo_sessionId.3527410929	%7B%22sessionId%22%3A%22rkmDIMMfVYCnpiqi%22%2C%22timestamp%22%3A1794164618032%7D	.cj.com	/	2027-02-16T19:03:38.000Z	107		✓	None			Medium	
_pendo_utm.3527410929	%7B%22channel%22%3A%22Direct%22%7D	.cj.com	/	2027-02-16T19:03:38.000Z	55		✓	None			Medium	
_pendo_visitorId.3527410929	de636bd4-eaaa-46db-bf46-4381c788063e	.cj.com	/	2027-02-16T19:03:38.000Z	63		✓	None			Medium	
active_company	8102806	.cj.com	/	2026-11-09T19:03:36.000Z	21						Medium	
auth0.PNSvFDQzkiyy1A668z5ZsxXGEgRGN88h.is.authenticated	true	members.cj.com	/	2026-11-09T08:08:04.000Z	59		✓	None			Medium	
authentication_token	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJ2NmpjUXFrU2NmZzhxVkdKZUJ4RSJ9.eyJodHRwczovL3d3dy5jai5jb20vdXNlcmlkIjoiZGU2MzZiZDQtZWFhYS00NmRiLWJmNDYtNDM4MWM3ODgwNjNlIiwiaXNzIjoiaHR0cHM6Ly9zaWduaW4uY2ouY29tLyIsInN1YiI6ImF1dGgwfGRlNjM2YmQ0LWVhYWEtNDZkYi1iZjQ2LTQzODFjNzg4MDYzZSIsImF1ZCI6WyJjai1wbGF0Zm9ybSIsImh0dHBzOi8vc2lnbmluLmNqYWZmaWxpYXRlLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3OTQxNjQ2MTAsImV4cCI6MTc5NDIwNzgxMCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6InFwWDY5c254N1hTY0lCTHA4NWU1YnhCOUFqRHFOanBjIn0.BFL_DaNnQ62V-qyf4YmRkNMc4gstVFnao-9yMZeVatW-ciU9LOLoo6400NPmsebqd7c5VmdEk71KsHAdXY9wcyK0LvfNahhOxK16x3LyjlEIWtyJEUJJRRm1jf1CdfiTjI_rpFVmQyuDMG5ll7o0c7c4X2Tl8L8rVxLVyBgVDcWysHH9tZTYIBWvj7WRGYrLhEU21DZqNktmz5yx7rL3FSiTqMzneKN_6W1matNCAPqX7ZalfeskRmISA_vZBvTnIbhnQ0qqBxbmsK1bfmQ8HlNznr6qWxp8VtaMSdFMDVRFm_BD6J6yYql2t6VI8wknw7yvoHwnEJuaRtSh85Bk7A	.cj.com	/	Session	895		✓				Medium	
cjuMember	0	.cj.com	/	Session	10		✓	None			Medium	
CONTID	7793684	.cj.com	/	2027-02-06T19:03:30.203Z	13		✓	None			Medium	
hubspotutk	6bf4687085f638ca04bbf1e3cc8370ff	.cj.com	/	2027-04-28T12:11:10.000Z	42			Lax			Medium	
jsAuth0Login	true	.cj.com	/	Session	16		✓	None			Medium	
jsCompanyId	8102806	.cj.com	/	Session	18		✓	None			Medium	
jsContactId	7793684	.cj.com	/	Session	18		✓	None			Medium	
jsCu	USD	.cj.com	/	Session	7		✓	None			Medium	
jsDt	d-MMM-yyyy	.cj.com	/	Session	14		✓	None			Medium	
JSESSIONID	aaaSpM14SmTkM_SjuWWgA	members.cj.com	/	Session	31	✓	✓	None			Medium	
jsLa	en	.cj.com	/	Session	6		✓	None			Medium	
jsPublisherStatus	0	.cj.com	/	Session	18		✓	None			Medium	
nav_active_session	true	.cj.com	/	Session	22						Medium	
SESSION	f6618f2a-c611-48ab-a2a4-64e4c19f2b9c	members.cj.com	/	Session	43	✓					Medium`;

const lines = rawData.trim().split('\n');
const cookies = [];

for (const line of lines) {
  const parts = line.split('\t').map(p => p.trim());
  if (parts.length >= 3) {
    const name = parts[0];
    const value = parts[1];
    const domain = parts[2] || '.cj.com';
    const pathVal = parts[3] || '/';
    
    let expires = -1;
    if (parts[4] && parts[4] !== 'Session') {
      try {
        expires = Math.floor(new Date(parts[4]).getTime() / 1000);
      } catch {}
    }
    if (expires === -1 || isNaN(expires)) {
      expires = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    }

    const httpOnly = line.includes('✓');
    const secure = true;
    let sameSite = 'Lax';
    if (parts.some(p => p === 'None')) sameSite = 'None';
    if (parts.some(p => p === 'Strict')) sameSite = 'Strict';

    cookies.push({
      name,
      value,
      domain,
      path: pathVal,
      expires,
      httpOnly: name === 'JSESSIONID' || name === 'SESSION',
      secure,
      sameSite
    });
  }
}

const state = {
  cookies,
  origins: [
    {
      origin: 'https://members.cj.com',
      localStorage: []
    }
  ]
};

const LOCAL_PATH = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
fs.writeFileSync(LOCAL_PATH, JSON.stringify(state, null, 2), 'utf8');
console.log(`✅ Parsed and saved ${cookies.length} cookies to local ${LOCAL_PATH}`);

// Upload to production server via SFTP
const conn = new Client();
conn.on('ready', () => {
  console.log('📡 Connected to server 178.128.199.28. Updating /var/www/affiliate/artifacts_admitad/cj_auth_state.json...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/var/www/affiliate/artifacts_admitad/cj_auth_state.json');
    writeStream.on('close', () => {
      console.log('🎉 Server cj_auth_state.json successfully updated!');
      conn.end();
    });
    writeStream.write(JSON.stringify(state, null, 2));
    writeStream.end();
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});
