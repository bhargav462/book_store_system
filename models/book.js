const moment = require('moment');

const { executeQuery } = require('../datasources/postgres');

class Book {}

Book.getChargesByType = (params = {}) => {
    const { numberOfDays, type } = params;
    let charges = 0;

    switch (type) {
        case 'regular':
            charges = 2;
    
            if (numberOfDays - 2 > 0) {
                charges += (numberOfDays - 2) * 1.5;
            }
            return charges;

        case 'fiction':
            return 3 * numberOfDays;

        case 'novel':
            charges = 4.5;
    
            if (numberOfDays - 3 > 0) {
                charges += (numberOfDays - 3) * 1.5;
            }
            return charges;
        default:
            throw Error('Invalid book type');
    }
};

Book.prototype.initializeBookByName = async (bookName) => {
    const bookQuery = `SELECT * from book WHERE name = $1`;
    const bookQueryResult = await executeQuery(bookQuery, [bookName]);

    if (!Array.isArray(bookQueryResult) || !bookQueryResult.length) {
        throw Error('Book not found');
    }

    this.requiredBook = bookQueryResult[0];
    return this.requiredBook;
};

Book.prototype.checkAvailability = async () => {
    const lendingRecordQuery = `
        SELECT 
            lend_date,
            days_to_return
        FROM lending_record
        WHERE book_id = $1 and is_returned = $2
    `;
    const queryParams = [this.requiredBook.id, false];
    const lendingRecordQueryResult = await executeQuery(lendingRecordQuery, queryParams);

    const currentDate = new Date().getTime();
    let isAvailable = true;
    let nextAvailableDate = currentDate;
    if (!lendingRecordQueryResult.length) {
        return {
            isAvailable,
            nextAvailableDate: moment(nextAvailableDate).format('YYYY-MM-DD'),
        };
    }

    const lendingRecord = lendingRecordQueryResult[0];
    const { days_to_return: daysToReturn } = lendingRecord;
    const lendDate = new Date(lendingRecord.lend_date);
    const returnDate = lendDate.setDate(lendDate.getDate() + daysToReturn);

    if (returnDate > currentDate) {
        isAvailable = false;
        nextAvailableDate = returnDate;
    }

    return {
        isAvailable,
        nextAvailableDate: moment(nextAvailableDate).format('YYYY-MM-DD'),
    }
};

Book.prototype.getCharges = async (params = {}) => {
    const self = this;
    const { customerId } = params;
    const lendingRecordQuery = `
        SELECT
            lending_record.lend_date as lend_date,
            lending_record.days_to_return as days_to_return
        FROM lending_record
        WHERE lending_record.customer_id = $1 AND lending_record.book_id = $2 AND lending_record.is_returned = $3
    `;
    const queryParams = [customerId, self.requiredBook.id, false];
    const lendingRecordQueryResult = await executeQuery(lendingRecordQuery, queryParams);

    if (!Array.isArray(lendingRecordQueryResult) || !lendingRecordQueryResult.length) {
        throw Error('Record not found');
    }

    const numberOfDays = moment().diff(moment(lendingRecordQueryResult[0].lend_date), 'days');
    const charges = Book.getChargesByType({ type: self.requiredBook.type, numberOfDays });

    return charges;
}

module.exports = Book;