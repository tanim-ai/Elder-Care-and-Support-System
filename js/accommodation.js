document.addEventListener("DOMContentLoaded", () => {
    fetch("php/get_accommodation.php")
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) {
                console.error(data.error || "Failed to load accommodation data");
                return;
            }

            const roomLabel = data.room_number
                ? `${data.service_name} Room - Room ${data.room_number}`
                : `${data.service_name} Room`;

            document.getElementById("room-label").textContent = roomLabel;
            document.getElementById("since-label").textContent = data.since ?? "—";

            const standardBadge = document.getElementById("standard-badge");
            const premiumBadge = document.getElementById("premium-badge");
            const upgradeBtn = document.getElementById("upgrade-btn");

            if (data.service_code === "premium") {
                premiumBadge.textContent = "Active";
                premiumBadge.className = "active-room";
                standardBadge.textContent = "Not active";
                standardBadge.className = "not-active-room";
                if (upgradeBtn) upgradeBtn.remove();
            } else {
                standardBadge.textContent = "Active";
                standardBadge.className = "active-room";
                premiumBadge.textContent = "Not active";
                premiumBadge.className = "not-active-room";
            }
        })
        .catch((err) => console.error("Error fetching accommodation data:", err));
});