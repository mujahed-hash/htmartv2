const ServiceCategory = require('../database/models/serviceCategory');
const slugify = require('slugify');
const { Service } = require('../database/models/service');
const path = require('path');
const fs = require('fs');

/**
 * Create a new service category
 * Only admin/superadmin can create categories
 */
exports.createServiceCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, sortOrder } = req.body;
        const userId = req.userId;

        // Verify admin permissions from JWT
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only administrators can create service categories.' });
        }
        
        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: 'Category name is required.' });
        }

        // Generate a unique custom identifier
        const customIdentifier = `${slugify(name, { lower: true, strict: true })}-${Date.now()}`;

        // Handle image upload
        let image = '';
        if (req.file) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const basePath = `${protocol}://${req.get('host')}/uploads/service-categories`;
            image = `${basePath}/${req.file.filename}`;
        }

        // Handle parentCategory - treat 'none', empty string, or undefined/null as null
        let parentCategoryValue = null;
        if (parentCategory && parentCategory !== 'none' && parentCategory !== '') {
            parentCategoryValue = parentCategory;
        }

        // Create the category
        const serviceCategory = new ServiceCategory({
            name,
            description: description || '',
            image,
            customIdentifier,
            sortOrder: sortOrder || 0,
            parentCategory: parentCategoryValue
        });

        const savedCategory = await serviceCategory.save();
        
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error('Error creating service category:', error);
        res.status(500).json({ error: 'Server error while creating service category.', details: error.message });
    }
};

/**
 * Get all service categories
 * Public access
 */
exports.getServiceCategories = async (req, res) => {
    try {
        const { active, parentCategory } = req.query;
        let filter = {};
        
        // Filter by active status if specified
        if (active !== undefined) {
            filter.isActive = active === 'true';
        }
        
        // Filter by parent category if specified
        if (parentCategory) {
            if (parentCategory === 'none') {
                filter.parentCategory = null;
            } else {
                filter.parentCategory = parentCategory;
            }
        }
        
        // Get categories with optional population of parent
        const serviceCategories = await ServiceCategory.find(filter)
            .populate('parentCategory', 'name customIdentifier')
            .sort({ sortOrder: 1, name: 1 });
        
        // Get count of services in each category
        const categoriesWithCounts = await Promise.all(serviceCategories.map(async (category) => {
            const count = await Service.countDocuments({ category: category._id });
            const categoryObj = category.toObject();
            categoryObj.serviceCount = count;
            return categoryObj;
        }));
        
        res.status(200).json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching service categories:', error);
        res.status(500).json({ error: 'Server error while fetching service categories.', details: error.message });
    }
};

/**
 * Get a single service category by ID or custom identifier
 * Public access
 */
exports.getServiceCategory = async (req, res) => {
    try {
        const { identifier } = req.params;
        let serviceCategory;
        
        // Check if identifier is ObjectId or custom identifier string
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            serviceCategory = await ServiceCategory.findById(identifier)
                .populate('parentCategory', 'name customIdentifier');
        } else {
            serviceCategory = await ServiceCategory.findOne({ customIdentifier: identifier })
                .populate('parentCategory', 'name customIdentifier');
        }
        
        if (!serviceCategory) {
            return res.status(404).json({ error: 'Service category not found.' });
        }
        
        // Count services in this category
        const serviceCount = await Service.countDocuments({ category: serviceCategory._id });
        const categoryObj = serviceCategory.toObject();
        categoryObj.serviceCount = serviceCount;
        
        res.status(200).json(categoryObj);
    } catch (error) {
        console.error('Error fetching service category:', error);
        res.status(500).json({ error: 'Server error while fetching service category.', details: error.message });
    }
};

/**
 * Update a service category
 * Only admin/superadmin can update categories
 */
