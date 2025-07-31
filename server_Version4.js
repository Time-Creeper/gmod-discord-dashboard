const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = require('node-fetch');

const CLIENT_ID = 'YOUR_DISCORD_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_DISCORD_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/callback';
const GUILD_ID = 'YOUR_GUILD_ID';

const dbPath = path.join(__dirname, 'player_logins.sqlite');
const linkDbPath = path.join(__dirname, 'discord_steam_links.sqlite');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}));

function ensureAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/');
}

// Discord OAuth2 login endpoint
app.get('/login', (req, res) => {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(oauthUrl);
});

// OAuth2 callback
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/');

    // Exchange code for token
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.redirect('/');

    // Get user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userInfo = await userRes.json();
    req.session.user = userInfo;
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// Main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Dashboard: SteamID linking
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

app.post('/link', ensureAuthenticated, (req, res) => {
    const steamid = req.body.steamid;
    const discordId = req.session.user.id;
    let db = new sqlite3.Database(linkDbPath);
    db.run('CREATE TABLE IF NOT EXISTS links (discord_id TEXT PRIMARY KEY, steamid TEXT)', () => {
        db.run('INSERT OR REPLACE INTO links (discord_id, steamid) VALUES (?, ?)', [discordId, steamid], () => {
            db.close();
            res.redirect('/dashboard');
        });
    });
});

// Status API for dashboard
app.get('/api/status', ensureAuthenticated, (req, res) => {
    const discordId = req.session.user.id;
    let linkDb = new sqlite3.Database(linkDbPath);
    linkDb.get('SELECT steamid FROM links WHERE discord_id = ?', [discordId], (err, linkRow) => {
        if (!linkRow) {
            linkDb.close();
            return res.json({ linked: false });
        }
        let gmodDb = new sqlite3.Database(dbPath);
        gmodDb.get('SELECT last_login FROM player_logins WHERE steamid = ?', [linkRow.steamid], (err2, gmodRow) => {
            gmodDb.close();
            linkDb.close();
            if (!gmodRow) return res.json({ linked: true, steamid: linkRow.steamid, last_login: null, status: 'inactive' });
            const now = Math.floor(Date.now() / 1000);
            const twoWeeks = 14 * 24 * 3600;
            const status = (now - gmodRow.last_login < twoWeeks) ? 'active' : 'inactive';
            res.json({ linked: true, steamid: linkRow.steamid, last_login: gmodRow.last_login, status });
        });
    });
});

// Admin dashboard
app.get('/admin', ensureAuthenticated, (req, res) => {
    // Only allow specific Discord user (add your Discord ID below)
    if (req.session.user.id !== 'YOUR_DISCORD_ADMIN_ID') return res.sendStatus(403);
    res.sendFile(path.join(__dirname, 'views/admin.html'));
});

app.get('/api/admin_list', ensureAuthenticated, (req, res) => {
    if (req.session.user.id !== 'YOUR_DISCORD_ADMIN_ID') return res.sendStatus(403);
    let linkDb = new sqlite3.Database(linkDbPath);
    linkDb.all('SELECT discord_id, steamid FROM links', [], (err, rows) => {
        let gmodDb = new sqlite3.Database(dbPath);
        let result = [];
        let pending = rows.length;
        if (pending === 0) return res.json([]);
        rows.forEach(row => {
            gmodDb.get('SELECT last_login FROM player_logins WHERE steamid = ?', [row.steamid], (err2, gmodRow) => {
                const now = Math.floor(Date.now() / 1000);
                const twoWeeks = 14 * 24 * 3600;
                const status = (gmodRow && now - gmodRow.last_login < twoWeeks) ? 'active' : 'inactive';
                result.push({ discord_id: row.discord_id, steamid: row.steamid, last_login: gmodRow ? gmodRow.last_login : null, status });
                if (--pending === 0) {
                    gmodDb.close();
                    linkDb.close();
                    res.json(result);
                }
            });
        });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});