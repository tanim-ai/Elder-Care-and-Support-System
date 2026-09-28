function getStatusClass(status) {
    const yellow = ['low', 'high', 'pre-diabetic'];
    const red = ['critical', 'diabetic'];

    if (red.includes(status)) return 'status-red';
    if (yellow.includes(status)) return 'status-yellow';
    return ''; // stable / normal -> default green from .card-tag
}

function setStatusTag(elementId, status) {
    const el = document.getElementById(elementId);
    el.textContent = status;
    el.className = 'card-tag ' + getStatusClass(status);
}

async function loadVitals() {
    try {
        const res = await fetch('PHP/get_vitals.php', { credentials: 'same-origin' });
        const data = await res.json();function getStatusClass(status) {
    if (status === 'stable' || status === 'normal') return ''; // green (default)
    if (status === 'pre-diabetic') return 'status-yellow';
    return 'status-red'; // everything else: low, high, critical, diabetic
}

function setStatusTag(elementId, status) {
    const el = document.getElementById(elementId);
    el.textContent = status;
    el.className = 'card-tag ' + getStatusClass(status);
}

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
        setStatusTag('bp-status', data.blood_pressure.status);

        document.getElementById('hr-value').textContent = data.heart_rate.value;
        setStatusTag('hr-status', data.heart_rate.status);

        document.getElementById('sugar-value').textContent = data.blood_sugar.value;
        document.getElementById('sugar-unit').textContent = data.blood_sugar.unit;
        setStatusTag('sugar-status', data.blood_sugar.status);

        const recorded = new Date(data.recorded_at.replace(' ', 'T'));
        document.getElementById('vitals-last-updated').textContent =
            'Last Updated: ' + recorded.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (err) {
        console.error('Failed to load vitals:', err);
        document.getElementById('vitals-last-updated').textContent = 'Unable to load vitals';
    }
}

document.addEventListener('DOMContentLoaded', loadVitals);

        if (data.error) {
            document.getElementById('vitals-last-updated').textContent =
                data.error === 'No vitals recorded' ? 'No vitals recorded yet' : 'Unable to load vitals';
            return;
        }

        document.getElementById('bp-value').textContent = data.blood_pressure.value;
        setStatusTag('bp-status', data.blood_pressure.status);

        document.getElementById('hr-value').textContent = data.heart_rate.value;
        setStatusTag('hr-status', data.heart_rate.status);

        document.getElementById('sugar-value').textContent = data.blood_sugar.value;
        document.getElementById('sugar-unit').textContent = data.blood_sugar.unit;
        setStatusTag('sugar-status', data.blood_sugar.status);

        const recorded = new Date(data.recorded_at.replace(' ', 'T'));
        document.getElementById('vitals-last-updated').textContent =
            'Last Updated: ' + recorded.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (err) {
        console.error('Failed to load vitals:', err);
        document.getElementById('vitals-last-updated').textContent = 'Unable to load vitals';
    }
}

document.addEventListener('DOMContentLoaded', loadVitals);