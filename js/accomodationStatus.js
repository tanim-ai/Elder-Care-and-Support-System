document.addEventListener("DOMContentLoaded", () => {
    fetch("php/get_accommodation.php")
        .then((res) => res.json())
        .then((data) => {
            if (!data.success) return;

            if (data.service_code === "premium") {
                const link = document.getElementById("upgrade-accommodation-link");
                if (link) link.style.display = "none"; // already on the top tier, nothing to upgrade to
            }
        })
        .catch(() => {});
});