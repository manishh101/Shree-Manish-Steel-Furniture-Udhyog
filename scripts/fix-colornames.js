const mongoose = require('mongoose');

async function fixColorNames() {
  try {
    await mongoose.connect('mongodb+srv://manish-steel:Manishsteel@manish-steel-cluster.1cxhr9g.mongodb.net/manish-steel?retryWrites=true&w=majority&appName=manish-steel-cluster');
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const products = db.collection('products');

    // Fix blue & silver product
    const blueResult = await products.updateOne(
      { _id: new mongoose.Types.ObjectId('697b32babf21cb1f19fad467') },
      { $set: { colorName: 'Blue & Silver' } }
    );
    console.log(`Updated blue & silver product: ${blueResult.modifiedCount} modified`);

    // Fix fiber product
    const fiberResult = await products.updateOne(
      { _id: new mongoose.Types.ObjectId('697b32e929e0b7f2b7b2db25') },
      { $set: { colorName: 'Chocolate Fiber' } }
    );
    console.log(`Updated chocolate fiber product: ${fiberResult.modifiedCount} modified`);

    console.log('\n✅ ColorNames fixed');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixColorNames();
