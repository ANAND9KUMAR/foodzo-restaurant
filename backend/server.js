const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_arudha';
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB Successfully!'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Define the Reservation Schema and Model inside server.js for simplicity initially
const reservationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    contactNo: { type: String, required: true },
    personCount: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

// Define the Order Schema
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String }, // Made optional
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// API Routes

// 1. Test Route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Restaurant Arudha API' });
});

// 2. Create a booking (Reservation)
app.post('/api/reservations', async (req, res) => {
    try {
        const { fullName, email, contactNo, personCount, date, time } = req.body;
        
        // Basic validation
        if (!fullName || !email || !contactNo || !date || !time) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const newReservation = new Reservation({
            fullName,
            email,
            contactNo,
            personCount,
            date,
            time
        });

        const savedReservation = await newReservation.save();
        res.status(201).json({ 
            message: 'Table booked successfully!', 
            reservation: savedReservation 
        });

    } catch (error) {
        console.error('Reservation Error:', error);
        res.status(500).json({ message: 'Server error, could not process reservation.' });
    }
});

// 3. Get all bookings (For Admin use)
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
});

// 4. Create a food order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, email, phone, address, items, totalAmount } = req.body;

        if (!customerName || !phone || !address || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please fill in all required fields and add items to your cart' });
        }

        const newOrder = new Order({
            customerName,
            email,
            phone,
            address,
            items,
            totalAmount
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({
            message: 'Order placed successfully!',
            order: savedOrder
        });

    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ message: 'Server error, could not process order.' });
    }
});

// 5. Get all orders (For Admin use)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
