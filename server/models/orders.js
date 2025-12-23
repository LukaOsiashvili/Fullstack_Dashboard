const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
    // Products in this order
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        productName: {type: String, required: true}, // Denormalized for history
        category: {type: String, required: true},
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        variantName: {type: String, required: true}, // e.g., "Red, Medium"
        quantity: {type: Number, required: true, min: 1},
        unitPrice: {type: Number, required: true}, // Price at time of order
        discount: {
            type: Number,
            default: 0,
            min: 0
        }, // Discount in percentage or fixed amount
        subtotal: {type: Number, required: true}, // Calculated: (unitPrice * quantity) - (discount/100 * unitPrice)
    }],

    // Order type classification
    orderType: {
        type: String,
        required: true,
        enum: ['SALE', 'CUSTOM', 'PRODUCTION', 'RETURN'],
        index: true
    },

    // Branch this order belongs to
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches',
        required: true,
        index: true
    },
    branchInfo: { // Denormalized for history
        name: {type: String, required: true},
        city: {type: String, required: true},
        address: {type: String, required: true},
    },

    // Who created/issued this order (sales rep, admin, etc.)
    issuedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
    },

    // Customer info (optional - for custom orders)
    customer: {
        name: {type: String},
        phone: {type: String},
        email: {type: String},
    },

    // Custom work requirements
    requiresEngraving: {type: Boolean, default: false},
    engravedOnsite: {type: Boolean, default: false}, // If true, done at branch
    customInstructions: {type: String},

    // Assignment for custom work
    assignedTo: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        firstName: {type: String},
        lastName: {type: String},
    },

    // Financial
    subtotal: {type: Number, required: true}, // Sum of item subtotals
    tax: {type: Number, default: 0},
    totalAmount: {type: Number, required: true}, // subtotal + tax
    totalCost: {type: Number, required: true}, // Sum of (product.cost * quantity)
    grossProfit: {type: Number, required: true}, // totalAmount - totalCost

    paymentMethod: {
        type: String,
        enum: ['CASH', 'CARD', 'TRANSFER', 'CREDIT', 'PENDING'],
    },

    // Dates
    orderDate: {type: Date, required: true, index: true}, // When order was created
    dueDate: {type: Date}, // When custom work should be done
    completedDate: {type: Date}, // When order was fulfilled

    // Status tracking
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RETURNED'],
        index: true,
        default: 'PENDING'
    },

    // Notes
    notes: {type: String},
    cancellationReason: {type: String},

}, {
    collection: "Orders",
    timestamps: true,
    read: "nearest",
    writeConcern: {
        w: "majority",
        j: true,
        wtimeout: 30000
    }
});

// Indexes for common queries
ordersSchema.index({ branchId: 1, orderDate: -1 });
ordersSchema.index({ orderType: 1, status: 1 });
ordersSchema.index({ 'issuedBy.userId': 1, orderDate: -1 });
ordersSchema.index({ 'assignedTo.userId': 1, status: 1 });

// Pre-save hook to calculate totals
ordersSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('items')) {
        const ProductsModel = mongoose.model('Products');

        let subtotal = 0;
        let totalCost = 0;

        for (const item of this.items) {
            const product = await ProductsModel.findById(item.productId);
            if (!product) {
                return next(new Error(`Product ${item.productId} not found`));
            }

            // Calculate item subtotal with discount
            item.subtotal = (item.unitPrice * item.quantity) - (item.discount / 100 * item.unitPrice);
            subtotal += item.subtotal;

            // Calculate cost
            totalCost += (product.cost * item.quantity);
        }

        this.subtotal = subtotal;
        this.totalAmount = subtotal + (this.tax || 0);
        this.totalCost = totalCost;
        this.grossProfit = this.totalAmount - totalCost;
    }

    next();
});

const ordersModel = mongoose.model("Orders", ordersSchema);
module.exports = ordersModel;