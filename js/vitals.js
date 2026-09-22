async function loadVitals() {
    try {
        const res = await fetch('PHP/get_vitals.php', { credentials: 'same-origin' });
        const data = await res.json();

        if (data.error) {
            document.getElementById('vitals-last-updated').textContent =
                data.error === 'No vitals recorded' ? 'No vitals recorded yet' : 'Unable to load vitals';
            return;
        }

        document.getElementById('bp-value').textContent = data.blood_pressure.value;
        document.getElementById('bp-status').textContent = data.blood_pressure.status;

        document.getElementById('hr-value').textContent = data.heart_rate.value;
        document.getElementById('hr-status').textContent = data.heart_rate.status;

        document.getElementById('sugar-value').textContent = data.blood_sugar.value;
        document.getElementById('sugar-unit').textContent = data.blood_sugar.unit;
        document.getElementById('sugar-status').textContent = data.blood_sugar.status;

        const recorded = new Date(data.recorded_at.replace(' ', 'T'));
        document.getElementById('vitals-last-updated').textContent =
            'Last Updated: ' + recorded.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (err) {
        console.error('Failed to load vitals:', err);
        document.getElementById('vitals-last-updated').textContent = 'Unable to load vitals';
    }
}

document.addEventListener('DOMContentLoaded', loadVitals);