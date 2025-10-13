const Service = require('../database/models/service');
const User = require('../database/models/user');
const ServiceCategory = require('../database/models/serviceCategory');
const slugify = require('slugify');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.createService = async (req, res) => {
    try {
        console.log('Backend: Service creation request received');
        console.log('Backend: Request body:', req.body);
        console.log('Backend: Request files:', req.files);
        console.log('Backend: User ID:', req.userId);

        const userId = req.userId;
        const { serviceName, serviceDesc, price, categoryCustomIdentifier, availableRegions, contactPhone, contactEmail } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        let categoryId = null;
        if (categoryCustomIdentifier) {
            const foundCategory = await ServiceCategory.findOne({ customIdentifier: categoryCustomIdentifier });
            if (foundCategory) {
                categoryId = foundCategory._id;
            } else {
                return res.status(400).json({ error: 'Invalid service category custom identifier provided.' });
            }
        }

        const files = req.files;
        let images = [];
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const basePath = `${protocol}://${req.get('host')}/uploads/services`;

        if (files && files.length > 0) {
            files.forEach(file => {
                images.push(`${basePath}/${file.filename}`);
            });
        }

        const service = new Service({
            serviceName,
            serviceDesc,
            user: userId,
            images,
            price: price || 0,
            category: categoryId,
            availableRegions: availableRegions ? JSON.parse(availableRegions) : [],
            contactInfo: {
                phone: contactPhone || '',
                email: contactEmail || '',
            },
            customIdentifier: `${slugify(serviceName, { lower: true, strict: true })}-${Date.now()}`,
            isApproved: true, // Auto-approve for immediate visibility
            isActive: true, // Default to active
        });

        const savedService = await service.save();

        // Optionally, push the service to the user's services array (if defined in User schema)
        await User.findByIdAndUpdate(
            userId,
            { $push: { services: savedService._id } }, // Assuming 'services' array in User schema
            { new: true, upsert: true }
        );

        res.status(201).json(savedService);

    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Server error while creating service.', details: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        const { categoryCustomIdentifier, userId, isApproved, isActive, search, start = 0, limit = 10 } = req.query;
        let filter = {};

        if (categoryCustomIdentifier) {
            const category = await ServiceCategory.findOne({ customIdentifier: categoryCustomIdentifier });
            if (category) {
                filter.category = category._id;
            } else {
                return res.status(404).json({ message: 'Category not found.' });
            }
        }

        if (userId) {
            filter.user = userId;
        }

        if (isApproved !== undefined) {
            filter.isApproved = isApproved === 'true';
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (search) {
            filter.$or = [
                { serviceName: { $regex: search, $options: 'i' } },
                { serviceDesc: { $regex: search, $options: 'i' } },
                { availableRegions: { $regex: search, $options: 'i' } }
            ];
        }

        const services = await Service.find(filter)
            .select('serviceName serviceDesc price images user category contactInfo availableRegions isActive isApproved customIdentifier date')
            .populate('user', 'name') // Only populate 'name' as per user's request
            .populate('category', 'name customIdentifier') // Populate category details
            .sort({ date: -1 })
            .skip(parseInt(start))
            .limit(parseInt(limit));


        const totalServices = await Service.countDocuments(filter);

        res.status(200).json({
            totalServices,
            services
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Server error while fetching services.', details: error.message });
    }
};

// New endpoint specifically for all-services page - only returns active and approved services
exports.getActiveServices = async (req, res) => {
    console.log('Received request for getActiveServices');
    console.log('Request Headers:', req.headers);
    console.log('Request Query:', req.query);
    
    // Check if token exists and is valid, but don't require it
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            userId = decoded.userId;
            console.log('User authenticated:', userId);
        } catch (error) {
            console.log('Invalid token provided, continuing as unauthenticated user');
        }
    } else {
        console.log('No token provided, continuing as unauthenticated user');
    }
    
    try {
        const { categoryCustomIdentifier, search, region, start = 0, limit = 10 } = req.query;
        console.log(`getActiveServices: Received start=${start}, limit=${limit}, region=${region}`); // Added log
        
        // Base filter - only services that are BOTH active AND approved (for public marketplace)
        let filter = {
            isActive: true,
            isApproved: true
        };

        // If user is authenticated, also include their own services for management (even if not approved)
        if (userId) {
            filter = {
                $or: [
                    {
                        isActive: true,
                        isApproved: true // Public marketplace filter
                    },
                    {
                        user: userId // Include services owned by the authenticated user (for management)
                    }
                ]
            };
        }

        // Optional category filter
        if (categoryCustomIdentifier) {
            console.log('Filtering by category:', categoryCustomIdentifier);
            
            // Handle multiple categories (comma-separated)
            const categoryIdentifiers = categoryCustomIdentifier.split(',').map(id => id.trim()).filter(id => id);
            console.log('Parsed category identifiers:', categoryIdentifiers);
            
            if (categoryIdentifiers.length === 1) {
                // Single category
                const category = await ServiceCategory.findOne({ customIdentifier: categoryIdentifiers[0] });
                if (category) {
                    filter.category = category._id;
                } else {
                    return res.status(404).json({ message: 'Category not found.' });
                }
            } else {
                // Multiple categories - find all category IDs
                const categories = await ServiceCategory.find({ 
                    customIdentifier: { $in: categoryIdentifiers } 
                });
                
                if (categories.length === 0) {
                    return res.status(404).json({ message: 'No categories found.' });
                }
                
                const categoryIds = categories.map(cat => cat._id);
                filter.category = { $in: categoryIds };
                console.log('Multiple categories filter:', filter.category);
            }
        }

        // Optional region filter
        if (region) {
            console.log('Filtering by region:', region);
            
            // Handle multiple regions (comma-separated)
            const regions = region.split(',').map(r => r.trim()).filter(r => r);
            console.log('Parsed regions:', regions);
            
            if (regions.length === 1) {
                // Single region - use regex for partial matching
                filter.availableRegions = { 
                    $elemMatch: { 
                        $regex: regions[0], 
                        $options: 'i' 
                    }
                };
            } else {
                // Multiple regions - use $or with multiple $elemMatch conditions
                filter.$or = filter.$or || [];
                regions.forEach(regionName => {
                    filter.$or.push({
                        availableRegions: { 
                            $elemMatch: { 
                                $regex: regionName, 
                                $options: 'i' 
                            }
                        }
                    });
                });
            }
            
            console.log('Region filter applied:', filter.availableRegions);
            console.log('Full filter with $or:', filter);
        }

        // Optional search filter
        if (search) {
            const searchConditions = [
                { serviceName: { $regex: search, $options: 'i' } },
                { serviceDesc: { $regex: search, $options: 'i' } },
                { availableRegions: { $regex: search, $options: 'i' } }
            ];
            
            if (filter.$or) {
                // If we already have $or from region filtering, combine them
                filter.$and = [
                    { $or: filter.$or },
                    { $or: searchConditions }
                ];
                delete filter.$or;
            } else {
                filter.$or = searchConditions;
            }
        }

        console.log('Final filter being applied:', JSON.stringify(filter, null, 2));
        console.log('Filter type:', typeof filter);
        console.log('Filter keys:', Object.keys(filter));
        const services = await Service.find(filter)
            .select('serviceName serviceDesc price images user category contactInfo availableRegions isActive isApproved customIdentifier date')
            .populate('user', '_id name customIdentifier email phone image') // Include _id and more user fields for contact
            .populate('category', 'name customIdentifier') // Populate category details
            .sort({ date: -1 }) // Newest first
            .skip(parseInt(start))
            .limit(parseInt(limit));

        const totalServices = await Service.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalServices,
            services,
            message: `Found ${services.length} active services`
        });
    } catch (error) {
        console.error('Error fetching active services:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error while fetching active services.',
            details: error.message 
        });
    }
};

