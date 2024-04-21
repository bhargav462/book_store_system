const XLSX = require('xlsx');

const { connectPostgres, executeQuery } = require('../datasources/postgres');

const readCsvFile = () => {
    const report = XLSX.readFile('./fileData.csv', { raw: false })
    const worksheet = report.Sheets[report.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    return data;
}

const fileData = readCsvFile();

const getQueryPlaceholder = (length, recordLength) => {
    const iterations = length/recordLength;
    let result = [];

    for (let i = 0; i < iterations; ++i) {
        let queryParamsParts = [];
        for (let j = 1; j <= recordLength; ++j) {
            queryParamsParts.push(`$${i*recordLength + j}`);
        }

        result.push(`(${queryParamsParts.join(', ')})`);
    }

    return result.join(', ');
}

const books = {};
const customerQueryParams = [];
const bookQueryParams = [];
const lendingRecordQueryParams = []

for (const record of fileData) {
    customerQueryParams.push(record.customer_id);
    customerQueryParams.push(record.customer_name);

    const booksData = JSON.parse(record.books);
    for (const bookData of booksData) {
        books[bookData.book_id] = {
            id: bookData.book_id,
            author_name: bookData.author_name,
            name: bookData.book_name,
        }

        const lendDate = new Date(bookData.lend_date);
        const returnDate = lendDate.setDate(lendDate.getDate() + bookData.days_to_return);
        const currentDate = new Date();

        lendingRecordQueryParams.push(bookData.lend_date);
        lendingRecordQueryParams.push(bookData.days_to_return);
        lendingRecordQueryParams.push(bookData.book_id);
        lendingRecordQueryParams.push(record.customer_id);
        lendingRecordQueryParams.push(returnDate < currentDate);
    }
}

for (const key in books) {
    const book = books[key];
    bookQueryParams.push(book.id);
    bookQueryParams.push(book.name);
    bookQueryParams.push(book.author_name);
}

const executeEntityQuery = async (query, queryParams) => {
    await connectPostgres();

    try {
        await executeQuery(query, queryParams);
    } catch (error) {
        console.log('error', error);
    }
}

const executeMigration = async () => {
    try {
        let customerQuery = `
            INSERT INTO customer(id, name)
            VALUES ${getQueryPlaceholder(customerQueryParams.length, 2)}
        `;
        await executeEntityQuery(customerQuery, customerQueryParams);

        let booksQuery = `
            INSERT INTO book(id, name, author_name)
            VALUES ${getQueryPlaceholder(bookQueryParams.length, 3)}
        `;
        await executeEntityQuery(booksQuery, bookQueryParams);

        let lendingRecordQuery = `
            INSERT INTO lending_record(lend_date, days_to_return, book_id, customer_id, is_returned)
            VALUES ${getQueryPlaceholder(lendingRecordQueryParams.length, 5)}
        `;
        await executeEntityQuery(lendingRecordQuery, lendingRecordQueryParams);
    } catch (error) {
        console.log('error', error);
    }
}

executeMigration();
