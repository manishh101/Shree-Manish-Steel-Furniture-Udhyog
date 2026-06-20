#!/usr/bin/env node

/**
 * Enrich Category Descriptions Script
 * 
 * This script creates rich 200-300 word descriptions for each main category including:
 * - Category overview and popular products
 * - Dual keywords (formal/colloquial terms) naturally integrated
 * - Local availability and delivery options
 * - "Why Choose Manish Steel for [Category]" section
 * - Benefits and value propositions
 * 
 * Usage:
 *   node scripts/enrich-category-descriptions.js [--dry-run] [--category="Category Name"]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local manually
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.error('Error reading .env.local file', e);
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const categoryArg = args.find(arg => arg.startsWith('--category='));
const targetCategory = categoryArg ? categoryArg.split('=')[1].replace(/['"]/g, '') : null;

// Category description templates based on dual-keyword audit
// Updated to match actual categories in the database
const categoryDescriptions = {
  "66'' Almirah Model": {
    focusKeywords: ['66 inch almirah', 'daraj', 'wardrobe', 'steel almirah', 'biratnagar'],
    dualKeywords: [
      { formal: 'almirah', colloquial: 'daraj' },
      { formal: 'wardrobe', colloquial: 'kapada rakhne' }
    ],
    description: `Discover our popular 66-inch steel almirah (daraj) collection, perfect for medium-sized bedrooms in Biratnagar. Our 66'' almirahs combine functionality with style, offering ample storage for clothes, documents, and valuables without occupying excessive floor space.

Each 66-inch steel daraj features premium 22-gauge steel construction with powder-coated finish that resists rust in Terai's humid climate. Available in 2-door and 3-door configurations with adjustable shelves, hanging space, and secure locking mechanisms. The 66'' wardrobe (kapada rakhne) is ideal for apartments, rental properties, and homes with limited space.

Popular models include mirror-door designs, sliding door variants, and classic swing-door almirahs in multiple color options. All 66-inch daraj models are manufactured at our Biratnagar facility with quality steel that ensures decades of reliable service.

Why Choose Manish Steel 66'' Almirahs:
✓ Perfect size for standard Nepali bedrooms - not too large, not too small
✓ Direct factory pricing - Rs. 15,000 to Rs. 35,000 depending on features
✓ Free delivery and installation in Biratnagar, Dharan, Itahari areas
✓ 5-year manufacturing warranty against defects
✓ Termite-proof and moisture-resistant steel construction
✓ Customization available in color and internal configuration

Whether you need a bedroom wardrobe, guest room storage, or rental property furniture, our 66-inch steel almirahs (daraj) deliver quality and value across Morang district.`
  },

  "72'' Almirah Model": {
    focusKeywords: ['72 inch almirah', 'daraj', 'wardrobe', 'steel almirah', 'biratnagar'],
    dualKeywords: [
      { formal: 'almirah', colloquial: 'daraj' },
      { formal: 'wardrobe', colloquial: 'kapada rakhne' }
    ],
    description: `Explore our premium 72-inch steel almirah (daraj) collection - the most popular size for master bedrooms in Biratnagar and throughout Nepal. Our 72'' almirahs provide maximum storage capacity with 6 feet of height, perfect for organizing large wardrobes and family belongings.

Each 72-inch steel daraj is manufactured using heavy-duty 22-gauge premium steel with rust-resistant powder coating. Available in 3-door and 4-door configurations featuring multiple compartments, hanging sections, shelving, and secure lock systems. The 72'' wardrobe (kapada rakhne) offers the perfect balance of spacious storage and elegant design.

Popular features include full-length mirrors, internal drawer units, dedicated saree/lehenga hanging sections, and ventilation systems. Our 72-inch models are available in colors including white, cream, blue, brown, and custom shades to match your bedroom décor.

Why Choose Manish Steel 72'' Almirahs:
✓ Largest storage capacity - ideal for master bedrooms and joint families
✓ Factory-direct prices from Rs. 25,000 to Rs. 60,000
✓ Free delivery and expert installation in Biratnagar, Dharan, Itahari, Morang
✓ 5-year warranty on manufacturing and structural integrity
✓ Superior steel quality - lasts 20+ years with proper care
✓ Custom interior layouts available for sarees, suits, and accessories

Perfect for master bedrooms, family homes, and premium residential projects. Our 72-inch steel almirahs (daraj) are trusted by thousands of families across Province 1 for their durability and spacious design.`
  },

  'Ladies Gents Model': {
    focusKeywords: ['ladies gents almirah', 'couples wardrobe', 'double section daraj', 'biratnagar'],
    dualKeywords: [
      { formal: 'almirah', colloquial: 'daraj' },
      { formal: 'wardrobe', colloquial: 'kapada rakhne' }
    ],
    description: `Introducing our specially designed Ladies Gents steel almirah (daraj) - the perfect wardrobe solution for couples in Biratnagar. This innovative design features segregated sections optimized for both ladies' and gents' clothing storage needs, keeping everything organized in one elegant unit.

Our Ladies Gents wardrobe (kapada rakhne) features a unique interior layout with dedicated spaces: ladies' side includes saree hangers, blouse shelves, jewelry drawers, and longer hanging sections for dresses; gents' side features suit hangers, shirt shelves, trouser racks, and tie/belt holders. The dual-section daraj eliminates wardrobe conflicts and maximizes organization efficiency.

Manufactured with premium 22-gauge steel and available in 66-inch and 72-inch heights with 3-door or 4-door configurations. Each compartment includes separate locks, adjustable shelving, and full-length mirrors. Powder-coated finish in contemporary colors suitable for modern bedroom aesthetics.

Why Choose Ladies Gents Almirah from Manish Steel:
✓ Thoughtfully designed separate sections for couples' different storage needs
✓ Prevents wardrobe mix-ups - everything has its dedicated place
✓ Space-efficient - combines two almirahs into one organized unit
✓ Free delivery and installation in Biratnagar, Dharan, Itahari areas
✓ 5-year manufacturing warranty
✓ Custom configurations available based on your specific storage requirements

Ideal for newlywed couples, master bedrooms, and anyone seeking organized wardrobe storage. Our Ladies Gents steel daraj is the most popular choice for modern couples in Morang and Sunsari districts.`
  },

  '3 Door Almirah Model': {
    focusKeywords: ['3 door almirah', 'teen daraj', 'triple door wardrobe', 'biratnagar'],
    dualKeywords: [
      { formal: 'almirah', colloquial: 'daraj' },
      { formal: 'wardrobe', colloquial: 'kapada rakhne' }
    ],
    description: `Browse our versatile 3-door steel almirah (daraj) collection - the most popular configuration for Nepali households in Biratnagar. Our 3-door wardrobes (teen daraj) offer the perfect balance of storage capacity, space efficiency, and affordability for medium to large bedrooms.

Each 3-door steel daraj features three separate compartments with individual locks, providing organized storage for clothes, accessories, and valuables. The center section typically includes a full-length mirror, while side sections feature hanging space and adjustable shelving. This triple-door wardrobe design is ideal for couples or small families.

Available in both 66-inch and 72-inch heights with premium 22-gauge steel construction and powder-coated finish. Popular features include internal drawer units, upper storage boxes, ventilated panels, and color options including white, cream, blue, grey, and customized shades.

Why Choose 3-Door Almirahs from Manish Steel:
✓ Best-selling design - proven storage solution for thousands of Nepal homes
✓ Separate locking compartments for organized storage and privacy
✓ Affordable pricing - Rs. 20,000 to Rs. 45,000 depending on size and features
✓ Free delivery and installation in Biratnagar, Dharan, Itahari, Morang district
✓ 5-year manufacturing warranty on structure and coating
✓ Available in ready stock for immediate delivery

Perfect for master bedrooms, children's rooms, guest rooms, or rental properties. Our 3-door steel almirahs (teen daraj) combine functionality, durability, and value - making them the top choice across Province 1 for reliable wardrobe storage.`
  },

  'Dressing Model': {
    focusKeywords: ['dressing table', 'singarne table', 'makeup table', 'dressing almirah', 'biratnagar'],
    dualKeywords: [
      { formal: 'dressing table', colloquial: 'singarne table' },
      { formal: 'mirror', colloquial: 'aina' }
    ],
    description: `Elevate your bedroom with our elegant dressing table (singarne table) collection manufactured in Biratnagar. Our dressing models combine style and functionality, featuring spacious tabletops, ample storage, and quality mirrors perfect for daily grooming and makeup routines.

Each steel dressing table includes a large mirror (aina), multiple drawers for cosmetics and accessories, and sturdy construction that supports all your grooming essentials. Available as standalone dressing tables or combined dressing-almirah models that maximize bedroom storage while providing dedicated grooming space.

Popular designs include classic wooden-top dressing tables with steel frame, full steel powder-coated models, dressing tables with attached side storage, and complete dressing-wardrobe combinations. All models feature quality mirror glass, smooth-sliding drawers, and durable steel construction that withstands daily use.

Why Choose Manish Steel Dressing Tables:
✓ Multiple designs from simple to elaborate - Rs. 8,000 to Rs. 35,000
✓ Combined dressing-almirah models save space in smaller bedrooms
✓ Quality mirrors with protective backing for long-lasting clarity
✓ Free delivery and assembly in Biratnagar, Dharan, Itahari areas
✓ 5-year warranty on steel structure and craftsmanship
✓ Custom designs available to match your bedroom furniture

Perfect for master bedrooms, ladies' rooms, beauty salons, or bridal trousseau. Our dressing tables (singarne table) and dressing-almirah combinations are popular choices for brides and modern homes across Morang district seeking elegant grooming furniture.`
  },

  '3 Piece Almirah model': {
    focusKeywords: ['3 piece almirah', 'modular wardrobe', 'teen tukra daraj', 'biratnagar'],
    dualKeywords: [
      { formal: 'almirah', colloquial: 'daraj' },
      { formal: 'wardrobe set', colloquial: 'kapada rakhne set' }
    ],
    description: `Transform your bedroom with our comprehensive 3-piece almirah set (teen tukra daraj) - a complete bedroom storage solution from Biratnagar. Our 3-piece wardrobe systems include a main almirah, dressing table, and side storage unit, creating a coordinated and functional bedroom furniture ensemble.

The 3-piece steel daraj set typically includes: (1) Large 66'' or 72'' main wardrobe with hanging space and shelves, (2) Dressing table with mirror and drawers, and (3) Side cabinet or smaller almirah for additional storage. All pieces feature matching design, color, and finish for a cohesive bedroom aesthetic.

Manufactured with premium steel construction and powder-coated finish, each component is designed to complement the others while providing specialized storage. The modular 3-piece design allows flexible room arrangement while maximizing storage capacity without custom carpentry costs.

Why Choose 3-Piece Almirah Sets from Manish Steel:
✓ Complete bedroom solution - coordinated design saves shopping time
✓ Better value than buying pieces separately - set pricing Rs. 45,000 to Rs. 85,000
✓ Consistent quality across all pieces with matching finish
✓ Free delivery and complete bedroom setup in Biratnagar, Dharan, Itahari
✓ 5-year warranty covering entire 3-piece set
✓ Customization options for colors and internal configurations

Ideal for newlyweds setting up their first home, bedroom renovations, or anyone seeking a complete coordinated storage solution. Our 3-piece steel almirah sets (teen tukra daraj) are popular trousseau items and provide comprehensive bedroom organization across Province 1.`
  },

  'Office Models': {
    focusKeywords: ['office furniture', 'office almirah', 'filing cabinet', 'office table', 'biratnagar'],
    dualKeywords: [
      { formal: 'filing cabinet', colloquial: 'file rakhne' },
      { formal: 'office desk', colloquial: 'office table' }
    ],
    description: `Equip your workspace with professional office furniture models from Biratnagar's trusted manufacturer. Our office collection includes filing cabinets, office almirahs, executive desks, workstations, conference tables, and complete office setup solutions for businesses, government offices, and institutions.

Our office models feature heavy-duty steel construction designed for commercial use, with powder-coated finishes that withstand daily workplace demands. Filing cabinets (file rakhne) include secure locking systems, smooth drawer slides, and organized document storage. Office almirahs provide storage for supplies, records, and equipment with adjustable shelving and multiple locking options.

Popular office furniture includes: L-shaped executive desks with storage, computer workstations with cable management, 3-drawer and 4-drawer filing cabinets, office storage almirahs, reception counters, conference tables, and modular workstation systems. All models available in professional colors including grey, black, white, and woodgrain finishes.

Why Choose Manish Steel for Office Furniture:
✓ Bulk order discounts for corporate and institutional clients
✓ Free site visit and office space planning consultation
✓ Complete office furnishing from single source - tables, almirahs, filing, seating
✓ Delivery and installation across Biratnagar, Dharan, Itahari, Province 1
✓ 5-year warranty on commercial-grade furniture
✓ Custom branding and specifications available for large orders

Trusted by banks, government offices, schools, hospitals, and businesses across Morang and Sunsari districts. From single filing cabinets to complete office buildouts, we deliver quality commercial furniture with competitive factory-direct pricing. Contact 9824336371 for bulk quotations.`
  }
};

// Define Category Schema inline to avoid TS import issues
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  // SEO fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  focusKeywords: {
    type: [String],
    default: []
  },
  dualKeywords: {
    type: [{
      formal: {
        type: String,
        required: true
      },
      colloquial: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  faqs: {
    type: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }],
    default: []
  }
});

// Create indexes
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ displayOrder: 1 });

async function enrichCategories() {
  try {
    console.log('🚀 Category Description Enrichment Script\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved\n');
    }

    if (targetCategory) {
      console.log(`🎯 Targeting specific category: ${targetCategory}\n`);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get or create Category model
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

    // Find all categories or specific category
    const query = targetCategory ? { name: targetCategory } : {};
    const categories = await Category.find(query).exec();
    
    console.log(`📊 Found ${categories.length} categories to process\n`);

    if (categories.length === 0) {
      console.log('⚠️  No categories found matching criteria');
      await mongoose.disconnect();
      process.exit(0);
    }

    let enrichedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const category of categories) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Processing: ${category.name}`);
        
        const currentWordCount = category.description ? category.description.split(/\s+/).length : 0;
        console.log(`Current word count: ${currentWordCount}`);

        // Check if this category has a template
        const template = categoryDescriptions[category.name];
        
        if (!template) {
          console.log(`⚠️  No enrichment template found for "${category.name}"`);
          console.log(`   Available templates: ${Object.keys(categoryDescriptions).join(', ')}`);
          skippedCount++;
          continue;
        }

        // Check if already has rich description
        if (currentWordCount >= 200 && !args.includes('--force')) {
          console.log(`✓ Category already has rich description (${currentWordCount} words)`);
          console.log(`  Use --force flag to overwrite`);
          skippedCount++;
          continue;
        }

        const enrichedDescription = template.description;
        const newWordCount = enrichedDescription.split(/\s+/).length;
        
        console.log(`New word count: ${newWordCount}`);
        console.log(`Focus keywords: ${template.focusKeywords.join(', ')}`);
        console.log(`Dual keywords: ${template.dualKeywords.map(k => `${k.formal}/${k.colloquial}`).join(', ')}`);

        // Show preview
        console.log(`\n📄 Description Preview:`);
        console.log(enrichedDescription.substring(0, 250) + '...\n');

        if (!dryRun) {
          // Update category
          category.description = enrichedDescription;
          category.focusKeywords = template.focusKeywords;
          category.dualKeywords = template.dualKeywords;
          
          // Set meta title and description if not already set
          if (!category.metaTitle) {
            category.metaTitle = `${category.name} in Biratnagar | श्री मनिष स्टील`;
          }
          
          if (!category.metaDescription) {
            // Create meta description from first 150 chars
            const metaDesc = enrichedDescription
              .replace(/\n/g, ' ')
              .replace(/✓/g, '')
              .substring(0, 150)
              .trim() + '...';
            category.metaDescription = metaDesc;
          }

          await category.save();
          console.log(`✅ Updated in database`);
        }

        enrichedCount++;

      } catch (error) {
        console.error(`❌ Error processing ${category.name}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`\n📊 Enrichment Summary:\n`);
    console.log(`Total categories found: ${categories.length}`);
    console.log(`Enriched: ${enrichedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (dryRun) {
      console.log(`\n💡 Tip: Run without --dry-run to save changes to database`);
    }

    if (skippedCount > 0) {
      console.log(`\n💡 Tip: Categories with existing descriptions were skipped. Use --force to overwrite.`);
    }

    await mongoose.disconnect();
    console.log(`\n✅ Complete!\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

enrichCategories();
