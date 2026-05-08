const mongoose = require('mongoose');

async function enforceCanonicalOrder() {
  try {
    await mongoose.connect('mongodb+srv://manish-steel:Manishsteel@manish-steel-cluster.1cxhr9g.mongodb.net/manish-steel?retryWrites=true&w=majority&appName=manish-steel-cluster');
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    let totalUpdates = 0;
    const processedClusters = new Set();

    for (const product of products) {
      if (!product.colorVariants || product.colorVariants.length === 0) continue;

      const productId = product._id.toString();
      if (processedClusters.has(productId)) continue;

      const variantIds = product.colorVariants
        .filter(v => v.productId)
        .map(v => v.productId.toString());
      
      const allConnectedIds = [productId, ...variantIds];
      
      // Mark all as processed so we don't repeat work
      allConnectedIds.forEach(id => processedClusters.add(id));

      console.log(`\nProcessing cluster: ${product.colorName || product.name}`);
      console.log(`  Cluster members: ${allConnectedIds.length}`);

      // Fetch all products in cluster and sort by colorName alphabetically
      const clusterProducts = await db.collection('products')
        .find({ _id: { $in: allConnectedIds.map(id => new mongoose.Types.ObjectId(id)) } })
        .toArray();

      // Sort alphabetically by colorName
      clusterProducts.sort((a, b) => {
        const nameA = (a.colorName || a.name || '').toLowerCase();
        const nameB = (b.colorName || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      console.log(`  Canonical order: ${clusterProducts.map(p => p.colorName || p.name).join(' → ')}`);

      // For each product, set colorVariants to all others in canonical order
      for (const member of clusterProducts) {
        const canonicalVariants = clusterProducts
          .filter(p => p._id.toString() !== member._id.toString())
          .map(p => ({
            label: p.colorName || p.name,
            hex: p.colorHex || '',
            productId: p._id,
            image: p.image || (p.images && p.images[0]) || ''
          }));

        const result = await db.collection('products').updateOne(
          { _id: member._id },
          { $set: { colorVariants: canonicalVariants } }
        );

        if (result.modifiedCount > 0) {
          totalUpdates++;
        }
      }
    }

    console.log(`\n✅ Enforced canonical order. Total updates: ${totalUpdates}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

enforceCanonicalOrder();
