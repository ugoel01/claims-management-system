require('dotenv').config(); // Load .env file
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require("./config/swaggerConfig");
const userRoutes = require('./routes/userRoutes');
const claimRoutes = require('./routes/claimRoutes');
const policyRoutes = require('./routes/policyRoutes');
const client = require('prom-client');

const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" })); 

// Connect to MongoDB
connectDB();

// Routes
app.use('/users', userRoutes);
app.use('/claims', claimRoutes);
app.use('/policies', policyRoutes);

// Home route
app.get('/', (req, res) => res.send('Claims Management API is running!'));

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [50, 100, 200, 300, 400, 500] // Buckets for response time distribution
});

app.use((req, res, next) => {
    const startEpoch = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startEpoch;
        httpRequestDurationMicroseconds
            .labels(req.method, req.path, res.statusCode)
            .observe(duration);
    });
    next();
});

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server }; 