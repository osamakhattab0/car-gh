const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;


// إعداد قاعدة البيانات

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');



        db.run(`
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clientName TEXT,
                clientPhone TEXT,
                clientAddress TEXT,
                carType TEXT,
                chassisNumber TEXT,
                clientCode TEXT,
                underAccount REAL
            )
        `);

        // إنشاء جدول الفواتير إذا لم يكن موجودًا
        db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number INTEGER UNIQUE,
        date TEXT,
        time TEXT,
        clientCode TEXT,
        client_name TEXT,
        client_phone TEXT,
        client_address TEXT,
        car_type TEXT,
        chassis_number TEXT,
        warranty_Period TEXT, 
        total_units REAL,
        discount REAL,
        discount_percent REAL,
        vat_percent REAL,
        vat_value REAL,
        final_total REAL,
        current_balance REAL,
        previous_balance REAL,
        outstanding_amount REAL,
        amount_due REAL
    )
`, (err) => {
            if (err) console.error('Error creating invoices table:', err.message);
        });
        // إنشاء جدول المنتجات المرتبطة بكل فاتورة
        db.run(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER,
                item_number TEXT,
                item_name TEXT,
                description TEXT,
                quantity INTEGER,
                price REAL,
                total REAL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('Error creating invoice_items table:', err.message);
        });

        console.log('Tables created or already exist.');
    }
});





// Middleware
app.use(cors());
app.use(bodyParser.json());

// نقطة نهاية لإضافة عميل جديد
app.post('/clients', (req, res) => {
    const {
        clientName,
        clientPhone,
        clientAddress,
        carType,
        chassisNumber,
        clientCode,
        underAccount
    } = req.body;

    if (!clientName || !clientPhone || !clientAddress || !carType || !chassisNumber || !clientCode || underAccount === undefined) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    // فحص إذا كان العميل موجودًا بالفعل باستخدام رقم الهاتف أو كود العميل
    db.get('SELECT * FROM clients WHERE clientPhone = ? OR clientCode = ?', [clientPhone, clientCode], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // إذا كان العميل موجودًا بالفعل
            return res.status(409).json({ error: 'العميل مسجل مسبقًا.' });
        }

        // إذا لم يكن العميل موجودًا، قم بإضافته
        db.run(`
            INSERT INTO clients (clientName, clientPhone, clientAddress, carType, chassisNumber, clientCode, underAccount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [clientName, clientPhone, clientAddress, carType, chassisNumber, clientCode, underAccount], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ message: 'تم إضافة العميل بنجاح!', clientId: this.lastID });
            }
        });
    });
});

// عرض جميع العملاء
app.get('/clients', (req, res) => {
    db.all('SELECT * FROM clients', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

// جلب بيانات عميل محدد
app.get('/clients/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'العميل غير موجود.' });
        } else {
            res.status(200).json(row);
        }
    });
});

// تعديل بيانات عميل
app.put('/clients/:id', (req, res) => {
    const { id } = req.params;
    const {
        clientName,
        clientPhone,
        clientAddress,
        carType,
        chassisNumber,
        clientCode,
        underAccount
    } = req.body;

    if (!clientName || !clientPhone || !clientAddress || !carType || !chassisNumber || !clientCode || underAccount === undefined) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    db.run(`
        UPDATE clients SET
            clientName = ?, 
            clientPhone = ?, 
            clientAddress = ?, 
            carType = ?, 
            chassisNumber = ?, 
            clientCode = ?, 
            underAccount = ?
        WHERE id = ?
    `, [clientName, clientPhone, clientAddress, carType, chassisNumber, clientCode, underAccount, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'العميل غير موجود.' });
        } else {
            res.status(200).json({ message: 'تم تعديل بيانات العميل بنجاح!' });
        }
    });
});

// حذف عميل
app.delete('/clients/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM clients WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'العميل غير موجود.' });
        } else {
            res.status(200).json({ message: 'تم حذف العميل بنجاح!' });
        }
    });
});

// جلب بيانات عميل باستخدام كود العميل
app.get('/clients/code/:clientCode', (req, res) => {
    const { clientCode } = req.params;

    db.get('SELECT * FROM clients WHERE clientCode = ?', [clientCode], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'العميل غير موجود.' });
        } else {
            res.status(200).json(row);
        }
    });
});

