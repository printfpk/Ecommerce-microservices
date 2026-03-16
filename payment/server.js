require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

// Connect to the database
connectDB();



app.listen(3004, () => {
  console.log('Server is running on port 3004');
});