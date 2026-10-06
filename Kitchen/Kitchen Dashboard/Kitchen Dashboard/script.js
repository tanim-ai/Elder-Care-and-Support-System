document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "api";
    const LOGIN_URL = "../../../Login-Registration/login.html";
    const printButton = document.getElementById("printButton");
    const dashboardButton = document.getElementById("dashboardButton");
    const staffName = document.getElementById("staffName");
    const staffWelcome = document.getElementById("staffWelcome");
    const logoutButton = document.getElementById("logoutButton");
    let currentMeal = "lunch";

    if (staffName) staffName.textContent = "Kitchen Portal";
    if (staffWelcome) staffWelcome.textContent = "Welcome, Chef";

    async function api(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: { "Content-Type": "application/json", ...(options.headers || {}) },
            ...options
        });
        let data;
        try { data = await response.json(); }
        catch { throw new Error("Invalid server response."); }
        if (response.status === 401) { window.location.href = LOGIN_URL; throw new Error("Session expired."); }
        if (!response.ok) throw new Error(data.message || "Request failed.");
        return data;
    }

    function escapeHTML(value) {
        return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function formatName(name) {
        const parts = String(name || "").trim().split(/\s+/);
        if (parts.length <= 1) return escapeHTML(name);
        const first = parts.shift();
        return `${escapeHTML(first)}<br>${escapeHTML(parts.join(" "))}`;
    }

    function dietClass(flag) {
        return flag === "low-salt" ? "low-salt-badge" : flag === "sugar-free" ? "sugar-badge" : "regular-badge";
    }

    function dietLabel(flag) {
        return flag === "sugar-free" ? "SUGAR-FREE" : flag === "low-salt" ? "LOW-SALT" : "REGULAR";
    }

    function serviceStartsText(nextMeal) {
        if (!nextMeal) return "--";
        const target = new Date();
        const [h, m] = nextMeal.service_time.split(":").map(Number);
        target.setHours(h, m, 0, 0);
        const diff = Math.max(0, Math.round((target - new Date()) / 60000));
        if (diff < 60) return `${diff} min`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    }

    function updateDashboard(data) {
        const summary = document.querySelectorAll(".meal-summary-item strong");
        if (summary[0]) summary[0].textContent = data.summary.low_salt;
        if (summary[1]) summary[1].textContent = data.summary.sugar_free;
        if (summary[2]) summary[2].textContent = data.summary.regular_diet;

        const nextTime = document.querySelector(".next-meal strong");
        const nextText = document.querySelector(".next-meal span");
        if (data.next_meal) {
            if (nextTime) nextTime.textContent = data.next_meal.service_time.substring(0, 5);
            if (nextText) nextText.textContent = `Next: ${data.next_meal.meal_type.charAt(0).toUpperCase() + data.next_meal.meal_type.slice(1)}`;
        } else {
            if (nextTime) nextTime.textContent = "--:--";
            if (nextText) nextText.textContent = "No more meals";
        }

        const cooler = document.querySelector(".status-box:nth-child(1) strong");
        if (cooler) {
            const temperature = data.cooler.temperature_c === null ? "--" : `${data.cooler.temperature_c}°C`;
            const status = data.cooler.status ? data.cooler.status.charAt(0).toUpperCase() + data.cooler.status.slice(1) : "Unknown";
            cooler.innerHTML = `${escapeHTML(temperature)} <small>${escapeHTML(status)}</small>`;
        }

        const serviceStarts = document.querySelector(".status-box:nth-child(2) strong");
        if (serviceStarts) serviceStarts.textContent = serviceStartsText(data.next_meal);

        const staff = document.querySelector(".status-box:nth-child(3) strong");
        if (staff) staff.textContent = `${data.staff.active}/${data.staff.total}`;

        const heading = document.querySelector(".checklist-heading h2");
        if (heading) heading.textContent = `${currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)} Checklist (Next Meal)`;

        const rows = document.querySelectorAll(".resident-row");
        data.residents.forEach((resident, index) => {
            if (!rows[index]) return;
            const row = rows[index];
            row.style.display = "grid";
            const name = row.querySelector(".resident-details strong");
            const room = row.querySelector(".resident-details small");
            const badge = row.querySelector(".diet-badge");
            const pref = row.querySelector(".preference-text");
            const status = row.querySelector(".check-status");
            if (name) name.innerHTML = formatName(resident.full_name);
            if (room) room.textContent = `Room ${escapeHTML(resident.room_number)}`;
            if (badge) { badge.className = `diet-badge ${dietClass(resident.diet_flag)}`; badge.textContent = dietLabel(resident.diet_flag); }
            if (pref) pref.textContent = resident.preferences || "No special preference";
            if (status) {
                const served = resident.meal_status === "served";
                status.innerHTML = served ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-regular fa-circle"></i>';
                status.title = served ? "Meal served" : "Click to mark meal as served";
                status.style.cursor = served ? "default" : "pointer";
                status.onclick = served ? null : async function () {
                    try {
                        await api("mark_served.php", {
                            method: "POST",
                            body: JSON.stringify({ resident_id: resident.resident_id, service_date: data.date, meal_type: currentMeal })
                        });
                        await loadDashboard();
                    } catch (e) { alert(e.message); }
                };
            }
        });
        for (let i = data.residents.length; i < rows.length; i++) rows[i].style.display = "none";
    }

    async function loadDashboard() {
        const today = new Date().toISOString().slice(0, 10);
        const data = await api(`dashboard.php?date=${encodeURIComponent(today)}&meal=${currentMeal}`);
        updateDashboard(data);
    }

    window.openEmergency = async function () {
        const message = window.prompt("Emergency message:", "Kitchen emergency - immediate assistance required.");
        if (message === null) return;
        try {
            const data = await api("emergency.php", {
                method: "POST",
                body: JSON.stringify({ resident_id: null, message: message.trim() || "Kitchen emergency - immediate assistance required." })
            });
            alert(`🚨 ${data.message}`);
        } catch (e) { alert(`Emergency alert failed: ${e.message}`); }
    };

    if (logoutButton) {
        logoutButton.addEventListener("click", async function (event) {
            event.preventDefault();
            try { await api("logout.php", { method: "POST" }); } catch (e) { console.error(e); }
            window.location.href = LOGIN_URL;
        });
    }

    if (printButton) printButton.addEventListener("click", () => window.print());

    if (dashboardButton) dashboardButton.addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
        dashboardButton.classList.add("active");
        loadDashboard().catch(error => alert(error.message));
    });

    loadDashboard().catch(error => {
        console.error("Dashboard loading failed:", error);
        alert("Unable to load the dashboard. Please check that Apache, MySQL and the CareDirect database are running.");
    });
});
