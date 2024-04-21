const moment = require('moment');
const { checkAvailability, getCharges } = require('../controllers/book');

jest.mock('../datasources/postgres', () => ({
    executeQuery: jest.fn(),
}));

const { executeQuery } = require('../datasources/postgres');

describe('checkAvailability function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return success: true and isAvailable: true if book is available', async () => {
        const req = { query: { book_name: 'BookName' } };
        const res = {
            json: jest.fn(),
        };

        // Mocking the find book query result
        executeQuery.mockResolvedValueOnce([{ id: 1 }]);
        // Mocking the find lending record query result
        executeQuery.mockResolvedValueOnce([]);

        await checkAvailability(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                isAvailable: true,
                nextAvailableDate: moment().format('YYYY-MM-DD'),
            },
        });
    });

    it('should return success: false with an error message if book name is missing in the request', async () => {
        const req = { query: {} };
        const res = {
            json: jest.fn(),
        };

        await checkAvailability(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'book name is required',
        });
    });

    it('should return success: false with an error message if book is not found', async () => {
        const req = { query: { book_name: 'NonExistentBook' } };
        const res = {
            json: jest.fn(),
        };

        // Mocking the find book query result
        executeQuery.mockResolvedValueOnce([]);

        await checkAvailability(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Book not found',
        });
    });

    it('should return success: true and isAvailable: false if book is borrowed and not returned yet', async () => {
        const req = { query: { book_name: 'BookName' } };
        const res = {
            json: jest.fn(),
        };

        // Mocking the find book query result
        executeQuery.mockResolvedValueOnce([{ id: 1 }]);
        // Mocking the find lending record query result
        executeQuery.mockResolvedValueOnce([{ lend_date: '2024-04-21', days_to_return: 20 }]);

        await checkAvailability(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                isAvailable: false,
                nextAvailableDate: '2024-05-11',
            },
        });
    });
});

describe('getCharges function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an error message if data is not provided', async () => {
        const req = { body: null };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Data should be present',
        });
    });

    it('should return an error message if customer name is missing', async () => {
        const bookName = 'Book';
        const req = { body: [{ book_name: bookName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [
                {
                    customer_name: undefined,
                    book_name: bookName,
                    message: 'customer name should be present'
                }
            ]
        });
    });

    it('should return an error message if book name is missing', async () => {
        const customerName = 'Customer';
        const req = { body: [{ customer_name: customerName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [
                {
                    customer_name: customerName,
                    book_name: undefined,
                    message: 'book name should be present'
                }
            ]
        });
    });

    it('should return an error message if customer not found', async () => {
        executeQuery.mockResolvedValueOnce([]);

        const customerName = 'Customer';
        const bookName = 'Book';
        const req = { body: [{ customer_name: customerName, book_name: bookName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{
                customer_name: customerName,
                book_name: bookName,
                message: 'Customer not found',
            }],
        });
    });

    it('should return an error message if book not found', async () => {
        executeQuery.mockResolvedValueOnce([{ id: 1 }]);
        executeQuery.mockResolvedValueOnce([]);

        const customerName = 'Customer';
        const bookName = 'Book';
        const req = { body: [{ customer_name: customerName, book_name: bookName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{
                customer_name: customerName,
                book_name: bookName,
                message: 'Book not found',
            }],
        });
    });

    it('should return an error message if record not found', async () => {
        executeQuery.mockResolvedValueOnce([{ id: 1 }]);
        executeQuery.mockResolvedValueOnce([{ id: 2 }]);
        executeQuery.mockResolvedValueOnce([]);

        const customerName = 'Customer';
        const bookName = 'Book';
        const req = { body: [{ customer_name: customerName, book_name: bookName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{
                customer_name: customerName,
                book_name: bookName,
                message: 'Record not found',
            }],
        });
    });

    it('should return charges if all data is valid and record found', async () => {
        const lend_date = new Date();
        lend_date.setDate(lend_date.getDate() - 5);

        const expectedCharges = moment().diff(moment(lend_date), 'days');

        executeQuery.mockResolvedValueOnce([{ id: 1 }]);
        executeQuery.mockResolvedValueOnce([{ id: 2 }]);
        executeQuery.mockResolvedValueOnce([{ lend_date, days_to_return: 10 }]);
        
        const customerName = 'Customer';
        const bookName = 'Book';
        const req = { body: [{ customer_name: customerName, book_name: bookName }] };
        const res = { json: jest.fn() };

        await getCharges(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{
                customer_name: customerName,
                book_name: bookName,
                charges: expectedCharges,
            }],
        });
    });
});

