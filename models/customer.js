const { executeQuery } = require('../datasources/postgres');

class Customer {}

Customer.prototype.initializeCustomerByName = async (customerName) => {
    const customerQuery = `SELECT * from customer WHERE name = $1`;
    const customerQueryResult = await executeQuery(customerQuery, [customerName]);

    if (!Array.isArray(customerQueryResult) || !customerQueryResult.length) {
        throw Error('Customer not found');
    }

    this.requiredCustomer = customerQueryResult[0];
    return this.requiredCustomer;
};

module.exports = Customer;