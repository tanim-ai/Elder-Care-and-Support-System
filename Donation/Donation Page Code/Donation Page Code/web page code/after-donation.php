<?php

session_start();

require_once "dbconnection.php";


/* =========================================================
   1. CHECK DONATION SESSION
========================================================= */

if (
    !isset($_SESSION["receipt_number"]) ||
    !isset($_SESSION["donor_name"]) ||
    !isset($_SESSION["amount"]) ||
    !isset($_SESSION["payment_method"])
) {

    header("Location: donation.php");
    exit;

}


/* =========================================================
   2. GET SESSION DATA
========================================================= */

$receiptNumber = htmlspecialchars(
    $_SESSION["receipt_number"],
    ENT_QUOTES,
    "UTF-8"
);

$donorName = htmlspecialchars(
    $_SESSION["donor_name"],
    ENT_QUOTES,
    "UTF-8"
);

$amount = number_format(
    (float)$_SESSION["amount"],
    2
);

$paymentMethod = htmlspecialchars(
    $_SESSION["payment_method"],
    ENT_QUOTES,
    "UTF-8"
);


/* =========================================================
   3. GET DONATION STATUS
   USE receipt_number INSTEAD OF id
========================================================= */

$sql = "
    SELECT status
    FROM donations
    WHERE receipt_number = ?
    LIMIT 1
";


$stmt = $conn->prepare($sql);


if (!$stmt) {

    die(
        "Database query preparation failed: " .
        $conn->error
    );

}


$stmt->bind_param(
    "s",
    $_SESSION["receipt_number"]
);


$stmt->execute();


$result = $stmt->get_result();


$donation = $result->fetch_assoc();


$stmt->close();

$conn->close();


/* =========================================================
   4. CHECK DONATION RECORD
========================================================= */

if (!$donation) {

    die(
        "Donation record not found."
    );

}


/* =========================================================
   5. STATUS TEXT
========================================================= */

$status = $donation["status"];


if ($status === "Paid") {

    $statusText =
        "Transaction Successful";

} elseif ($status === "Failed") {

    $statusText =
        "Transaction Failed";

} else {

    $statusText =
        "Donation Recorded";

}

?>


<!DOCTYPE html>

<html lang="en">


<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        CareDirect - Donation Successful
    </title>

    <link
        rel="stylesheet"
        href="after donation.css"
    >

</head>


<body>


<!-- ==================================================
     NAVBAR
================================================== -->

<header class="navbar">

    <a
        href="../../../../Homepage/index.html"
        class="logo"
    >
        CareDirect
    </a>


    <nav class="nav-menu">

        <a
            href="../../../../Homepage/index.html"
            class="nav-link"
        >
            Home
        </a>


        <a
            href="donation.php"
            class="nav-link"
        >
            Donation
        </a>

    </nav>


    <div class="nav-actions">

        <a
            href="../../../../Login-Registration/login.html"
            class="btn-login"
        >
            Log In
        </a>


        <a
            href="../../../../Login-Registration/Registration.html"
            class="btn-signup"
        >
            Sign Up
        </a>

    </div>

</header>



<!-- ==================================================
     MAIN
================================================== -->

<main class="page">


    <!-- Decorative particles -->

    <span class="particle p1"></span>
    <span class="particle p2"></span>
    <span class="particle p3"></span>
    <span class="particle p4"></span>
    <span class="particle p5"></span>
    <span class="particle p6"></span>



    <!-- ==================================================
         SUCCESS CONTAINER
    ================================================== -->

    <section class="success-container">


        <!-- ==================================================
             LEFT IMAGE
        ================================================== -->

        <div class="image-section">

            <img
                src="care-image.jpg"
                alt="CareDirect support"
                class="care-image"
            >

        </div>



        <!-- ==================================================
             RIGHT CONTENT
        ================================================== -->

        <div class="content-section">


            <!-- STATUS -->

            <div class="success-badge">

                <span class="check">
                    ✓
                </span>

                <?php
                echo htmlspecialchars(
                    $statusText,
                    ENT_QUOTES,
                    "UTF-8"
                );
                ?>

            </div>



            <!-- HEADING -->

            <h1>

                Your Kindness<br>

                Transforms Lives

            </h1>



            <!-- DESCRIPTION -->

            <p class="description">

                Thank you
                <?php echo $donorName; ?>,
                for your generous contribution.

                Your support directly provides
                essential care, medication, and
                specialized meal plans for our
                residents.

                We are deeply grateful for your
                partnership in our mission.

            </p>



            <!-- ==================================================
                 DONATION CARD
            ================================================== -->

            <div class="donation-card">


                <div class="info-row">


                    <!-- AMOUNT -->

                    <div class="info-box">

                        <span class="label">
                            Donation Amount
                        </span>

                        <strong
                            class="amount"
                            id="donationAmount"
                        >
                            ৳<?php echo $amount; ?> BDT
                        </strong>

                    </div>



                    <!-- DIVIDER -->

                    <div class="vertical-line"></div>



                    <!-- RECEIPT -->

                    <div class="info-box">

                        <span class="label">
                            Receipt Number
                        </span>

                        <strong
                            class="receipt"
                            id="receiptNumber"
                        >
                            <?php
                            echo $receiptNumber;
                            ?>
                        </strong>

                    </div>


                </div>



                <!-- PAYMENT METHOD -->

                <div class="info-row">

                    <div class="info-box">

                        <span class="label">
                            Payment Method
                        </span>

                        <strong>
                            <?php
                            echo $paymentMethod;
                            ?>
                        </strong>

                    </div>

                </div>



                <!-- ==================================================
                     BUTTONS
                ================================================== -->

                <div class="button-row">


                    <!-- DOWNLOAD -->

                    <button
                        type="button"
                        class="download-btn"
                        id="downloadReceipt"
                    >

                        <span>
                            ⇩
                        </span>

                        Download Receipt

                        <small>
                            (TXT)
                        </small>

                    </button>



                    <!-- BACK HOME -->

                    <a
                        href="../../../../Homepage/index.html"
                        class="back-btn"
                        id="backHome"
                    >

                        <span>
                            ←
                        </span>

                        Back to Home

                    </a>


                </div>


            </div>



            <!-- ==================================================
                 SHARE
            ================================================== -->

            <div class="share-section">

                <span>
                    Share your impact:
                </span>


                <button
                    type="button"
                    class="share-btn"
                    id="shareBtn"
                    aria-label="Share"
                >
                    ↗
                </button>


                <button
                    type="button"
                    class="share-btn"
                    id="copyBtn"
                    aria-label="Copy"
                >
                    ▣
                </button>

            </div>


        </div>


    </section>


</main>



<script src="after donation.js"></script>


</body>

</html>