const TYPE_ICON = { 'medication': '💊', 'therapy': '🏃', 'routine-check': '🩺' };
let allItems = [];
let activeFilter = 'all';

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s ?? '';
    return d.innerHTML;
}

function fmtTime(t) {             
    if (!t) return '';
    const [h, m] = t.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const FREQ_LABEL = {
    'daily': 'Daily',
    'twice-daily': 'Twice Daily',
    'weekly': 'Weekly',
    'as-needed': 'As needed'
};

function scheduleText(it) {
    const times = [it.scheduled_time, it.scheduled_time_2, it.scheduled_time_3]
        .filter(Boolean).map(fmtTime).join(', ');
    const freq = FREQ_LABEL[it.frequency] || it.frequency || '';
    return `${times} ${freq}`.trim();
}

function render() {
    const wrap = document.getElementById('cards');
    const list = allItems.filter(i => activeFilter === 'all' || i.care_type === activeFilter);

    if (!list.length) {
        wrap.innerHTML = '<p>No care items yet.</p>';
        return;
    }
    wrap.innerHTML = list.map((it, idx) => `
        <div class="card${(idx % 2) + 1}">
            <div class="left-msg">
                <div class="icon">${TYPE_ICON[it.care_type] || '💊'}</div>
                <div class="detail">
                    <div class="med-name">${esc(it.item_name)}${it.dosage ? ' ' + esc(it.dosage) : ''}</div>
                    <div class="purpose">${esc(it.purpose)}</div>
                </div>
            </div>
            <div class="right-msg"><div class="time">${esc(scheduleText(it))}</div></div>
        </div>`).join('');
}

async function loadCareItems() {
    try {
        const res = await fetch('PHP/get_care_items.php', { credentials: 'same-origin' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        allItems = data.items;
        render();
    } catch (err) {
        document.getElementById('cards').innerHTML = `<p>Unable to load care items.</p>`;
        console.error(err);
    }
}

async function saveCareItem() {
    const payload = {
        care_type: document.getElementById('careType').value,
        item_name: document.getElementById('careName').value,
        dosage: document.getElementById('dosage').value,
        purpose: document.getElementById('purpose').value,
        scheduled_time: document.getElementById('scheduleTime').value,
        scheduled_time_2: document.getElementById('scheduleTime2').value,
        frequency: document.getElementById('frequency').value,
        notes: document.getElementById('notes').value
    };
    try {
        const res = await fetch('PHP/add_care_items.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || data.error) { alert(data.error || 'Could not save'); return; }
        closeModal();
        document.querySelectorAll('#careModal input, #careModal textarea').forEach(e => e.value = '');
        document.querySelectorAll('#careModal select').forEach(e => e.selectedIndex = 0);
        toggleExtraFields();
        loadCareItems();
    } catch (err) {
        alert('Network error, please try again');
    }
}

function toggleExtraFields() {
    const f = document.getElementById('frequency').value;
    document.getElementById('time2Group').style.display = f === 'twice-daily' ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadCareItems();
    toggleExtraFields();
    document.getElementById('frequency').addEventListener('change', toggleExtraFields);
    document.querySelector('.save-btn').addEventListener('click', saveCareItem);

    const map = { btn1: 'all', btn2: 'medication', btn3: 'therapy', btn4: 'routine-check' };
    Object.entries(map).forEach(([cls, type]) => {
        document.querySelector('.' + cls).addEventListener('click', () => {
            activeFilter = type;
            render();
        });
    });
});