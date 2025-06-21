-- Debug the build_stories table and relationships

-- 1. Check if there are any stories in the table
SELECT 
    COUNT(*) as total_stories,
    COUNT(DISTINCT user_id) as unique_authors
FROM build_stories;

-- 2. Show recent stories with their details
SELECT 
    id,
    title,
    category,
    slug,
    user_id,
    created_at,
    LENGTH(content) as content_length
FROM build_stories 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if the foreign key constraint exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'build_stories';

-- 4. Check if user_ids in build_stories exist in mugshots
SELECT 
    bs.user_id,
    bs.title,
    m.name,
    CASE 
        WHEN m.user_id IS NULL THEN 'MISSING AUTHOR'
        ELSE 'AUTHOR FOUND'
    END as author_status
FROM build_stories bs
LEFT JOIN mugshots m ON bs.user_id = m.user_id
ORDER BY bs.created_at DESC
LIMIT 10;

-- 5. Show any orphaned stories (stories without matching authors)
SELECT 
    COUNT(*) as orphaned_stories
FROM build_stories bs
LEFT JOIN mugshots m ON bs.user_id = m.user_id
WHERE m.user_id IS NULL;
