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
            emergencyBtn.addEventListener("click", (e) => {
                e.preventDefault();
                alert("🚨 Emergency alert sent! Staff have been notified and are on their way.");
            });
        }
    });