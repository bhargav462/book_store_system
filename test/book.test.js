const moment = require('moment');
const { checkAvailability } = require('../controllers/book');

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
            message: 'Invalid Book Name',
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
