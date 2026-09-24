function formatActivityTime(dateTimeStr) {
    const date = new Date(dateTimeStr.replace(' ', 'T'));
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + `, ${time}`;
}

async function loadActivityFeed() {
    try {
        const res = await fetch('PHP/get_activity_feed.php', { credentials: 'same-origin' });
        const data = await res.json();

        const list = document.querySelector('.activity-list');

        if (data.error || !data.activities) {
            list.innerHTML = '<p>Unable to load activity feed.</p>';
            return;
        }

        if (data.activities.length === 0) {
            list.innerHTML = '<p>No recent activity.</p>';
            return;
        }

        list.innerHTML = '';
        data.activities.forEach(act => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <span class="activity-time">${formatActivityTime(act.taken_at)}</span>
                <p class="activity-name">${act.title}</p>
                <p class="activity-desc">${act.description ?? ''}</p>
            `;
            list.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load activity feed:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadActivityFeed);