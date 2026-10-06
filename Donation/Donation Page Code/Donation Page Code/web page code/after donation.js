const donationAmount =
    document.getElementById(
        "donationAmount"
    );


const receiptNumber =
    document.getElementById(
        "receiptNumber"
    );


const amountText =
    donationAmount
        ? donationAmount.textContent.trim()
        : "Donation Amount";


const receiptText =
    receiptNumber
        ? receiptNumber.textContent.trim()
        : "Receipt Number";



/* =========================================================
   DOWNLOAD RECEIPT
========================================================= */

const downloadReceipt =
    document.getElementById(
        "downloadReceipt"
    );


if (downloadReceipt) {


    downloadReceipt.addEventListener(
        "click",
        function () {


            const receiptContent = `

CareDirect
================================

DONATION RECEIPT

Transaction Status:
Donation Recorded

Donation Amount:
${amountText}

Receipt Number:
${receiptText}

--------------------------------

Thank you for your generous
contribution.

Your support helps provide
essential care, medication and
specialized meal plans for
our residents.

================================
CareDirect

`;


            const blob =
                new Blob(
                    [receiptContent],
                    {
                        type: "text/plain"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            link.download =
                "CareDirect-Donation-Receipt.txt";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );

        }
    );

}



/* =========================================================
   SHARE BUTTON
========================================================= */

const shareBtn =
    document.getElementById(
        "shareBtn"
    );


if (shareBtn) {


    shareBtn.addEventListener(
        "click",
        async function () {


            const shareData = {

                title:
                    "CareDirect",

                text:
                    "I just supported CareDirect!",

                url:
                    window.location.href

            };


            try {


                if (
                    navigator.share
                ) {

                    await navigator.share(
                        shareData
                    );

                } else {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    alert(
                        "Page link copied!"
                    );

                }


            } catch (error) {

                console.log(
                    "Sharing cancelled."
                );

            }

        }
    );

}



/* =========================================================
   COPY LINK BUTTON
========================================================= */

const copyBtn =
    document.getElementById(
        "copyBtn"
    );


if (copyBtn) {


    copyBtn.addEventListener(
        "click",
        async function () {


            try {


                await navigator.clipboard.writeText(
                    window.location.href
                );


                alert(
                    "Page link copied!"
                );


            } catch (error) {


                alert(
                    "Unable to copy the link. " +
                    "Please copy it manually."
                );

            }

        }
    );

}