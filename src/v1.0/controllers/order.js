const messages = require("../../config/messages");
const { getCourseById, editCourseById } = require("../services/internal/course");
const { createOrder, getOrders, processOrders } = require("../services/internal/order");
const { makeQueryBuilder } = require("../services/internal/queryBuilder");
const { createSubscription, getSubscriptionCountByCourseId } = require("../services/internal/subscription");
const { ITEM_TYPE_COURSE, STATUS_COMPLETED } = require("../../config/constants");

const addOrder = async (productIds) => {
    productIds.map(async (itemId) => {
        const course = await getCourseById(itemId);
        console.log(course);
        const subscriptionData = {
            userId: req?.body?.userId,
            itemId: course._id,
            itemType: ITEM_TYPE_COURSE,
        };
        const orderItem = {
            itemId: course._id,
            itemType: ITEM_TYPE_COURSE,
            price: course.price,
            itemName: course.name,
            amount: course.price,
        };
        const orderData = {
            userId: req?.body?.userId,
            amount: course.price,
            status: STATUS_COMPLETED,
            items: [orderItem],
        };
        await createOrder(orderData);
        await Promise.all([createSubscription(subscriptionData)]);
        const subscriptionCount = await getSubscriptionCountByCourseId(itemId);
        await editCourseById(itemId, { subscriptionCount });
    });
    return {
        message: messages?.orderAddedSuccess,
    };
};

const viewOrders = async (req) => {
    const queryBuilder = makeQueryBuilder(req);
    const condition = { userId: req?.user?._id };
    let data = await getOrders(queryBuilder, condition);
    data.orders = await processOrders(data.orders);
    return {
        message: messages?.success,
        data,
    };
};

module.exports = {
    addOrder,
    viewOrders,
};