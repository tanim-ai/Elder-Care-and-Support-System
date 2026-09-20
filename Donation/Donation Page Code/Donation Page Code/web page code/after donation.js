/* ==================================================
   CAREDIRECT DONATION PAGE
================================================== */


/* ==================================================
   DOWNLOAD RECEIPT
================================================== */

const downloadReceipt =
    document.getElementById("downloadReceipt");


downloadReceipt.addEventListener("click", function () {

    const receiptText = `
CareDirect
--------------------------------

DONATION RECEIPT

Transaction Status:
Transaction Successful

Donation Amount:
$250.00 USD

Receipt Number:
CD-9926-X82L

Thank you for your generous
contribution.

Your support helps provide
essential care, medication and
specialized meal plans for our
residents.

--------------------------------
CareDirect
`;


    const blob = new Blob(
        [receiptText],
        { type: "text/plain" }
    );


    const url = URL.createObjectURL(blob);


    const link = document.createElement("a");

    link.href = url;

    link.download = "CareDirect-Tax-Receipt.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

});


/* ==================================================
   BACK TO HOME
================================================== */

const backHome =
    document.getElementById("backHome");


backHome.addEventListener("click", function () {

    /*
       If your actual homepage is index.html,
       this will take the user there.
    */

    window.location.href = "index.html";

});


/* ==================================================
   SHARE BUTTON
================================================== */

const shareBtn =
    document.getElementById("shareBtn");


shareBtn.addEventListener("click", async function () {

    const shareData = {
        title: "CareDirect",
        text: "I just supported CareDirect!",
        url: window.location.href
    };


    try {

        if (navigator.share) {

            await navigator.share(shareData);

        } else {

            await navigator.clipboard.writeText(
                window.location.href
            );

            alert("Page link copied!");

        }

    } catch (error) {

        console.log("Sharing cancelled.");

    }

});


/* ==================================================
   COPY LINK
================================================== */

const copyBtn =
    document.getElementById("copyBtn");


copyBtn.addEventListener("click", async function () {

    try {

        await navigator.clipboard.writeText(
            window.location.href
        );

        alert("Page link copied!");

    } catch (error) {

        alert(
            "Unable to copy the link. Please copy it manually."
        );

    }

});