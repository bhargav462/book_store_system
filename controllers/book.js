const assert = require('assert');

const Book = require('../models/book');
const Customer = require('../models/customer');

const checkAvailability = async (req, res) => {
    try {
        const { book_name: bookName } = req.query;
        assert(bookName, 'book name is required');

        const book = new Book();
        await book.initializeBookByName(bookName);

        const { isAvailable, nextAvailableDate } = await book.checkAvailability();

        return res.json({
            success: true,
            data: {
                isAvailable,
                nextAvailableDate,
            }
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message || 'Unexpected error occured'
        })
    }
};

const getCharges = async (req, res) => {
    const data = req.body || [];
    if (!Array.isArray(data) || !data.length) {
        return res.json({
            success: false,
            message: 'Data should be present'
        })
    }

    const response = [];
    for (const customerData of data) {
        const { customer_name: customerName, book_name: bookName } = customerData;
        const recordResponse = {
            customer_name: customerName,
            book_name: bookName,
        };

        try {
            assert(customerName, 'customer name should be present');
            assert(bookName, 'book name should be present');

            const customer = new Customer();
            const requiredCustomer = await customer.initializeCustomerByName(customerName);

            const book = new Book();
            await book.initializeBookByName(bookName);

            recordResponse.charges = await book.getCharges({ customerId: requiredCustomer.id });
            response.push(recordResponse);
        } catch (error) {
            recordResponse.message = error.message || 'Unexpected error occured';
            response.push(recordResponse);
        }
    }

    return res.json({
        data: response,
        success: true,
    })
};

module.exports = {
    checkAvailability,
    getCharges,
};
