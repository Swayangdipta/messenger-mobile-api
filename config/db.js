const mongoose = require('mongoose');

exports.connectDB = () => {
    mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
}