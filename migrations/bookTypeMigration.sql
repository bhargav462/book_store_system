ALTER TABLE book ADD COLUMN type VARCHAR(20);

UPDATE book
SET type = (
    CASE MOD(ABS(CAST(('x'||MD5(author_name)) as BIT(32))::INTEGER), 3)
        WHEN 0 THEN 'regular'
        WHEN 1 THEN 'fiction'
        ELSE 'novel'
    END
);
