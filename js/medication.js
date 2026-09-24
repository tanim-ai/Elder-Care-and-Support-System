function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

async function loadMedications() {
    try {
        const res = await fetch('PHP/get_medications.php', { credentials: 'same-origin' });
        const data = await res.json();

        const body = document.querySelector('.daily-medication-body');
        const progress = document.querySelector('.daily-medication-progress');

        if (data.error || !data.medications) {
            body.innerHTML = '<p>Unable to load medications.</p>';
            return;
        }

        progress.textContent = `${data.taken_count} of ${data.total_count} doses taken`;

        body.innerHTML = '';
        data.medications.forEach(med => {
            const item = document.createElement('div');
            item.className = 'med-item';

            const isCompleted = med.status === 'completed';
            const timeLabel = isCompleted
                ? `Taken at ${formatTime(med.taken_at ? med.taken_at.split(' ')[1]?.slice(0,5) : med.scheduled)}`
                : `Next dose: ${formatTime(med.scheduled)}`;

            item.innerHTML = `
                <h4 class="med-name">💊 ${med.name}</h4>
                <p class="med-taken-time">${timeLabel}</p>
                <p class="med-taken-status${isCompleted ? '' : ' pending'}">${isCompleted ? 'Completed' : 'Pending'}</p>
            `;
            body.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load medications:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadMedications);