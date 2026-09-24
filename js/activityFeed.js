function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

async function loadSchedule() {
    try {
        const res = await fetch('PHP/get_daily_schedule.php', { credentials: 'same-origin' });
        const data = await res.json();

        const list = document.getElementById('tasklist');
        const remainingLabel = document.getElementById('task-header-right');

        if (data.error || !data.tasks) {
            return;
        }

        remainingLabel.textContent = `${data.remaining} tasks remaining`;

        document.querySelectorAll('.task-card').forEach(el => el.remove());

        data.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-left">
                    <div class="task-time">${formatTime(task.time)}</div>
                    <div class="task-name">${task.name}</div>
                    <div class="task-detail">${task.detail}</div>
                </div>
                <div class="task-right">
                    <div class="task-status">${task.status}</div>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error('Failed to load schedule:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('today-date').textContent =
        new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    loadSchedule();
});