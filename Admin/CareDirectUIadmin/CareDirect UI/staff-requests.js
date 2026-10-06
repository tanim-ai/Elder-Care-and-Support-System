// Live requests from guardian, resident and kitchen portals.
(() => {
  const endpoint = '../../../PHP/staff_requests.php';
  const panel = document.createElement('section');
  panel.style.cssText = 'background:white;color:#172b35;padding:20px;margin:20px;border:2px solid #c73c3c;border-radius:12px';
  panel.setAttribute('aria-live', 'polite');
  document.body.append(panel);
  let busy = false;
  async function action(id, action, room = '') {
    const response = await fetch(endpoint, {method:'POST', credentials:'same-origin', body:new URLSearchParams({id, action, room})});
    const result = await response.json();
    if (!result.success) throw new Error(result.error || result.message);
  }
  function row(text, buttons) {
    const div = document.createElement('div');
    div.style.cssText = 'padding:12px;border-bottom:1px solid #ddd';
    const label = document.createElement('p'); label.textContent = text; div.append(label);
    buttons.forEach(([label, callback]) => {
      const button = document.createElement('button'); button.textContent = label;
      button.style.cssText = 'margin-right:10px;padding:8px;cursor:pointer';
      button.onclick = async () => { busy = true; button.disabled = true; try { await callback(); } catch(e) { alert(e.message); } finally { busy = false; await refresh(); } };
      div.append(button);
    });
    panel.append(div);
  }
  async function refresh() {
    if (busy) return;
    try {
      const response = await fetch(endpoint, {credentials:'same-origin', cache:'no-store'});
      const data = await response.json();
      if (!data.success) throw new Error(data.error || data.message);
      panel.replaceChildren();
      const heading = document.createElement('h2');
      heading.textContent = `Live SOS alerts (${data.alerts.length}) and Premium requests (${data.upgrades.length})`;
      panel.append(heading);
      data.alerts.forEach(a => row(`${a.actor_role} SOS — ${a.full_name || 'Kitchen'}: ${a.message} (${a.created_at})`, [['Resolve', () => action(a.alert_id, 'resolve')]]));
      data.upgrades.forEach(q => row(`Premium requested by ${q.full_name}`, [
        ['Approve and assign room', async () => { const room = prompt('Confirmed Premium room number:'); if (room?.trim()) await action(q.request_id, 'approve', room.trim()); }],
        ['Decline', async () => { if (confirm('Decline this upgrade?')) await action(q.request_id, 'reject'); }]
      ]));
    } catch { panel.textContent = 'Live SOS alerts and Premium requests could not be loaded. Check the server connection.'; }
  }
  refresh(); setInterval(refresh, 10000);
})();
