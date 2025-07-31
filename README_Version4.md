# GMod Discord Dashboard

A super-simple dashboard for players to link their SteamID to Discord, and for admins to view GMod activity, using Discord login.  
No coding experience required!

---

## Features

- Players log in with Discord and link their SteamID.
- Shows last GMod login and Discord "active"/"inactive" status (based on GMod data).
- Admin view for all player links and activity.
- Ready for future Discord bot role syncing.

---

## Step-by-Step Setup

### 1. Requirements

- **Node.js** (Download from [nodejs.org](https://nodejs.org/))
- **A Discord account**
- **Access to your GMod server's `player_logins.sqlite` file** (see below!)

---

### 2. Download the Dashboard

- Click "**Code**" > "**Download ZIP**" on this repo, or clone with:
  ```
  git clone https://github.com/Time-Creeper/gmod-discord-dashboard.git
  ```
- Unzip/extract the folder.

---

### 3. Get Your GMod Data

- From your GMod server, copy the file called **player_logins.sqlite** to this repo folder.
  - If you used the provided Lua script, this file will be in `/garrysmod/data/player_logins.sqlite`.

---

### 4. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it (e.g., "GMod Dashboard").
3. Go to "OAuth2" > "General"  
   - Add Redirect URI: `http://localhost:3000/callback`
4. Copy your **Client ID** and **Client Secret**.
5. Go to "Bot", click "Add Bot", and copy your **Bot Token** (only if you want bot integration later).

---

### 5. Configure the Dashboard

- Open `server.js` in a text editor.
- Find these lines near the top:

  ```js
  const CLIENT_ID = 'YOUR_DISCORD_CLIENT_ID';
  const CLIENT_SECRET = 'YOUR_DISCORD_CLIENT_SECRET';
  const REDIRECT_URI = 'http://localhost:3000/callback';
  const GUILD_ID = 'YOUR_GUILD_ID';
  ```
- Paste your Client ID and Client Secret.
- For now, you can leave `BOT_TOKEN` empty.
- Set `GUILD_ID` to your Discord server's ID (right-click your server icon > "Copy ID"; you may need Developer Mode enabled).

- Find this line:
  ```js
  if (req.session.user.id !== 'YOUR_DISCORD_ADMIN_ID') return res.sendStatus(403);
  ```
  Replace `YOUR_DISCORD_ADMIN_ID` with your Discord user ID (right-click yourself > "Copy ID").

---

### 6. Install and Run

Open a terminal/command prompt in the repo folder:

```sh
npm install
npm start
```

---

### 7. Use the Dashboard

- Go to [http://localhost:3000](http://localhost:3000) in your browser.
- Click "Login with Discord".
- Link your SteamID.
- Admins can visit `/admin` to view all linked users and activity.

---

## Troubleshooting

- If you see errors, double-check you’ve pasted all the Discord app info correctly.
- If `player_logins.sqlite` is missing, make sure your GMod server has run the Lua login tracker script.

---

## Next Steps

- Want Discord bot role syncing? Just ask in an issue or here!
- Want to deploy online? You can use [Glitch](https://glitch.com/), [Replit](https://replit.com/), or a VPS.

---

## Questions?

Open an issue in this repo or ask [Time-Creeper](https://github.com/Time-Creeper)!