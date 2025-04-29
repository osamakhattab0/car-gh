function printInvoice() {
    const printableSections = [
        document.querySelector('.header'),
        document.querySelector('.section2'),
        document.querySelector('.client-info'),
        document.querySelector('#section-six'),
        document.querySelector('#section-seven'),
        document.querySelector('#section6'),
    ];

    let contentToPrint = '';
    printableSections.forEach(section => {
        if (section) {
            const clonedSection = section.cloneNode(true);
            const inputs = clonedSection.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.textContent = input.value;
                input.parentNode.replaceChild(span, input);
            });
            contentToPrint += clonedSection.outerHTML;
        }
    });

    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
        <html>
            <head>
                <title>طباعة الفاتورة</title>
                <style>
@media print {
    body {
        font-family: 'Cairo', sans-serif;
        margin: 0;
        padding: 0;
        direction: rtl;
        text-align: right;
        font-size: 10px;
    }


    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .header .invoice-number {
        font-size: 18px;
        font-weight: bold;
        margin: 0 47px;
    }

    .age {
        size: A4;
        margin: 1cm;
    }

    .client-info input {
        width: 210%;
        padding: 8px;
        font-size: 14px;
        margin-bottom: 8px;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-sizing: border-box;
        margin-left: 0px;
    }

    .section,
    .table {
        margin-bottom: 0px;
        padding: 10px;
        border: 1px solid #000;
        border-radius: 5px;
        width: 100%;
        /* العرض المطلوب */
    }

    .client-info {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 100%;
        margin-right: 20px;
        font-size: 14;
    }

    .client-info label {
        display: inline-block;
        margin-bottom: 5px;
        font-weight: bold;
        width: 55%;
    }

    #section-seven {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        width: 88.5%;
        border: 1px solid #0c0000;
        margin-left: 90px;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
    }

    .table th,
    .table td {
        border: 1px solid #000;
        padding: 5px;
        text-align: center;
        font-size: 12px;
    }

    /* تصغير QR Code */
    #qrcode {
        width: 130px;
        /* العرض المطلوب */
        height: 130px;
        /* الارتفاع المطلوب */
        margin: 0 auto;
        /* توسيط الكود */
    }

    .client-info .barcode {
        width: 130px;
        /* العرض المطلوب */
        height: 130px;
        /* الارتفاع المطلوب */
        margin: 0 auto;
        /* توسيط الكود */
    }

    #payment-info label {
        width: 30%;
        font-weight: bold;
    }

    p {
        font-size: 14px;
        margin: 2px 0;
        text-align: center;

    }


    .footer {
        display: flex;
        align-items: center;
        margin-top: 20px;
        gap: 29%;

    }
}
                </style>
            </head>
            <body>
                ${contentToPrint}
            </body>
        </html>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
}

// تحسين كود عرض تفاصيل الفاتورة بطريقة منظمة واحترافية

// --- وظائف مساعدة ---

/**
 * عرض رسالة تنبيه منسقة
 * @param {string} message - نص الرسالة
 */
function showAlert(message) {
    alert(`\u26A0\uFE0F ${message}`);
}

/**
 * التعامل مع أخطاء الفetch
 * @param {Response} response 
 */
function handleFetchError(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// --- جلب البيانات ---

/**
 * جلب بيانات الفاتورة الرئيسية بناءً على رقم الفاتورة
 */
function fetchInvoiceDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceNumber = urlParams.get('invoiceNumber');

    if (!invoiceNumber) {
        showAlert('رقم الفاتورة غير متوفر في الرابط.');
        return;
    }

    fetch(`http://localhost:3000/api/invoices/${invoiceNumber}`)
        .then(handleFetchError)
        .then(invoiceData => {
            populateInvoiceDetails(invoiceData);
            return fetchInvoiceItems(invoiceNumber);
        })
        .catch(error => {
            console.error('خطأ أثناء جلب الفاتورة:', error);
            showAlert('تعذر تحميل بيانات الفاتورة.');
        });
}

