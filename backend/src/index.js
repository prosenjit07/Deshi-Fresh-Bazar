import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import supabase from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
// Uncomment as we build them
// import productRoutes from './routes/productRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';

// Configure environment variables
config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Supabase connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    res.json({ message: 'Supabase connection successful', data });
  } catch (error) {
    res.status(500).json({ message: 'Database connection error', error: error.message });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use routes
app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server with port fallback
const DEFAULT_PORT = process.env.PORT || 5000;
let currentPort = DEFAULT_PORT;

const server = app.listen(currentPort, () => {
  console.log(`Server running on port ${currentPort}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    currentPort = Number(DEFAULT_PORT) + 1;
    console.log(`Port ${DEFAULT_PORT} is busy, trying port ${currentPort}...`);
    server.close();
    app.listen(currentPort, () => {
      console.log(`Server running on port ${currentPort}`);
    });
  } else {
    console.error(`Server error: ${err.message}`);
  }
});
