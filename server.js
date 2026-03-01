const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS) from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions to read/write data.json
function readData() {
    if (!fs.existsSync('data.json')) {
        return { students: [], management: [] };
    }
    const raw = fs.readFileSync('data.json', 'utf8');
    return raw ? JSON.parse(raw) : { students: [], management: [] };
}

function writeData(data) {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// ==========================
// STUDENT REGISTER
// ==========================
app.post('/student-register', (req, res) => {
    const data = readData();

    // Check if student already exists
    const exists = data.students.find(s => s.email === req.body.email);
    if (exists) return res.redirect('/std-login.html'); // Already registered → go to login

    if (req.body.password !== req.body.cpassword) {
        return res.send("❌ Passwords do not match");
    }

    const newStudent = {
        name: req.body.name,
        email: req.body.email,
        college: req.body.college,
        mobile: req.body.mobile,
        password: req.body.password
    };

    data.students.push(newStudent);
    writeData(data);

    // First-time registration → go directly to student interface
    res.redirect('/student-interface.html');
});

// ==========================
// STUDENT LOGIN
// ==========================
app.post('/student-login', (req, res) => {
    const data = readData();
    const student = data.students.find(
        s => s.email === req.body.email && s.password === req.body.password
    );

    if (!student) return res.send("❌ Invalid email or password");

    // Successful login → redirect to student interface
    res.redirect('/student-interface.html');
});

// ==========================
// MANAGEMENT REGISTER
// ==========================
app.post('/management-register', (req, res) => {
    const data = readData();

    const exists = data.management.find(m => m.email === req.body.email);
    if (exists) return res.redirect('/management-login.html');

    if (req.body.password !== req.body.cpassword) return res.send("❌ Passwords do not match");

    const newManagement = {
        name: req.body.name,
        email: req.body.email,
        college: req.body.college,
        mobile: req.body.mobile,
        password: req.body.password
    };

    data.management.push(newManagement);
    writeData(data);

    // First-time registration → go directly to management interface
    res.redirect('/management-interface.html');
});

// ==========================
// MANAGEMENT LOGIN
// ==========================
app.post('/management-login', (req, res) => {
    const data = readData();
    const management = data.management.find(
        m => m.email === req.body.email && m.password === req.body.password
    );

    if (!management) return res.send("❌ Invalid email or password");

    res.redirect('/management-interface.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});