/**
 * جلب أصناف الفاتورة
 * @param {string} invoiceNumber 
 */
function fetchInvoiceItems(invoiceNumber) {
    return fetch(`http://localhost:3000/api/invoice-items/${invoiceNumber}`)
        .then(handleFetchError)
        .then(itemsData => {
            populateInvoiceItems(itemsData);
        })
        .catch(error => {
            console.error('خطأ أثناء جلب الأصناف:', error);
            showAlert('تعذر تحميل بيانات الأصناف.');
        });
}

// --- تعبئة البيانات ---

/**
 * تعبئة تفاصيل الفاتورة في الحقول
 * @param {object} invoice 
 */
function populateInvoiceDetails(invoice) {
    const fields = {
        invoiceNumber: invoice.invoice_number,
        currentDate: `التاريخ: ${invoice.date}`,
        currentTime: `الوقت: ${invoice.time}`,
        clientName: invoice.client_name,
        clientPhone: invoice.client_phone,
        clientAddress: invoice.client_address,
        clientCarType: invoice.car_type,
        clientChassisNumber: invoice.chassis_number,
        warrantyPeriod: invoice.warranty_Period,
        totalUnits: invoice.total_units,
        discountValue: invoice.discount,
        clientCode: invoice.clientCode || 'غير متوفر',
        previousBalance: invoice.previousBalance || 0,
        amountDue: invoice.amount_due,
        currentBalance: invoice.current_balance,
        outstandingAmount: invoice.outstanding_amount,
        discountPercent: invoice.discount_percent,
        vatPercent: invoice.vat_percent,
        vatValue: invoice.vat_value,
        finalTotal: invoice.final_total,
    };

    for (const id in fields) {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'SPAN' || element.tagName === 'DIV') {
                element.innerText = fields[id];
            } else {
                element.value = fields[id];
            }
        }
    }
}

/**
 * تعبئة جدول الأصناف
 * @param {Array} items 
 */
function populateInvoiceItems(items) {
    const tableBody = document.querySelector('#invoiceTable tbody');
    tableBody.innerHTML = '';

    items.forEach((item, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${item.item_name}" readonly></td>
            <td><input type="text" value="${item.description}" readonly></td>
            <td><input type="number" value="${item.quantity}" readonly></td>
            <td><input type="number" value="${item.price}" readonly></td>
            <td><input type="number" value="${item.total}" readonly></td>
        `;

        tableBody.appendChild(row);
    });
}

// --- البحث في الفواتير ---

/**
 * البحث عن فاتورة برقمها
 */
function fetchInvoiceByNumber() {
    const invoiceNumber = document.getElementById('searchInvoiceNumber').value.trim();

    if (!invoiceNumber) {
        showAlert('يرجى إدخال رقم الفاتورة للبحث.');
        return;
    }

    fetch(`http://localhost:3000/api/invoices/${invoiceNumber}`)
        .then(handleFetchError)
        .then(invoice => {
            populateInvoiceDetails(invoice);
            return fetch(`http://localhost:3000/api/invoice-items/${invoiceNumber}`);
        })
        .then(handleFetchError)
        .then(items => populateInvoiceItems(items))
        .catch(error => {
            console.error('خطأ أثناء البحث:', error);
            showAlert('تعذر العثور على الفاتورة أو الأصناف.');
        });
}

// --- إنشاء QR Code ---

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceNumber = urlParams.get("invoiceNumber");

    if (invoiceNumber) {
        const qrContainer = document.getElementById("qrcode");
        if (qrContainer) {
            new QRCode(qrContainer, {
                text: `http://localhost:3000/api/invoices/${invoiceNumber}`,
                width: 215,
                height: 220
            });
        } else {
            console.error("لم يتم العثور على عنصر qrcode.");
        }
    }
});

// --- تحميل بيانات الفاتورة عند فتح الصفحة ---
window.onload = fetchInvoiceDetails;