// نقطة نهاية للحصول على رقم الفاتورة التالي
app.get('/api/next-invoice-number', (req, res) => {
    const query = `SELECT MAX(invoice_number) AS max_invoice FROM invoices`;

    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error fetching next invoice number:', err.message);
            return res.status(500).json({ error: 'Failed to fetch the next invoice number.' });
        }

        const nextInvoiceNumber = (row?.max_invoice || 0) + 1; // إذا لم تكن هناك فواتير، نبدأ من 1
        res.status(200).json({ nextInvoiceNumber });
    });
});

// حفظ فاتورة جديدة مع رقم الفاتورة التسلسلي
// حفظ فاتورة جديدة مع رقم الفاتورة التسلسلي
app.post('/api/invoices', (req, res) => {
    const {
        date,
        time,
        clientCode,
        clientName,
        clientPhone,
        clientAddress,
        carType,
        chassisNumber,
        warrantyPeriod, // إضافة مدة الضمان
        totalUnits,
        discount, // قيمة الخصم
        discountPercent, // نسبة الخصم
        vatPercent, // نسبة الضريبة
        vatValue, // قيمة الضريبة
        finalTotal, // الإجمالي النهائي
        currentBalance, // الرصيد الحالي
        previousBalance,
        amountDue, // قيمة الفاتورة
        outstandingAmount, // المبلغ المستحق
        items // بيانات المنتجات
    } = req.body;

    const getInvoiceNumberQuery = `SELECT MAX(invoice_number) AS max_invoice FROM invoices`;

    db.get(getInvoiceNumberQuery, [], (err, row) => {
        if (err) {
            console.error('Error fetching the current max invoice number:', err.message);
            return res.status(500).json({ error: 'Failed to fetch the current invoice number.' });
        }

        const invoiceNumber = (row?.max_invoice || 19) + 1; // توليد رقم الفاتورة التالي

        const insertInvoiceQuery = `
            INSERT INTO invoices (
                invoice_number, date, time, clientCode, client_name, client_phone, client_address, car_type, chassis_number, warranty_period,
                total_units, discount, discount_percent, vat_percent, vat_value, final_total, current_balance, previous_balance, outstanding_amount, amount_due
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            insertInvoiceQuery,
            [
                invoiceNumber, date, time, clientCode, clientName, clientPhone, clientAddress, carType, chassisNumber, warrantyPeriod,
                totalUnits, discount, discountPercent, vatPercent, vatValue, finalTotal, currentBalance, previousBalance, outstandingAmount, amountDue
            ],
            function (err) {
                if (err) {
                    console.error('Error saving invoice:', err.message);
                    return res.status(500).json({ message: 'فشل في حفظ الفاتورة.' });
                }

                const invoiceId = this.lastID; // الحصول على `invoice_id` للفاتورة التي تم حفظها

                // حفظ المنتجات المرتبطة بالفاتورة في جدول `invoice_items`
                const insertItemQuery = `
                    INSERT INTO invoice_items (invoice_id, item_number, item_name, description, quantity, price, total) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                const itemStatements = db.prepare(insertItemQuery);
                items.forEach(item => {
                    itemStatements.run(
                        invoiceId,
                        item.itemNumber,
                        item.itemName,
                        item.description,
                        item.quantity,
                        item.price,
                        item.total
                    );
                });
                itemStatements.finalize();

                res.status(201).json({
                    message: 'تم حفظ الفاتورة وجميع الأصناف بنجاح!',
                    invoiceNumber,
                    invoiceId
                });
            }
        );
    });
});



