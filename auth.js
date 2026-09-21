// Shared Supabase magic-link login for Nocturne pages that write data.
// Raw REST calls, no client library (page CSPs allow only same-origin scripts).
// The session is stored per browser + origin; localhost and github.io are separate logins.
// The storage key is shared with media-edit.html, so one login covers every page on an origin.
(function () {
  const SUPABASE_URL = 'https://rthghgzdwqnlzvsoerhz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_RvrKhg03c_vSx1wYwpSNFw_oRVuTVCQ';
  const SESSION_KEY = 'nocturne_media_session';

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function storeSession(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  async function authPost(path, body) {
    const res = await fetch(SUPABASE_URL + '/auth/v1/' + path, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || data.error_description || data.message || ('HTTP ' + res.status));
    return data;
  }

  // The magic link returns to the page with the tokens in the URL fragment.
  // Returns an error string if the link failed, otherwise null.
  function consumeHash() {
    if (!location.hash) return null;
    const p = new URLSearchParams(location.hash.slice(1));
    let error = null;
    if (p.get('error_description')) error = p.get('error_description').replace(/\+/g, ' ');
    else if (p.get('access_token') && p.get('refresh_token')) {
      const exp = Number(p.get('expires_at')) || (Math.floor(Date.now() / 1000) + Number(p.get('expires_in') || 3600));
      storeSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_at: exp });
    } else {
      return null;
    }
    history.replaceState(null, '', location.pathname + location.search);
    return error;
  }

  // Returns a fresh access token, refreshing if it is about to expire.
  // Throws an error with .code = 'auth' when there is no usable session.
  async function getToken() {
    let s = loadSession();
    if (!s) { const e = new Error('not signed in'); e.code = 'auth'; throw e; }
    if (s.expires_at - Date.now() / 1000 < 60) {
      try {
        const d = await authPost('token?grant_type=refresh_token', { refresh_token: s.refresh_token });
        s = {
          access_token: d.access_token,
          refresh_token: d.refresh_token,
          expires_at: d.expires_at || (Math.floor(Date.now() / 1000) + d.expires_in),
        };
        storeSession(s);
      } catch (err) {
        clearSession();
        const e = new Error('session expired'); e.code = 'auth'; throw e;
      }
    }
    return s.access_token;
  }

  async function sendLink(email) {
    const redirect = location.origin + location.pathname;
    await authPost('otp?redirect_to=' + encodeURIComponent(redirect), { email, create_user: false });
  }

  // One authenticated call to the REST API for a given schema.
  async function rest(schema, path, opts) {
    opts = opts || {};
    const token = await getToken();
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + token,
      'Accept-Profile': schema,
      'Content-Profile': schema,
      'Content-Type': 'application/json',
    };
    if (opts.prefer) headers['Prefer'] = opts.prefer;
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) {
      let msg = 'HTTP ' + res.status;
      try { const j = await res.json(); msg = j.message || j.msg || msg; } catch (e) {}
      const e = new Error(msg);
      if (res.status === 401 && /jwt/i.test(msg)) e.code = 'auth';
      throw e;
    }
    return res.status === 204 ? null : res.json();
  }

  window.NAuth = {
    hasSession: () => !!loadSession(),
    consumeHash, getToken, sendLink, rest,
    signOut: () => { clearSession(); },
  };
})();
