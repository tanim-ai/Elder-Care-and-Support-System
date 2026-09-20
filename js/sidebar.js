fetch("sidebar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebar").innerHTML = data;

        // Set active item based on current page
        const currentPage = window.location.pathname.split("/").pop();
        const links = document.querySelectorAll(".sidebar ul li a");

        links.forEach(link => {
            const linkPage = link.getAttribute("href").split("/").pop();
            if (linkPage === currentPage) {
                link.parentElement.classList.add("active");
            }
        });

        // Populate elder ID linked to this guardian
        const elderId = localStorage.getItem("elderId") || "EL-2024-0817";
        const elderIdEl = document.getElementById("elderIdValue");
        if (elderIdEl) {
            elderIdEl.textContent = elderId;
        }

        // Emergency alert
        const emergencyBtn = document.getElementById("emergencyBtn");
        if (emergencyBtn) {
            emergencyBtn.addEventListener("click", (e) => {
                e.preventDefault();
                alert("🚨 Emergency alert sent! Staff have been notified and are on their way.");
            });
        }
    });