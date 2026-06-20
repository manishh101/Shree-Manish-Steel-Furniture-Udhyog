const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://manish-steel:Manishsteel@manish-steel-cluster.1cxhr9g.mongodb.net/manish-steel?retryWrites=true&w=majority&appName=manish-steel-cluster';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // Find subcategories
    const subcats = await mongoose.connection.db.collection('subcategories').find({}).toArray();
    console.log('Subcategories:', subcats.map(s => ({ id: s._id, name: s.name, categoryId: s.categoryId })));
    
    // Find products containing "bed" or "palang"
    const regex = /bed|palang/i;
    const products = await mongoose.connection.db.collection('products').find({
      $or: [
        { name: regex },
        { category: regex },
        { subcategory: regex },
        { description: regex }
      ]
    }).toArray();
    
    console.log('Products matching bed/palang:', products.map(p => ({ id: p._id, name: p.name, category: p.category, subcategory: p.subcategory })));
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
  });
