const ICONS = {
    medication: '💊',
    therapy: '🧘',
    'routine-check': '🩺',
    meal: '🍽️',
    vitals: '❤️',
    event: '📝',
    alert: '🚨'
};

const STATUS_LABELS = {
    done: 'Done',
    missed: 'Missed',
    now: 'Due now',
    overdue: 'Overdue',
    upcoming: 'Upcoming'
};

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function classify(logStatus, mins) {
    if (logStatus === 'completed') return 'done';
    if (logStatus === 'missed' || logStatus === 'skipped') return 'missed';
    if (mins > 30) return 'upcoming';
    if (mins >= -30) return 'now';
    return 'overdue';
}

function todayString() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}
async function fetchSchedule() {
    const res = await fetch(`PHP/get_daily_schedule.php?date=${todayString()}`, {
        credentials: 'same-origin'
    });
    const data = await res.json();

    if (!data.success) {
        return { error: data.error || 'Could not load the schedule.' };
    }

    const now = new Date();

    const tasks = data.schedule
        .filter(item => item.scheduled_time && item.frequency !== 'as-needed')
        .map(item => {
            const [h, m] = item.scheduled_time.split(':').map(Number);
            const due = new Date();
            due.setHours(h, m, 0, 0);
            const mins = Math.round((due - now) / 60000);
            const state = classify(item.medication_status, mins);

            return {
                time: item.scheduled_time.slice(0, 5),
                name: item.item_name,
                detail: item.purpose || '',
                state: state,
                status: STATUS_LABELS[state],
                type: item.care_type,
                sort_sec: h * 3600 + m * 60
            };
        })
        .sort((a, b) => a.sort_sec - b.sort_sec);

    const remaining = tasks.filter(t => ['now', 'upcoming', 'overdue'].includes(t.state)).length;

    return { tasks, remaining };
}

let firstLoad = true;

async function loadSchedule() {
    try {
        const data = await fetchSchedule();

        const list = document.getElementById('tasklist');
        const remainingLabel = document.getElementById('task-header-right');

        document.querySelectorAll('.task-card').forEach(el => el.remove());

        if (data.error || !data.tasks) {
            const msg = document.createElement('div');
            msg.className = 'task-card';
            msg.textContent = data.error || 'Could not load the schedule.';
            list.appendChild(msg);
            return;
        }

        remainingLabel.textContent = `${data.remaining} tasks remaining`;

        if (data.tasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'task-card';
            empty.textContent = 'Nothing scheduled for today.';
            list.appendChild(empty);
            return;
        }

        data.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.state}`;
            card.innerHTML = `
                <div class="task-left">
                    <div class="task-time">${formatTime(task.time)}</div>
                    <div class="task-name">${ICONS[task.type] || '•'} ${escapeHtml(task.name)}</div>
                    <div class="task-detail">${escapeHtml(task.detail)}</div>
                </div>
                <div class="task-right">
                    <div class="task-status status-${task.state}">${escapeHtml(task.status)}</div>
                </div>
            `;
            list.appendChild(card);
        });

        if (firstLoad) {
            firstLoad = false;
            const target = document.querySelector('.task-card.now, .task-card.overdue, .task-card.upcoming');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (err) {
        console.error('Failed to load schedule:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('today-date').textContent =
        new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    loadSchedule();

    setInterval(loadSchedule, 60000);
});