// Get all unique regions from active and approved services
exports.getAllRegions = async (req, res) => {
    try {
        console.log('Getting all unique regions...');
        
        // Get all unique regions from active and approved services
        const regions = await Service.aggregate([
            {
                $match: {
                    isActive: true,
                    isApproved: true
                }
            },
            {
                $unwind: '$availableRegions'
            },
            {
                $match: {
                    availableRegions: { $exists: true, $ne: null, $ne: '' }
                }
            },
            {
                $group: {
                    _id: null,
                    regions: { $addToSet: '$availableRegions' }
                }
            }
        ]);

        let uniqueRegions = [];
        if (regions.length > 0 && regions[0].regions) {
            // Normalize regions (trim, handle case-insensitive duplicates)
            const regionMap = new Map();
            regions[0].regions.forEach(region => {
                if (region && region.trim()) {
                    const normalizedRegion = region.trim();
                    const lowerCaseRegion = normalizedRegion.toLowerCase();
                    
                    // Keep the version with proper capitalization
                    if (!regionMap.has(lowerCaseRegion) || 
                        (normalizedRegion[0] === normalizedRegion[0].toUpperCase() && 
                         regionMap.get(lowerCaseRegion)[0] !== regionMap.get(lowerCaseRegion)[0].toUpperCase())) {
                        regionMap.set(lowerCaseRegion, normalizedRegion);
                    }
                }
            });
            
            uniqueRegions = Array.from(regionMap.values()).sort();
        }

        console.log('Found unique regions:', uniqueRegions);
        res.status(200).json({
            success: true,
            regions: uniqueRegions,
            count: uniqueRegions.length
        });
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error while fetching regions.',
            details: error.message 
        });
    }
};

