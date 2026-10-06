document.addEventListener("DOMContentLoaded", () => {
    fetch("PHP/get_accommodation.php")
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) {
                console.error(data.error || "Failed to load accommodation data");
                return;
            }

            const roomLabel = data.room_number
                ? `${data.service_name} Room : ${data.room_number}`
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

                if (upgradeBtn) {
                    const showPending = () => {
                        upgradeBtn.textContent = "Upgrade requested - awaiting approval";
                        upgradeBtn.style.pointerEvents = "none";
                        upgradeBtn.style.opacity = "0.7";
                    };

                    // already requested?
                    fetch("PHP/request_upgrade.php", { credentials: "same-origin" })
                        .then((r) => r.json())
                        .then((s) => {
                            if (s.success && s.pending) showPending();
                            else if (s.success && s.status === "rejected" && s.note) upgradeBtn.title = "Last request declined: " + s.note;
                        })
                        .catch(() => {});

                    upgradeBtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        if (!confirm("Request an upgrade to the Premium plan? Staff will assign a private room and confirm it.")) return;
                        try {
                            const res = await fetch("PHP/request_upgrade.php", { method: "POST", credentials: "same-origin" });
                            const result = await res.json();
                            if (result.success) {
                                alert("Request sent. Your plan changes once staff approve it and assign a room.");
                                showPending();
                            } else {
                                alert(result.message || "Could not send the request. Please try again.");
                            }
                        } catch (err) {
                            alert("Something went wrong. Please check your connection and try again.");
                        }
                    });
                }
            }
        })
        .catch((err) => console.error("Error fetching accommodation data:", err));
});