exports.updateServiceCategory = async (req, res) => {
    try {
        const { identifier } = req.params;
        const { name, description, parentCategory, isActive, sortOrder } = req.body;
        
        // Verify admin permissions from JWT
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only administrators can update service categories.' });
        }
        
        // Find the category
        let serviceCategory;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            serviceCategory = await ServiceCategory.findById(identifier);
        } else {
            serviceCategory = await ServiceCategory.findOne({ customIdentifier: identifier });
        }
        
        if (!serviceCategory) {
            return res.status(404).json({ error: 'Service category not found.' });
        }
        
        // Update fields if provided
        if (name) serviceCategory.name = name;
        if (description !== undefined) serviceCategory.description = description;
        if (isActive !== undefined) serviceCategory.isActive = isActive === 'true';
        if (sortOrder !== undefined) serviceCategory.sortOrder = sortOrder;
        
        // Handle parent category
        if (parentCategory !== undefined) {
            if (parentCategory === 'none' || parentCategory === '') {
                serviceCategory.parentCategory = null;
            } else {
                // Validate parent category exists and is not the category itself
                if (parentCategory === serviceCategory._id.toString()) {
                    return res.status(400).json({ error: 'A category cannot be its own parent.' });
                }
                
                try {
                    const parentExists = await ServiceCategory.findById(parentCategory);
                    if (!parentExists) {
                        return res.status(400).json({ error: 'Parent category does not exist.' });
                    }
                    
                    serviceCategory.parentCategory = parentCategory;
                } catch (err) {
                    // If error occurs (like invalid ObjectId format), set to null
                    console.error('Invalid parent category ID:', err);
                    serviceCategory.parentCategory = null;
                }
            }
        }
        
        // Handle image upload
        if (req.file) {
            // Delete old image if exists
            if (serviceCategory.image) {
                const oldImagePath = serviceCategory.image.split('/').pop();
                const imagePath = path.join(__dirname, '..', 'uploads', 'service-categories', oldImagePath);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const basePath = `${protocol}://${req.get('host')}/uploads/service-categories`;
            serviceCategory.image = `${basePath}/${req.file.filename}`;
        }
        
        const updatedCategory = await serviceCategory.save();
        
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating service category:', error);
        res.status(500).json({ error: 'Server error while updating service category.', details: error.message });
    }
};

/**
 * Delete a service category
 * Only admin/superadmin can delete categories
 */
exports.deleteServiceCategory = async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Verify admin permissions from JWT
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only administrators can delete service categories.' });
        }
        
        // Find the category
        let serviceCategory;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            serviceCategory = await ServiceCategory.findById(identifier);
        } else {
            serviceCategory = await ServiceCategory.findOne({ customIdentifier: identifier });
        }
        
        if (!serviceCategory) {
            return res.status(404).json({ error: 'Service category not found.' });
        }
        
        // Check if category has services
        const servicesCount = await Service.countDocuments({ category: serviceCategory._id });
        if (servicesCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category with associated services. Please reassign or delete the services first.',
                servicesCount
            });
        }
        
        // Check if category has child categories
        const childCategoriesCount = await ServiceCategory.countDocuments({ parentCategory: serviceCategory._id });
        if (childCategoriesCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with child categories. Please reassign or delete child categories first.',
                childCategoriesCount
            });
        }
        
        // Delete image if exists
        if (serviceCategory.image) {
            const imageName = serviceCategory.image.split('/').pop();
            const imagePath = path.join(__dirname, '..', 'uploads', 'service-categories', imageName);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Delete the category
        await ServiceCategory.findByIdAndDelete(serviceCategory._id);
        
        res.status(200).json({ message: 'Service category deleted successfully.' });
    } catch (error) {
        console.error('Error deleting service category:', error);
        res.status(500).json({ error: 'Server error while deleting service category.', details: error.message });
    }
};

/**
 * Get services by category
 * Public access
 */
exports.getServicesByCategory = async (req, res) => {
    try {
        const { identifier } = req.params;
        const { limit = 10, skip = 0, active } = req.query;
        
        // Find the category
        let categoryId;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            const category = await ServiceCategory.findById(identifier);
            if (category) categoryId = category._id;
        } else {
            const category = await ServiceCategory.findOne({ customIdentifier: identifier });
            if (category) categoryId = category._id;
        }
        
        if (!categoryId) {
            return res.status(404).json({ error: 'Service category not found.' });
        }
        
        // Build filter
        const filter = { category: categoryId };
        if (active !== undefined) {
            filter.isActive = active === 'true';
        }
        
        // Get services
        const services = await Service.find(filter)
            .populate('user', 'name')
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .sort({ date: -1 });
        
        // Get total count
        const total = await Service.countDocuments(filter);
        
        res.status(200).json({
            total,
            services
        });
    } catch (error) {
        console.error('Error fetching services by category:', error);
        res.status(500).json({ error: 'Server error while fetching services by category.', details: error.message });
    }
};
