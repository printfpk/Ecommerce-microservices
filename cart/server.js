require('dotenv').config();
const app = require('./src/app');




app.listen(3002, () => {
    console.log('Server is running on port 3002');
});