// نقطة نهاية للحصول على جميع الفواتير
app.get('/api/invoices', (req, res) => {
    const query = `SELECT * FROM invoices`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching invoices:', err.message);
            res.status(500).json({ message: 'فشل في استرجاع الفواتير.' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// استرجاع فاتورة واحدة بناءً على رقم الفاتورة
app.get('/api/invoices/:invoiceNumber', (req, res) => {
    const invoiceNumber = req.params.invoiceNumber;
    const query = `
        SELECT invoices.*, clients.clientCode, clients.underAccount AS previousBalance
        FROM invoices
        LEFT JOIN clients ON invoices.client_phone = clients.clientPhone
        WHERE invoices.invoice_number = ?
    `;

    db.get(query, [invoiceNumber], (err, row) => {
        if (err) {
            console.error('Error fetching invoice:', err.message);
            res.status(500).json({ message: 'فشل في استرجاع بيانات الفاتورة.' });
        } else if (!row) {
            res.status(404).json({ message: 'لم يتم العثور على الفاتورة.' });
        } else {
            res.status(200).json(row);
        }
    });
});



// حذف فاتورة بناءً على رقم الفاتورة
app.delete('/api/invoices/:invoiceNumber', (req, res) => {
    const invoiceNumber = req.params.invoiceNumber;
    const query = `DELETE FROM invoices WHERE invoice_number = ?`;

    db.run(query, [invoiceNumber], function (err) {
        if (err) {
            console.error('Error deleting invoice:', err.message);
            res.status(500).json({ message: 'فشل في حذف الفاتورة.' });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'الفاتورة غير موجودة.' });
        } else {
            res.status(200).json({ message: 'تم حذف الفاتورة بنجاح!' });
        }
    });
});

// استرجاع بيانات الفاتورة مع تفاصيلها
app.get('/api/invoices/:invoiceNumber', (req, res) => {
    const invoiceNumber = req.params.invoiceNumber;
    const query = `SELECT * FROM invoices WHERE invoice_number = ?`;

    db.get(query, [invoiceNumber], (err, row) => {
        if (err) {
            console.error('Error fetching invoice:', err.message);
            res.status(500).json({ message: 'فشل في استرجاع بيانات الفاتورة.' });
        } else if (!row) {
            res.status(404).json({ message: 'لم يتم العثور على الفاتورة.' });
        } else {
            res.status(200).json(row);
        }
    });
});

// استرجاع جميع الأصناف المرتبطة بالفاتورة
app.get('/api/invoice-items/:invoiceNumber', (req, res) => {
    const invoiceNumber = req.params.invoiceNumber;
    const query = `
        SELECT item_number, item_name, description, quantity, price, total
        FROM invoice_items 
        WHERE invoice_id = (SELECT id FROM invoices WHERE invoice_number = ?)
    `;

    db.all(query, [invoiceNumber], (err, rows) => {
        if (err) {
            console.error('Error fetching invoice items:', err.message);
            res.status(500).json({ message: 'فشل في استرجاع بيانات الأصناف.' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// نقطة نهاية للبحث عن الفواتير برقم الشاسيه
app.get('/api/invoices/by-chassis/:chassisNumber', (req, res) => {
    const { chassisNumber } = req.params;
    const query = `
        SELECT * FROM invoices 
        WHERE chassis_number = ?
    `;

    db.all(query, [chassisNumber], (err, rows) => {
        if (err) {
            console.error('Error fetching invoices by chassis number:', err.message);
            res.status(500).json({ message: 'فشل في استرجاع الفواتير.' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// نقطة نهاية للبحث عن عميل باستخدام رقم الشاسيه
app.get('/clients/chassis/:chassisNumber', (req, res) => {
    const { chassisNumber } = req.params;

    db.get('SELECT * FROM clients WHERE chassisNumber = ?', [chassisNumber], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'العميل غير موجود.' });
        }

        res.status(200).json(row);
    });
});

// نقطة نهاية لتسجيل الدخول
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان.' });
    }

    // البحث عن المستخدم في قاعدة البيانات
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'اسم المستخدم غير موجود.' });
        }

        // التحقق من كلمة المرور (يفضل استخدام bcrypt للمقارنة)
        if (user.password === password) { // يجب استخدام bcrypt.compare في حالة تشفير كلمة المرور
            res.status(200).json({ message: 'تم تسجيل الدخول بنجاح!' });
        } else {
            res.status(401).json({ error: 'كلمة المرور غير صحيحة.' });
        }
    });
});

// نقطة نهاية للحصول على الكود التالي للعميل
app.get('/api/next-client-code', (req, res) => {
    const query = `SELECT MAX(CAST(clientCode AS INTEGER)) AS maxClientCode FROM clients`;

    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Error fetching next client code:', err.message);
            return res.status(500).json({ error: 'فشل في جلب الكود التالي للعميل.' });
        }

        // إذا لم يكن هناك عملاء، نبدأ من 1
        const nextClientCode = (row?.maxClientCode || 0) + 1;
        res.status(200).json({ nextClientCode });
    });
});


// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

