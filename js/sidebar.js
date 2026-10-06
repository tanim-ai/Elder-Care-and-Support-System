fetch("sidebar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebar").innerHTML = data;

        const currentPage = window.location.pathname.split("/").pop();
        const links = document.querySelectorAll(".sidebar ul li a");

        links.forEach(link => {
            const linkPage = link.getAttribute("href").split("/").pop();
            if (linkPage === currentPage) {
                link.parentElement.classList.add("active");
            }
        });

        fetch("PHP/get_user_info.php")
            .then(response => response.json())
            .then(info => {
                if (info.error) return;

                const nameEl = document.getElementById("guardianName");
                if (nameEl) nameEl.textContent = info.guardian_name;

                const elderIdEl = document.getElementById("elderIdValue");
                if (elderIdEl) elderIdEl.textContent = info.resident_id;
            });

        const emergencyBtn = document.getElementById("emergencyBtn");
        if (emergencyBtn) {
            emergencyBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                if (emergencyBtn.dataset.sending) return;
                emergencyBtn.dataset.sending = "1";
                try {
                    const response = await fetch("PHP/emergency.php", { method: "POST", credentials: "same-origin" });
                    const result = await response.json();
                    alert(result.message || result.error || "Unable to record SOS. Contact staff directly.");
                } catch {
                    alert("Unable to record SOS. Contact staff directly.");
                } finally { delete emergencyBtn.dataset.sending; }
            });
        }
    });