const mongoose = require("mongoose");
const OrdersModel = require("../models/orders");

const buildOrderQuery = (filters = {}) => {

    const normalizeArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

    const status = normalizeArray(filters.status);
    const orderType = normalizeArray(filters.orderType);
    const paymentMethod = normalizeArray(filters.paymentMethod);

    const branchId = filters.branchId || '';

    let dateRange = {};
    if (filters.dateRange) {
        try {
            dateRange = JSON.parse(filters.dateRange);
        } catch (error) {
            dateRange = {};
        }
    }

    const minAmount = filters.minAmount ? Number(filters.minAmount) : '';
    const maxAmount = filters.maxAmount ? Number(filters.maxAmount) : '';

    const query = {};

    if (status.length > 0) {
        query.status = {$in: status};
    }

    if (orderType.length > 0) {
        query.orderType = {$in: orderType};
    }

    if (branchId) {
        query.branchId = new mongoose.Types.ObjectId(branchId);
    }

    if (dateRange.start || dateRange.end) {
        query.orderDate = {};

        if (dateRange.start) {
            query.orderDate.$gte = new Date(dateRange.start)
        }

        if (dateRange.end) {
            query.orderDate.$lte = new Date(dateRange.end)
        }
    }

    if (paymentMethod.length > 0) {
        query.paymentMethod = {$in: paymentMethod};
    }

    if (minAmount !== '' || maxAmount !== '') {
        query.totalAmount = {};

        if (minAmount !== '') {
            query.totalAmount.$gte = minAmount;
        }

        if (maxAmount !== '') {
            query.totalAmount.$lte = maxAmount;
        }
    }
    return query;
}

module.exports = {

    getAllOrders: async (req, res) => {
        try {

            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
            const skip = (page - 1) * size;

            const filters = req.query;
            const query = buildOrderQuery(filters);

            const [orders, stats] = await Promise.all([
                OrdersModel.find(query)
                    .sort({orderType: 1, createdAt: -1,})
                    .skip(skip)
                    .limit(size),
                OrdersModel.aggregate([
                    {$match: query},
                    {
                        $group: {
                            _id: null,
                            total: {$sum: 1},
                            pendingCount: {$sum: {$cond: [{$eq: ["$status", "PENDING"]}, 1, 0]}},
                            inProgressCount: {$sum: {$cond: [{$eq: ["$status", "IN_PROGRESS"]}, 1, 0]}},
                            completedCount: {$sum: {$cond: [{$eq: ["$status", "COMPLETED"]}, 1, 0]}},
                            customOrderTypeCount: {$sum: {$cond: [{$eq: ["$orderType", "CUSTOM"]}, 1, 0]}},
                        },
                    },
                ]),
            ]);

            const aggStats = stats[0] || {};

            return res.status(200).json({
                data: orders,
                stats: {
                    page,
                    size,
                    total: aggStats.total || 0,
                    totalPages: Math.ceil((aggStats.total || 0) / size),
                    pending: aggStats.pendingCount || 0,
                    inProgress: aggStats.inProgressCount || 0,
                    completed: aggStats.completedCount || 0,
                    custom: aggStats.customOrderTypeCount || 0,
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({})
        }
    },

    getStats: async (req, res) => {
        try {

            const {todayStartUTC, monthStartUTC} = req.body;

            if (!todayStartUTC || !monthStartUTC) {
                return res.status(400).json({message: 'Invalid Parameters | Not Provided'});
            }

            const todayStart = new Date(todayStartUTC)
            const monthStart = new Date(monthStartUTC)

            const [stats] = await OrdersModel.aggregate([
                {
                    $facet: {
                        todayOrders: [
                            {$match: {createdAt: {$gte: todayStart}}},
                            {$count: "count"}
                        ],
                        pendingOrders: [
                            {$match: {status: "PENDING"}},
                            {$count: "count"}
                        ],
                        inProgressOrders: [
                            {$match: {status: "IN_PROGRESS"}},
                            {$count: "count"}
                        ],
                        monthlyRevenue: [
                            {
                                $match: {
                                    status: "COMPLETED",
                                    createdAt: {$gte: monthStart},
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    total: {$sum: "$totalAmount"}
                                }
                            }
                        ]
                    }
                }
            ]);

            const data = {
                todayOrders: stats.todayOrders[0]?.count ?? 0,
                pendingOrders: stats.pendingOrders[0]?.count ?? 0,
                inProgressOrders: stats.inProgressOrders[0]?.count ?? 0,
                revenue: stats.monthlyRevenue[0]?.total ?? 0
            }

            return res.status(200).json(data)
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    addOrder: async (req, res) => {
        try {
            const result = await new OrdersModel(req.body).save();
            return res.status(200).json(result);
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    updateOrder: async (req, res) => {
        try {
            const updateOrder = await OrdersModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true})

            if (!updateOrder) {
                return res.status(404).json({message: 'Order Not Found'})
            }

            return res.status(200).json(updateOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const {id} = req.params;
            const {status, cancellationReason, assignedTo} = req.body;

            if (!status) {
                return res.status(400).json({message: 'Status Is Required'})
            }

            const order = await OrdersModel.findById(id);
            if (!order) {
                return res.status(404).json({message: "Order not found"});
            }

            const allowedTransitions = {
                PENDING: ['IN_PROGRESS', 'CANCELLED'],
                IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'PENDING'],
                COMPLETED: ['RETURNED'],
                CANCELLED: ['PENDING'],
                RETURNED: [],
            };

            const allowedNext = allowedTransitions[order.status] || [];
            if (!allowedNext.includes(status)) {
                return res.status(400).json({message: 'Status Change Order is Invalid'})
            }

            const update = {
                status,
            };

            if (status === "CANCELLED") {
                update.cancellationReason = cancellationReason?.trim() || "Not Specified";
                update.completedDate = null;
            }

            if (status === "COMPLETED") {
                update.completedDate = new Date();
                update.cancellationReason = "";
            }

            if (assignedTo && order.assignedTo.userId && !order.assignedTo.userId.equals(new mongoose.Types.ObjectId(assignedTo.userId))) {
                update.assignedTo = {
                    userId: new mongoose.Types.ObjectId(assignedTo.userId),
                    firstName: assignedTo.firstName,
                    lastName: assignedTo.lastName,
                };
            }

            const updatedOrder = await OrdersModel.findByIdAndUpdate(
                id,
                {$set: update},
                {new: true, runValidators: true}
            );
            return res.status(200).json(updatedOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    }

}