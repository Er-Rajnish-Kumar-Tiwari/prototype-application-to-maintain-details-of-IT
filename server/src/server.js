const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { scheduleWarrantyCheck } = require('./jobs/warrantyCheckJob');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const assetRoutes = require('./routes/assetRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'IT Asset Manager API is running' });
});

// Every /api/* route (except the health check above) needs the DB connected
// first. On Vercel each request may hit a cold serverless invocation, so we
// (re)connect here instead of only once at module load - connectDB() reuses
// the existing connection when it's already warm. If MONGO_URI is missing or
// unreachable, this turns it into a clean JSON 500 instead of an opaque
// "FUNCTION_INVOCATION_FAILED" crash.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Database connection failed: ${error.message}`,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);

app.use(notFound);
app.use(errorHandler);

// On Vercel the platform itself invokes this file per-request as a
// serverless function - it must NOT call app.listen() (there is no long-lived
// process to bind a port on), and a cron job would never actually run since
// nothing stays alive between requests. Locally / on a normal Node host
// (Render, Railway, a VPS, etc.) we start a real server as usual.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB().catch(() => {}); // logs its own error; keep the process alive either way
    scheduleWarrantyCheck();
  });
}

module.exports = app;
