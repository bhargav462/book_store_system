CREATE TABLE customer(
    id bigserial primary key,
    name text
);

CREATE TABLE book(
    id text primary key,
    name text,
    author_name text
);

CREATE TABLE lending_record(
    id bigserial primary key,
    lend_date TIMESTAMP,
    days_to_return integer,
    book_id text,
    customer_id bigserial,
    is_returned boolean
);

CREATE INDEX book_name ON book(name);
