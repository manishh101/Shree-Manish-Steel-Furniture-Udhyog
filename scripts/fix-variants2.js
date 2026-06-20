const mongoose = require('mongoose');

async function fixVariants() {
  await mongoose.connect('mongodb+srv://manish-steel:Manishsteel@manish-steel-cluster.1cxhr9g.mongodb.net/manish-steel?retryWrites=true&w=majority&appName=manish-steel-cluster');
  console.log("Connected to DB");

  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  let updatedCount = 0;
  
  // Find all variant groups
  for (const product of products) {
    if (product.colorVariants && product.colorVariants.length > 0) {
      const variantIds = product.colorVariants
        .filter(v => v.productId)
        .map(v => v.productId.toString());
      
      const allConnectedIds = [product._id.toString(), ...variantIds];
      
      for (const targetId of variantIds) {
         try {
           const targetObjectId = new mongoose.Types.ObjectId(targetId);
           const othersToTarget = allConnectedIds.filter(cid => cid !== targetId);
           
           for (const cid of othersToTarget) {
             const cObjId = new mongoose.Types.ObjectId(cid);
             // Check if target has cid
             const targetProd = await mongoose.connection.db.collection('products').findOne({ _id: targetObjectId });
             if (targetProd) {
               const hasLink = targetProd.colorVariants && targetProd.colorVariants.some(v => v.productId && v.productId.toString() === cid);
               if (!hasLink) {
                 const cidProd = await mongoose.connection.db.collection('products').findOne({ _id: cObjId });
                 if (cidProd) {
                   console.log(`Adding ${cidProd.name} to ${targetProd.name}'s variants`);
                   await mongoose.connection.db.collection('products').updateOne(
                     { _id: targetObjectId },
                     { $push: { colorVariants: {
                         label: cidProd.colorName || cidProd.name,
                         hex: cidProd.colorHex || '',
                         productId: cObjId,
                         image: cidProd.image || (cidProd.images && cidProd.images[0]) || ''
                     }}}
                   );
                   updatedCount++;
                 }
               }
             }
           }
         } catch(e) {
           console.log(e);
         }
      }
    }
  }
  
  console.log(`Done. Updated ${updatedCount} variants.`);
  process.exit(0);
}

fixVariants();
