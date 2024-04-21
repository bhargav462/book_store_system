const moment = require('moment');
const assert = require('assert');

const { executeQuery } = require('../datasources/postgres');

const checkAvailability = async (req, res) => {
    try {
        const { book_name: bookName } = req.query;
        assert(bookName, 'book name is required');

        const bookQuery = `SELECT id from book WHERE name = $1`;
        const bookQueryResult = await executeQuery(bookQuery, [bookName]);

        if (!Array.isArray(bookQueryResult) || !bookQueryResult.length) {
            return res.json({
                success: false,
                message: 'Invalid Book Name'
            });
        }

        const lendingRecordQuery = `
            SELECT 
                lending_record.lend_date AS lend_date,
                lending_record.days_to_return AS days_to_return
            FROM book
            LEFT JOIN lending_record ON lending_record.book_id = book.id
            WHERE book.id = $1 and lending_record.is_returned = $2
        `;
        const queryParams = [bookQueryResult[0].id, false];
        const lendingRecordQueryResult = await executeQuery(lendingRecordQuery, queryParams);

        const currentDate = new Date().getTime();
        let isAvailable = true;
        let nextAvailableDate = currentDate;
        if (!lendingRecordQueryResult.length) {
            return res.json({
                success: true,
                data: {
                    isAvailable,
                    nextAvailableDate: moment(nextAvailableDate).format('YYYY-MM-DD'),
                }
            });
        }

        const lendingRecord = lendingRecordQueryResult[0];
        const { days_to_return: daysToReturn } = lendingRecord;
        const lendDate = new Date(lendingRecord.lend_date);
        const returnDate = lendDate.setDate(lendDate.getDate() + daysToReturn);

        if (returnDate > currentDate) {
            isAvailable = false;
            nextAvailableDate = returnDate;
        }

        return res.json({
            success: true,
            data: {
                isAvailable,
                nextAvailableDate: moment(nextAvailableDate).format('YYYY-MM-DD'),
            }
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message || 'Unexpected error occured'
        })
    }
};

module.exports = {
    checkAvailability,
};
