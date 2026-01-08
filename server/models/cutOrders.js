const mongoose = require('mongoose');

const cutOrderSchema = new mongoose.Schema({
    // What needs to be produced
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
        index: true
    },
    productName: {type: String, required: true}, // Denormalized for history
    category: {type: String, required: true},

    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    variantName: {type: String, required: true}, // e.g., "Red, Medium"

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    // Optional: Link to customer order if this is for a specific order
    relatedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders'
    },

    // Materials needed for this cut order
    materialsRequired: [{
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Materials',
            required: true
        },
        materialName: {type: String, required: true},
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        variantName: {type: String, required: true}, // e.g., "Brown"
        quantityNeeded: {
            type: Number,
            required: true,
            min: 0
        },
        listsNeeded: {
            type: Number,
            min: 0
        },
        // Track if materials were allocated/reserved
        reserved: {
            type: Boolean,
            default: false
        }
    }],

    // Materials actually used (filled when cutting is done)
    materialsUsed: [{
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Materials',
            required: true
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        quantityUsed: {
            type: Number,
            required: true
        },
        listsUsed: {
            type: Number
        },
        // Track wastage
        wastage: {
            type: Number,
            default: 0
        }
    }],

    // Cost tracking (auto-calculated via pre-save hook)
    estimatedMaterialCost: {
        type: Number,
        default: 0
    },
    actualMaterialCost: {
        type: Number,
        default: 0
    },

    // Who requested/created this cut order
    createdBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
    },

    // Laser cutting assignment
    assignedToCutting: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
        firstName: {type: String},
        lastName: {type: String},
        assignedDate: {type: Date}
    },

    // Production/assembly assignment
    assignedToProduction: {
        group: {type: String},
        assignedDate: {type: Date},
    },

    // Status workflow
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'CUTTING', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING',
        index: true
    },

    // Priority for urgent orders
    priority: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
        default: 'NORMAL'
    },

    // Dates
    addedDate: {type: Date, required: true, default: Date.now, index: true},
    dueDate: {type: Date},
    cuttingStartedDate: {type: Date},
    cuttingCompletedDate: {type: Date},
    productionStartedDate: {type: Date},
    completedDate: {type: Date},

    // Additional info
    instructions: {type: String},
    notes: {type: String},

    // Track issues
    issues: [{
        description: {type: String, required: true},
        reportedBy: {
            userId: mongoose.Schema.Types.ObjectId,
            name: String
        },
        reportedDate: {type: Date, default: Date.now},
        resolved: {type: Boolean, default: false}
    }]

}, {
    collection: 'Cut_Orders',
    timestamps: true,
    read: "nearest",
    writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 30000
    }
});

// Indexes for common queries
cutOrderSchema.index({ status: 1, orderDate: -1 });
cutOrderSchema.index({ forBranchId: 1, status: 1 });
cutOrderSchema.index({ 'assignedToCutting.userId': 1, status: 1 });
cutOrderSchema.index({ 'assignedToProduction.userId': 1, status: 1 });
cutOrderSchema.index({ dueDate: 1, status: 1 });

// Pre-save hook to calculate material costs
cutOrderSchema.pre('save', async function(next) {
    try {
        const MaterialsModel = mongoose.model('Materials');

        // Calculate estimated cost from materialsRequired
        if (this.isModified('materialsRequired') && this.materialsRequired.length > 0) {
            let estimatedCost = 0;

            for (const material of this.materialsRequired) {
                const mat = await MaterialsModel.findById(material.materialId);
                if (mat) {
                    estimatedCost += mat.cost * material.quantityNeeded;
                }
            }

            this.estimatedMaterialCost = estimatedCost;
        }

        // Calculate actual cost from materialsUsed
        if (this.isModified('materialsUsed') && this.materialsUsed.length > 0) {
            let actualCost = 0;

            for (const material of this.materialsUsed) {
                const mat = await MaterialsModel.findById(material.materialId);
                if (mat) {
                    actualCost += mat.cost * material.quantityUsed;
                }
            }

            this.actualMaterialCost = actualCost;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Virtual for checking if overdue
cutOrderSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.status === 'COMPLETED' || this.status === 'CANCELLED') {
        return false;
    }
    return new Date() > this.dueDate;
});

const cutOrdersModel = mongoose.model("Cut_Orders", cutOrderSchema);
module.exports = cutOrdersModel;