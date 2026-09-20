document.addEventListener("DOMContentLoaded", function () {

    const logoutButton =
        document.getElementById("logoutButton");

    const printButton =
        document.getElementById("printButton");

    const dashboardButton =
        document.getElementById("dashboardButton");

    window.openEmergency = function () {

        alert(
            "🚨 Emergency alert sent! Staff have been notified and are on their way."
        );

    };

    if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href = "../../../Login-Registration/login.html";

        }
    );

}

    if (printButton) {

        printButton.addEventListener(
            "click",
            function () {

                window.print();

            }
        );

    }

    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                setActiveNavigation(
                    dashboardButton
                );

            }
        );

    }

    function setActiveNavigation(activeButton) {

        const navItems =
            document.querySelectorAll(".nav-item");


        navItems.forEach(function (item) {

            item.classList.remove("active");

        });


        activeButton.classList.add("active");

    }

});