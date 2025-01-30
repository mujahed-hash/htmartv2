const Category = require('../database/models/category');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { itemType, itemName } = req.body;

        const randomComponent = Date.now().toString(); // You can replace this with your own logic
        const customIdentifer = `${slugify(itemType, { lower: true })}-${randomComponent}`;
        const files = req.files;
        let image = [];
        const basePath = `${req.protocol}://${req.get('host')}/uploads/categories`;

        if (files && files.length > 0) {
            files.forEach(file => {
                image.push(`${basePath}/${file.filename}`);
            });
        }
        const category = new Category({
            itemType,
            itemName,
            customIdentifer,
            image: image
        });

        const categoryData = await category.save();

        res.status(201).json(categoryData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// List all categories
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById({ id: id });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

 
};
exports.getCategoryByCId = async (req, res) => {
    try {
        const { customIdentifier } = req.params;

        const category = await Category.findById({ customIdentifer: customIdentifier });

        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

 
};



exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params; // Get the category ID from the URL
        const { itemType, itemName } = req.body; // Get updated data from the request body

        // Find the category by ID
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const files = req.files;
        const basePath = `${req.protocol}://${req.get('host')}/uploads/categories`;
        
        // Helper function to delete files from the local system
        const deleteFiles = (files) => {
            files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'uploads', 'categories', path.basename(file));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        };

        // If new files were uploaded, replace existing images
        if (files && files.length > 0) {
            // Delete existing images from the filesystem
            if (category.image && category.image.length > 0) {
                const oldImagePaths = category.image.map(img => img.replace(basePath + '/', ''));
                deleteFiles(oldImagePaths);
            }

            // Save new images
            const newImages = files.map(file => `${basePath}/${file.filename}`);
            category.image = newImages;
        }

        // Update other fields if provided
        if (itemType) {
            category.itemType = itemType;
        }
        if (itemName) {
            category.itemName = itemName;
        }

        // Save the updated category
        const updatedCategory = await category.save();

        // Return the updated category data
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Server error');
    }
};




exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        
        const result = await Category.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};