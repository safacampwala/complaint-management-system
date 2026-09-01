require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const complaintRoutes = require('./routes/complaints');

const app = express();

connectDB();

// Normalize: strip trailing slashes so "https://x.com/" matches "https://x.com"
const normalize = (url) => (url ? url.replace(/\/+$/, '') : url);

const allowedOrigins = [
  'http://localhost:3000',
  'https://complaint-management-system-59we.vercel.app',
].map(normalize);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (curl, server-to-server, health checks) with no Origin header
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalize(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`Blocked by CORS: ${origin}`);
    // IMPORTANT: don't throw an Error here — that produces the opaque
    // "CORS error" in the browser console with no useful response.
    // Instead, decline to set CORS headers and let the browser handle it.
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));