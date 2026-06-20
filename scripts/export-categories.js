const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const Category = require('../models/Category').default;
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    console.log(JSON.stringify(categories, null, 2));
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
