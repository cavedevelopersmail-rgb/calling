require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const cron = require('node-cron');
const { runWorkflow } = require('./controllers/automationController');

const authRoutes = require('./routes/authRoutes');
const callRoutes = require('./routes/callRoutes');
const scheduledCallRoutes = require('./routes/scheduledCallRoutes');
const importRoutes = require('./routes/importRoutes');
const automationRoutes = require('./routes/automationRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/scheduled-calls', scheduledCallRoutes);
app.use('/api/import', importRoutes);
app.use('/api/automation', automationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Schedule the automation workflow to run every day at 8 AM
  cron.schedule('0 8 * * *', () => {
    console.log('--- Running scheduled automation workflow ---');
    runWorkflow();
  }, {
    scheduled: true,
    timezone: "Asia/Calcutta" // Example timezone, adjust as needed
  });

  console.log('Automation workflow scheduled to run daily at 8 AM.');
});

module.exports = app;
