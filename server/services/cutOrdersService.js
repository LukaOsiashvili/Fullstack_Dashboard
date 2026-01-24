const CutOrdersModel = require("../models/cutOrders");

const buildCutOrderQuery = (filters = {}) => {
    const normalizeArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

    const priority = normalizeArray(filters.priority);
    const category = normalizeArray(filters.category);

    let dateRange = {};
    if (filters.dateRange) {
        try {

            dateRange = JSON.parse(filters.dateRange);
        } catch (error) {
            dateRange = {}
        }
    }

    const minQuantity = filters.minQuantity ? Number(filters.minQuantity) : '';
    const maxQuantity = filters.maxQuantity ? Number(filters.maxQuantity) : '';

    const query = {};

    if (priority.length > 0) {
        query.priority = {$in: priority};
    }

    if (category.length > 0) {
        query.category = {$in: category};
    }

    if (dateRange.start || dateRange.end) {
        query.addedDate = {};

        if (dateRange.start) {
            query.dueDate.$gte = new Date(dateRange.start);
        }
        if (dateRange.end) {
            query.dueDate.$lte = new Date(dateRange.end);
        }
    }

    if (minQuantity !== '' || maxQuantity !== '') {
        query.quantity = {};

        if (minQuantity !== '') {
            query.quantity.$gte = minQuantity;
        }
        if (maxQuantity !== '') {
            query.quantity.$lte = maxQuantity;
        }
    }

    if (filters.hasIssues === 'true') {
        query['issues.0'] = {$exists: true};
    }

    if (filters.isOverdue === 'true') {
        query.dueDate = {$lt: new Date()};
        query.status = {$nin: ['COMPLETED', 'CANCELLED']};
    }

    if (filters.status) {
        query.status = {$in: [filters.status]};
    }

    return query;
}

module.exports = {

    getAllCutOrders: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
            const size = Math.max(parseInt(req.query.size, 10) || 10, 1);
            const skip = (page - 1) * size;

            const filters = req.query;
            const query = buildCutOrderQuery(filters);

            const [cutOrders, stats] = await Promise.all([
                CutOrdersModel.find(query).sort({addedDate: -1}).skip(skip).limit(size),
                CutOrdersModel.aggregate([
                    {$match: query},
                    {
                        $group: {
                            _id: null,
                            total: {$sum: 1},
                            pendingCount: {$sum: {$cond: [{$eq: ["$status", "PENDING"]}, 1, 0]}},
                            cuttingCount: {$sum: {$cond: [{$eq: ["$status", "CUTTING"]}, 1, 0]}},
                            inProgressCount: {$sum: {$cond: [{$eq: ["$status", "IN_PROGRESS"]}, 1, 0]}},
                            completedCount: {$sum: {$cond: [{$eq: ["$status", "COMPLETED"]}, 1, 0]}},
                            cancelledCount: {$sum: {$cond: [{$eq: ["$status", "CANCELLED"]}, 1, 0]}}

                        },
                    },
                ]),
            ]);

            const aggStats = stats[0] || {};

            return res.status(200).json({
                data: cutOrders,
                stats: {
                    page,
                    size,
                    total: aggStats.total || 0,
                    totalPages: Math.ceil((aggStats.total || 0) / size),
                    pending: aggStats.pendingCount || 0,
                    cuttingCount: aggStats.cuttingCount || 0,
                    inProgressCount: aggStats.inProgressCount || 0,
                    completedCount: aggStats.completedCount || 0,
                    cancelledCount: aggStats.cancelledCount || 0,
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    getStats: async (req, res) => {
        try {
            const {todayStartUTC, monthStartUTC} = req.body;

            if (!todayStartUTC || !monthStartUTC) {
                return res.status(400).json({message: "Invalid Parameters | Not Provided"});
            }

            const todayStart = new Date(todayStartUTC);
            const monthStart = new Date(monthStartUTC);
            const currentTime = new Date();

            const [stats] = await CutOrdersModel.aggregate([
                {
                    $facet: {
                        pending: [
                            {$match: {status: "PENDING"}},
                            {$count: "count"}
                        ],
                        cutting: [
                            {$match: {status: "CUTTING"}},
                            {$count: "count"}
                        ],
                        inProduction: [
                            {$match: {status: "IN_PRODUCTION"}},
                            {$count: "count"}
                        ],
                        overdue: [
                            {
                                $match:
                                    {
                                        status: {$in: ["PENDING", "CUTTING", "IN_PRODUCTION"]},
                                        dueDate: {$lt: currentTime}
                                    }
                            },
                            {$count: "count"}
                        ]
                    }
                }
            ]);

            const data = {
                pendingOrders: stats.pending[0]?.count ?? 0,
                cuttingOrders: stats.cutting[0]?.count ?? 0,
                inProductionOrders: stats.inProduction[0]?.count ?? 0,
                overdueOrders: stats.overdue[0]?.count ?? 0
            }

            return res.status(200).json(data)
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    addCutOrder: async (req, res) => {
        try {
            const result = await new CutOrdersModel(req.body).save();
            return res.status(200).json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error)
        }
    },

    addNewIssue: async (req, res) => {
        try {
            const updatedOrder = await CutOrdersModel.findByIdAndUpdate(
                req.params.id,
                {$push: {issues: req.body}},
                {runValidators: true, new: true}
            );

            if (!updatedOrder) {
                return res.status(400).json({message: "Order Not Found"});
            }

            return res.status(200).json(updatedOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    resolveIssue: async (req, res) => {
        try {
            const result = await CutOrdersModel.findOneAndUpdate(
                {_id: req.params.id, "issues._id": req.params.issueId},
                {$set: {"issues.$.resolved": true}},
                {runValidators: true, new: true}
            );

            if (!result) {
                return res.status(400).json({message: "Cut Order or Issue Not Found"});
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    },

    updateCutOrder: async (req, res) => {
        try {
            const updateOrder = await CutOrdersModel.findByIdAndUpdate(req.params.id, {$set: req.body}, {
                runValidators: true,
                new: true
            });

            if (!updateOrder) {
                return res.status(400).json({message: "Order Not Found"});
            }

            return res.status(200).json(updateOrder);
        } catch (error) {
            console.error(error);
            return res.status(500).json(error)
        }
    }
}