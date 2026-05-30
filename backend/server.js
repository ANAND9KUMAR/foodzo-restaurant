const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
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
    deliveryStatus: { type: String, default: 'Preparing' }, // Tracks order stage: Preparing, On the way, Delivered
    riderLocation: { // Store the ongoing location
        lat: { type: Number },
        lng: { type: Number }
    },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Socket.io integration
io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Rider will emit this event with their ongoing order Id
    socket.on('updateLocation', async (data) => {
        const { orderId, lat, lng } = data;
        
        // Broadcast location to all clients tracking this order
        io.emit(`locationUpdate_${orderId}`, { lat, lng });

        // Update the DB
        try {
            await Order.findByIdAndUpdate(orderId, {
                riderLocation: { lat, lng },
                deliveryStatus: 'On the way'
            });
        } catch (err) {
            console.error('Error saving rider location:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from socket:', socket.id);
    });
});

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

// PhonePe Credentials (UAT Environment)
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const FRONTEND_URL = "http://localhost:5173"; // Adjust if your frontend runs on another port

// 6. Initiate PhonePe Payment
app.post('/api/payment/pay', async (req, res) => {
    try {
        const { customerName, email, phone, address, items, totalAmount } = req.body;

        if (!customerName || !phone || !address || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please fill in all required fields and add items to your cart' });
        }

        // 1. Create Order in Database as Pending
        let newOrder = new Order({
            customerName, email, phone, address, items, totalAmount, status: 'Pending'
        });
        await newOrder.save();

        const merchantTransactionId = newOrder._id.toString(); // Use DB Order ID
        
        // 2. Format PhonePe Request
        const data = {
            merchantId: PHONEPE_MERCHANT_ID,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: phone || 'MUID123',
            name: customerName,
            amount: totalAmount * 100, // PhonePe accepts amount in paise
            redirectUrl: `http://localhost:${PORT}/api/payment/status/${merchantTransactionId}`,
            redirectMode: "POST",
            mobileNumber: phone,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = PHONEPE_SALT_INDEX;
        const stringToHash = payloadMain + "/pg/v1/pay" + PHONEPE_SALT_KEY;
        
        // Ensure crypto is required at the top usually, but we'll require here if not
        const crypto = require('crypto');
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const options = {
            method: 'POST',
            url: PHONEPE_ENV_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const axios = require('axios');
        const response = await axios.request(options);

        // 3. Return the payment redirect URL to the frontend
        if (response.data && response.data.success) {
             const url = response.data.data.instrumentResponse.redirectInfo.url;
             return res.status(200).json({ success: true, paymentUrl: url });
        } else {
             return res.status(400).json({ success: false, message: response.data.message });
        }

    } catch (error) {
        console.error("PhonePe Payment Initiation Error:", error.message);
        res.status(500).json({ message: 'Server error, could not initiate payment.' });
    }
});

// 7. Handle PhonePe Payment Callback
app.post('/api/payment/status/:transactionId', async (req, res) => {
    try {
        const merchantTransactionId = req.params.transactionId;
        const merchantId = req.body.merchantId;
        const transactionId = req.body.transactionId;

        // Note: For production, you should verify the X-VERIFY checksum attached by PhonePe callback here as well
        // We'll trust the payload code response for now in UAT
        
        if (req.body.code === 'PAYMENT_SUCCESS') {
            // Update order status in DB
            await Order.findByIdAndUpdate(merchantTransactionId, { status: 'Paid/Completed' });
            
            // Redirect customer to success page on frontend
            return res.redirect(`${FRONTEND_URL}/?payment=success`);
        } else {
            // Update order status in DB to Failed
            await Order.findByIdAndUpdate(merchantTransactionId, { status: 'Failed' });
            
            // Redirect customer to failure page on frontend
            return res.redirect(`${FRONTEND_URL}/?payment=failed`);
        }

    } catch (error) {
        console.error("Payment Status Check Error:", error.message);
        res.status(500).send("Callback Error");
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
