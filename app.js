const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Database Config
const db = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'booking'
};

db.connect((err) =>{
    if(err){
        console.log("Error")
    }
    else{
        console.log("Connected")
    }
})

const pool = mysql.createPool(db);
app.use(express.json());

// Routes
app.get('/book', (req, res) => {
    res.sendFile(__dirname + '/public/vehiclebooking.html');
});

app.post('/book', async(req, res) => {
    const {firstname,lastname,twowheeler,fourwheeler,SUV,hatchback,sedan,sports,cruiser,startdate,enddate} = req.body;

    const sql = 'INSERT INTO vehicles (firstname, lastname,twowheeler,fourwheeler,SUV,hatchback,sedan,sports,cruiser,start-date,end-date) VALUES (?, ?)';
    db.query(sql, [firstname,lastname,twowheeler,fourwheeler,SUV,hatchback,sedan,sports,cruiser,startdate,enddate], (err, result) => {
        if (err) {
            console.error('MySQL query error:', err);
            res.status(500).send('Error');
        } else {
            console.log('successfully added');
            res.send('successfully added');
        }
    });

    // Check for overlapping bookings
    const overlappingBookings = await checkForOverlappingBookings(vehicle_id, startdate, enddate);

    if (overlappingBookings.length > 0) {
        return res.status(400).json({ error: 'Booking overlaps with existing bookings' });
    }

    // Insert the new booking
    const result = await insertBooking(vehicle_id, startdate, enddate);

    res.json({ message: 'Booking successful', booking_id: result.insertId });

    async function checkForOverlappingBookings(vehicle_id, startdate, enddate) {
        const query = 'SELECT * FROM vehicles WHERE vehicle_id = ? AND ? < enddate AND ? > startdate';
        const [rows] = await pool.execute(query, [vehicle_id, startdate, enddate]);
        return rows;
    }
    
    async function insertBooking(vehicle_id, startdate, enddate) {
        const query = 'INSERT INTO vehicles (vehicle_id, startdate, enddate) VALUES (?, ?, ?)';
        const [result] = await pool.execute(query, [vehicle_id, startdate, enddate]);
        return result;
    }
});

// Sever Port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
