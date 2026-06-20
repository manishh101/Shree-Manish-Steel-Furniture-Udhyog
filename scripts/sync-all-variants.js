const mongoose = require('mongoose');

async function syncAllVariants() {
  try {
    await mongoose.connect('mongodb+srv://manish-steel:Manishsteel@manish-steel-cluster.1cxhr9g.mongodb.net/manish-steel?retryWrites=true&w=majority&appName=manish-steel-cluster');
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    console.log(`Found ${products.length} products`);
    let totalUpdates = 0;

    // For each product with colorVariants, ensure all connected products have
    // the same colorVariants (creating a fully connected cluster)
    for (const product of products) {
      if (!product.colorVariants || product.colorVariants.length === 0) continue;

      const variantIds = product.colorVariants
        .filter(v => v.productId)
        .map(v => v.productId.toString());
      
      // All connected products in this cluster
      const allConnectedIds = [product._id.toString(), ...variantIds];
      
      console.log(`\nProduct: ${product.name} (${product._id})`);
      console.log(`Variants: ${variantIds.length}, Total cluster: ${allConnectedIds.length}`);

      // For each product in the cluster, ensure it has ALL others as variants
      for (const memberId of allConnectedIds) {
        const memberObjId = new mongoose.Types.ObjectId(memberId);
        const member = await db.collection('products').findOne({ _id: memberObjId });
        
        if (!member) {
          console.log(`  ⚠ Member ${memberId} not found`);
          continue;
        }

        // Build the complete variant list for this member
        // (all products in the cluster except itself)
        const othersIds = allConnectedIds.filter(id => id !== memberId);
        const othersDocs = await db.collection('products')
          .find({ _id: { $in: othersIds.map(id => new mongoose.Types.ObjectId(id)) } })
          .toArray();

        const newVariants = othersDocs.map(doc => ({
          label: doc.colorName || doc.name,
          hex: doc.colorHex || '',
          productId: doc._id,
          image: doc.image || (doc.images && doc.images[0]) || ''
        }));

        // Update this member with the canonical variant list
        const result = await db.collection('products').updateOne(
          { _id: memberObjId },
          { $set: { colorVariants: newVariants } }
        );

        if (result.modifiedCount > 0) {
          console.log(`  ✓ Updated ${member.colorName || member.name}: ${newVariants.length} variants`);
          totalUpdates++;
        }
      }
    }

    console.log(`\n✅ Sync complete. Total updates: ${totalUpdates}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

syncAllVariants();