exports.getServiceByCustomIdentifier = async (req, res) => {
    // Check if token exists and is valid, but don't require it
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            userId = decoded.userId;
            console.log('User authenticated:', userId);
        } catch (error) {
            console.log('Invalid token provided, continuing as unauthenticated user');
        }
    } else {
        console.log('No token provided, continuing as unauthenticated user');
    }
    
    try {
        const { customIdentifier } = req.params;
        console.log('Getting service by customIdentifier:', customIdentifier);

        const service = await Service.findOne({ customIdentifier })
            .select('serviceName serviceDesc price images user category contactInfo availableRegions isActive isApproved customIdentifier date')
            .populate('user', '_id name customIdentifier email phone image') // Include _id and more user fields for contact
            .populate('category', 'name customIdentifier');
            console.log('Service found with user:', service?.user);
        console.log('Service found with user:', service ? {
            serviceId: service._id,
            serviceName: service.serviceName,
            user: service.user ? {
                _id: service.user._id,
                name: service.user.name,
                customIdentifier: service.user.customIdentifier
            } : 'No user'
        } : 'No service found');


        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        res.status(200).json(service);

    } catch (error) {
        console.error('Error fetching service by custom identifier:', error);
        res.status(500).json({ error: 'Server error while fetching service.', details: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const userId = req.userId;
        const { customIdentifier } = req.params;
        const { serviceName, serviceDesc, price, categoryCustomIdentifier, availableRegions, contactPhone, contactEmail, isApproved, isActive } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        let service = await Service.findOne({ customIdentifier }).populate('user', '_id name');

        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        // Get roles directly from the JWT token via req.user
        const isOwner = service.user && service.user._id ? service.user._id.toString() === userId.toString() : false;
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        
        console.log('Update Authorization Check:', {
            userId,
            serviceUserId: service.user ? service.user._id : null,
            isOwner,
            isAdmin,
            tokenRoles: req.user ? { isAdmin: req.user.isAdmin, isSuperAdmin: req.user.isSuperAdmin } : null
        });

        // Allow if user is owner OR (is admin/superadmin)
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to update this service.' });
        }

        // Update fields
        if (serviceName) service.serviceName = serviceName;
        if (serviceDesc) service.serviceDesc = serviceDesc;
        if (price !== undefined) service.price = price;

        if (categoryCustomIdentifier) {
            const foundCategory = await ServiceCategory.findOne({ customIdentifier: categoryCustomIdentifier });
            if (foundCategory) {
                service.category = foundCategory._id;
            } else {
                return res.status(400).json({ error: 'Invalid service category custom identifier provided.' });
            }
        }

        if (availableRegions) service.availableRegions = JSON.parse(availableRegions);
        if (contactPhone) service.contactInfo.phone = contactPhone;
        if (contactEmail) service.contactInfo.email = contactEmail;

        // Admin/Superadmin only fields
        if (isAdmin) {
            if (isApproved !== undefined) service.isApproved = isApproved === 'true';
            if (isActive !== undefined) service.isActive = isActive === 'true';
            console.log('Admin/SuperAdmin is updating special fields:', { isApproved, isActive });
        }

        // Handle image uploads if any
        const files = req.files;
        if (files && files.length > 0) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const basePath = `${protocol}://${req.get('host')}/uploads/services`;
            
            // Remove old images if they exist before adding new ones
            if (service.images && service.images.length > 0) {
                service.images.forEach(imageUrl => {
                    const imageFileName = imageUrl.split('/').pop();
                    const imageFilePath = path.join(__dirname, '..', 'uploads', 'services', imageFileName);
                    fs.unlink(imageFilePath, (err) => {
                        if (err) console.error('Error deleting old service image:', err);
                    });
                });
            }

            service.images = files.map(file => `${basePath}/${file.filename}`);
        }

        const updatedService = await service.save();

        res.status(200).json(updatedService);

    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Server error while updating service.', details: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const userId = req.userId;
        const { customIdentifier } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const service = await Service.findOne({ customIdentifier }).populate('user');

        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        // Get roles directly from the JWT token via req.user
        const isOwner = service.user && service.user._id ? service.user._id.toString() === userId.toString() : false;
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        
        console.log('Delete Authorization Check:', {
            userId,
            serviceUserId: service.user ? service.user._id : null,
            isOwner,
            isAdmin,
            tokenRoles: req.user ? { isAdmin: req.user.isAdmin, isSuperAdmin: req.user.isSuperAdmin } : null
        });

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to delete this service.' });
        }

        // Remove associated images from storage
        if (service.images && service.images.length > 0) {
            service.images.forEach(imageUrl => {
                const imageFileName = imageUrl.split('/').pop();
                const imageFilePath = path.join(__dirname, '..', 'uploads', 'services', imageFileName);
                fs.unlink(imageFilePath, (err) => {
                    if (err) console.error('Error deleting service image:', err);
                });
            });
        }

        await Service.deleteOne({ _id: service._id });

        // Remove service reference from user's services array (if applicable)
        await User.findByIdAndUpdate(
            userId,
            { $pull: { services: service._id } },
            { new: true }
        );

        res.status(200).json({ message: 'Service deleted successfully.' });

    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Server error while deleting service.', details: error.message });
    }
};

