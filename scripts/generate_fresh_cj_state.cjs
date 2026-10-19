const fs = require('fs');
const path = require('path');

const rawCookie = `_pendo___sg__.6f6e9e64-2f81-4d5e-823e-848582caa2d9=%7B%7D; __hstc=168269822.e517dd31c99d08f02abf4fe79197d5b6.1792340789401.1792340789401.1792340789401.1; hubspotutk=e517dd31c99d08f02abf4fe79197d5b6; __hssrc=1; _pk_id.7.0309=b3d36b1c9d6da6a8.1792341111.; jsPublisherStatus=2; active_company=8102806; _pendo_visitorId.3527410929=de636bd4-eaaa-46db-bf46-4381c788063e; _pendo_oldVisitorId.3527410929=_PENDO_T_cZ2c0WKLiUS; _pendo_accountId.3527410929=8102806; _pendo___sg__.0bf9feab-a219-417f-515f-391beeeb147d=%7B%22visitormetadata%22%3A%7B%22agent__brandedcontext%22%3Anull%7D%7D; authentication_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJ2NmpjUXFrU2NmZzhxVkdKZUJ4RSJ9.eyJodHRwczovL3d3dy5jai5jb20vdXNlcmlkIjoiZGU2MzZiZDQtZWFhYS00NmRiLWJmNDYtNDM4MWM3ODgwNjNlIiwiaXNzIjoiaHR0cHM6Ly9zaWduaW4uY2ouY29tLyIsInN1YiI6ImF1dGgwfGRlNjM2YmQ0LWVhYWEtNDZkYi1iZjQ2LTQzODFjNzg4MDYzZSIsImF1ZCI6WyJjai1wbGF0Zm9ybSIsImh0dHBzOi8vc2lnbmluLmNqYWZmaWxpYXRlLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3OTIzNDIwODUsImV4cCI6MTc5MjM4NTI4NSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBvZmZsaW5lX2FjY2VzcyIsImF6cCI6InFwWDY5c254N1hTY0lCTHA4NWU1YnhCOUFqRHFOanBjIn0.1Pkj_ycsVfOJ6OnPXe8QdyQDDPIgVrgZUzQxalZ2zRhAIPXXaf6qwtSZnRYVdw9elqvE6ouBRdhg52SnfapwwExtrDvFd2HZRl9Su44Y1WKBnFIkEU0RzJYKqX98-0Uy46iw1wdKYznIsCfaO-QQ6Lx-fUwF2Qo_ddxMsFKneT4rTN8gnc0ZvC3trtZxICJc1UGAddp_PS8NSik2a8GI76uqC7B4A3giLbqSfVxVEIgsxOmsH_AA4T7LrRuu_DjGXUu-gG11cjxMO3Lbnfa-oPI2jiZKZsRSp4rAS7bp8ew4e0_EQJ_kG7eaYlWHy1_VWEbZo4Y1DI8DlW0V6KHAhA; CONTID=7793684; jsContactId=7793684; jsCompanyId=8102806; jsCu=USD; jsDt=d-MMM-yyyy; jsLa=en; cjuMember=0; nav_active_session=true; _pendo_utm.3527410929=%7B%22channel%22%3A%22Direct%22%7D; _pendo_meta.3527410929=806128063; _pendo_sessionId.3527410929=%7B%22sessionId%22%3A%22VFXmk10unQQdfkl3%22%2C%22timestamp%22%3A1792351724398%7D`;

const cookieParts = rawCookie.split(';').map(p => p.trim()).filter(Boolean);
const cookies = cookieParts.map(part => {
  const eqIdx = part.indexOf('=');
  const name = part.substring(0, eqIdx).trim();
  const value = part.substring(eqIdx + 1).trim();
  return {
    name,
    value,
    domain: '.cj.com',
    path: '/',
    httpOnly: false,
    secure: true,
    sameSite: 'Lax'
  };
});

// Also add cj.com without leading dot for maximum compatibility
const extraCookies = cookies.map(c => ({
  ...c,
  domain: 'members.cj.com'
}));

const allCookies = [...cookies, ...extraCookies];

const storageState = {
  cookies: allCookies,
  origins: [
    {
      origin: 'https://members.cj.com',
      localStorage: [
        { name: 'active_company', value: '8102806' },
        { name: 'nav_active_session', value: 'true' }
      ]
    }
  ]
};

const localOut = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
fs.writeFileSync(localOut, JSON.stringify(storageState, null, 2), 'utf8');
console.log('✅ Local storageState generated at:', localOut, 'with', allCookies.length, 'cookies');
