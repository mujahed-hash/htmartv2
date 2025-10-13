/**
 * Migration Script: Add Default Locations to Existing Products
 * 
 * This script adds default location (Mumbai, Maharashtra) to all existing products
 * that don't have a locations field.
 * 
 * Run this script once after deploying the new product schema:
 * node migrations/addDefaultLocations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../database/models/product');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotelmart', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Default location to assign to products without locations
const DEFAULT_LOCATION = {
    state: 'Maharashtra',
    city: 'Mumbai',
    stateCode: 'MH',
    cityCode: 'mumbai'
};

const migrateProducts = async () => {
    try {
        console.log('\n🚀 Starting product migration...\n');

        // Find all products without locations field or with empty locations array
        const productsWithoutLocation = await Product.find({
            $or: [
                { locations: { $exists: false } },
                { locations: { $size: 0 } },
                { locations: null }
            ]
        });

        console.log(`📊 Found ${productsWithoutLocation.length} products without locations\n`);

        if (productsWithoutLocation.length === 0) {
            console.log('✨ All products already have locations assigned!');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Update each product with default location
        for (const product of productsWithoutLocation) {
            try {
                product.locations = [DEFAULT_LOCATION];
                
                // Also set default values for other new fields if they don't exist
                if (!product.condition) product.condition = 'new';
                if (!product.businessType) product.businessType = 'supplier';
                if (product.deliveryAvailable === undefined) product.deliveryAvailable = true;
                if (!product.estimatedDeliveryDays) product.estimatedDeliveryDays = 7;
                if (product.minOrderQuantity === undefined) product.minOrderQuantity = 1;
                if (product.averageRating === undefined) product.averageRating = 0;
                if (product.totalReviews === undefined) product.totalReviews = 0;
                if (product.views === undefined) product.views = 0;
                if (product.isActive === undefined) product.isActive = true;
                if (!product.tags) product.tags = [];
                if (!product.lastUpdated) product.lastUpdated = Date.now();

                await product.save();
                successCount++;
                console.log(`✅ Updated product: ${product.prodName} (${product._id})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Error updating product ${product._id}:`, error.message);
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`  ✅ Successfully updated: ${successCount} products`);
        console.log(`  ❌ Failed: ${errorCount} products`);
        console.log(`  📍 Default location assigned: Mumbai, Maharashtra`);
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    }
};

// Run migration
const runMigration = async () => {
    await connectDB();
    await migrateProducts();
    
    console.log('\n🎉 Migration completed!');
    console.log('💡 Tip: Suppliers can now update their product locations from the product edit form\n');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
};

// Execute migration
runMigration().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