exports.approveService = async (req, res) => {
    try {
        const { customIdentifier } = req.params;
        
        // Verify admin permissions from JWT
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to approve services.' });
        }
        
        console.log('Approval Authorization:', {
            userId: req.userId,
            tokenRoles: req.user ? { isAdmin: req.user.isAdmin, isSuperAdmin: req.user.isSuperAdmin } : null
        });

        const service = await Service.findOne({ customIdentifier });
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        service.isApproved = true;
        const updatedService = await service.save();

        res.status(200).json({ message: 'Service approved successfully.', service: updatedService });

    } catch (error) {
        console.error('Error approving service:', error);
        res.status(500).json({ error: 'Server error while approving service.', details: error.message });
    }
};

exports.toggleServiceStatus = async (req, res) => {
    try {
        const { customIdentifier } = req.params;
        
        // Verify admin permissions from JWT
        const isAdmin = req.user && (req.user.isAdmin === true || req.user.isSuperAdmin === true);
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to change service status.' });
        }
        
        console.log('Toggle Status Authorization:', {
            userId: req.userId,
            tokenRoles: req.user ? { isAdmin: req.user.isAdmin, isSuperAdmin: req.user.isSuperAdmin } : null
        });

        const service = await Service.findOne({ customIdentifier });
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        service.isActive = !service.isActive;
        const updatedService = await service.save();

        res.status(200).json({ message: `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully.`, service: updatedService });

    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({ error: 'Server error while toggling service status.', details: error.message });
    }
};
