// وظيفة لحساب الإجمالي للصف
function calculateRowTotal(element) {
    const row = element.closest('tr');
    const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = quantity * price;
    row.querySelector('.row-total').innerText = total.toFixed(2);
}

// وظيفة لإضافة صف جديد
function addRow() {
    const table = document.getElementById('invoiceTable').querySelector('tbody');
    const newRow = document.createElement('tr');
    const rowCount = table.rows.length + 1;

    newRow.innerHTML = `
                    <td>${rowCount}</td>
                    <td><input type="text" placeholder=" "></td>
                    <td><input type="text" placeholder=""></td>
                    <td><input type="number" class="quantity" oninput="calculateRowTotal(this)" placeholder=""></td>
                    <td><input type="number" class="price" oninput="calculateRowTotal(this)" placeholder=""></td>
                    <td class="row-total"></td>
                    <td><button onclick="removeRow(this)">حذف</button></td>
                `;

    table.appendChild(newRow);
}

// وظيفة لحذف صف
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();

    // تحديث الأرقام
    const rows = document.querySelectorAll('#invoiceTable tbody tr');
    rows.forEach((row, index) => {
        row.querySelector('td:first-child').innerText = index + 1;
    });
}

// وظيفة لتوليد رقم فاتورة بناءً على الطابع الزمني
function generateInvoiceNumber() {
    const timestamp = Date.now(); // الوقت الحالي بالطابع الزمني
    const invoiceNumber = `#${timestamp}`; // صيغة رقم الفاتورة
    document.getElementById('invoiceNumber').innerText = invoiceNumber; // عرض الرقم في الفاتورة
}

// استدعاء الوظيفة عند تحميل الصفحة
window.onload = generateInvoiceNumber;

function calculateRowTotal(element) {
    const row = element.closest('tr');
    const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;
    const total = quantity * price;
    row.querySelector('.row-total').innerText = total.toFixed(2);

    // إعادة حساب إجمالي العمود السابع بعد كل تعديل
    calculateTotalPrice();
}

function calculateTotalPrice() {
    const rowTotals = document.querySelectorAll('.row-total'); // تحديد جميع خلايا الإجمالي
    let grandTotal = 0;

    rowTotals.forEach(cell => {
        const value = parseFloat(cell.innerText) || 0; // جمع القيم
        grandTotal += value;
    });

    // تحديث حقل "مجموع الوحدات"
    document.getElementById('totalUnits').value = grandTotal.toFixed(2);
}

// وظيفة لإضافة صف جديد مع الأحداث المناسبة
function addRow() {
    const table = document.getElementById('invoiceTable').querySelector('tbody');
    const newRow = document.createElement('tr');
    const rowCount = table.rows.length + 1;

    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder=" "></td>
        <td><input type="text" placeholder=""></td>
        <td><input type="number" class="quantity" oninput="calculateRowTotal(this)" placeholder=""></td>
        <td><input type="number" class="price" oninput="calculateRowTotal(this)" placeholder=""></td>
        <td class="row-total">0.00</td>
        <td><button onclick="removeRow(this)">حذف</button></td>
    `;

    table.appendChild(newRow);

    // إعادة حساب الإجمالي عند إضافة صف جديد
    calculateTotalPrice();
}

// وظيفة لحذف صف
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();

    // تحديث أرقام الصفوف
    const rows = document.querySelectorAll('#invoiceTable tbody tr');
    rows.forEach((row, index) => {
        row.querySelector('td:first-child').innerText = index + 1;
    });

    // إعادة حساب الإجمالي بعد حذف الصف
    calculateTotalPrice();
}

// استدعاء حساب الإجمالي عند تحميل الصفحة
window.onload = calculateTotalPrice;


function calculateDiscount() {
    const totalUnits = parseFloat(document.getElementById('totalUnits').value) || 0; // مجموع الوحدات
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0; // نسبة الخصم

    // حساب قيمة الخصم
    const discountValue = (totalUnits * discountPercent) / 100;

    // حساب المبلغ المتبقي بعد الخصم
    const amountDue = totalUnits - discountValue;

    // تحديث الحقول
    document.getElementById('discountValue').value = discountValue.toFixed(2); // قيمة الخصم
    document.getElementById('amountDue').value = amountDue.toFixed(2); // المبلغ المطلوب
}

// إعادة حساب المبالغ عند تغيير مجموع الوحدات
function calculateTotalPrice() {
    const rowTotals = document.querySelectorAll('.row-total'); // تحديد جميع خلايا الإجمالي
    let grandTotal = 0;

    rowTotals.forEach(cell => {
        const value = parseFloat(cell.innerText) || 0; // جمع القيم
        grandTotal += value;
    });

    // تحديث حقل "مجموع الوحدات"
    document.getElementById('totalUnits').value = grandTotal.toFixed(2);

    // إعادة حساب الخصم والمبلغ المتبقي
    calculateDiscount();
}

// استدعاء الوظائف عند تغيير القيم
document.querySelectorAll('.quantity, .price').forEach(input => {
    input.addEventListener('input', () => {
        calculateRowTotal(input); // حساب إجمالي الصف
        calculateTotalPrice();   // حساب المجموع الكلي
    });
});

function updateDateTime() {
    const now = new Date(); // الحصول على التاريخ والوقت الحاليين

    // تنسيق التاريخ
    const formattedDate = now.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // تنسيق الوقت
    const formattedTime = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // عرض الوقت بنظام 24 ساعة
    });

    // تحديث النصوص في العناصر
    document.getElementById('currentDate').innerText = `التاريخ: ${formattedDate}`;
    document.getElementById('currentTime').innerText = `الوقت: ${formattedTime}`;
}

// استدعاء الدالة عند تحميل الصفحة
window.onload = function () {
    updateDateTime();
    setInterval(updateDateTime, 1000); // تحديث الوقت كل ثانية
};
// استدعاء نافذة الطباعة الافتراضية
function printInvoice() {
    window.print(); // استدعاء نافذة الطباعة الافتراضية
}
// زر الحفظ

function saveInvoice() {
    const invoiceData = {
        invoiceNumber: document.getElementById('invoiceNumber').innerText,
        date: document.getElementById('currentDate').innerText,
        time: document.getElementById('currentTime').innerText,
        totalUnits: document.getElementById('totalUnits').value,
        discount: document.getElementById('discountValue').value,
        amountDue: document.getElementById('amountDue').value
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceData.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// زر المسح

function clearInvoice() {
    if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
        // مسح الحقول الأساسية
        document.getElementById('totalUnits').value = '';
        document.getElementById('discountPercent').value = '';
        document.getElementById('discountValue').value = '';
        document.getElementById('amountDue').value = '';

        // مسح بيانات العميل
        const clientFields = [
            "clientName", // معرف حقل اسم العميل
            "clientPhone", // معرف حقل رقم الهاتف
            "clientAddress", // معرف حقل العنوان
            "clientCarType", // معرف حقل نوع السيارة
            "clientChassisNumber", // معرف حقل رقم الشاسيه
            "clientCode" // معرف حقل كود العميل
        ];

        clientFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = ''; // مسح القيمة
            }
        });

        // مسح جدول الفاتورة
        const tableBody = document.querySelector('#invoiceTable tbody');
        tableBody.innerHTML = ''; // إزالة جميع الصفوف

        // إعادة إنشاء صف واحد فارغ
        addRow();
    }
}




// تحقق إذا كان المستخدم مسجل الدخول
const isLoggedIn = sessionStorage.getItem('loggedIn');

if (!isLoggedIn) {
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = "login.html";
}
