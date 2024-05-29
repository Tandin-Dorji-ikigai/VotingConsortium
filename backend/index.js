// index.js
require('dotenv').config(); // Add this line at the top of the file
const app = require('./app'); // Importing app from app.js

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});