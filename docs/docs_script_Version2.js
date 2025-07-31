async function loadLogins() {
  const resp = await fetch('player_logins.txt');
  if (!resp.ok) {
    document.getElementById('logins').innerText = "Login data not found.";
    return;
  }
  const text = await resp.text();
  const lines = text.trim().split('\n').filter(Boolean);
  let html = '<table><tr><th>SteamID</th><th>Last Login (UTC)</th></tr>';
  for (const line of lines) {
    const [steamid, timestamp] = line.split(',');
    const dateStr = new Date(Number(timestamp) * 1000).toISOString().replace('T', ' ').replace('.000Z','');
    html += `<tr><td>${steamid}</td><td>${dateStr}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('logins').innerHTML = html;
}
loadLogins();