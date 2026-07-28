SELECT * FROM (SELECT 'folder' AS "type" , "Folder".id, "Folder".name, "Folder".updated_at
FROM "Folder" WHERE parent_folder_id = $1
UNION 
SELECT "File".mimetype AS "type", "File".id, "File".name, "File".updated_at
FROM "File" WHERE folder_id = $1) "content"
ORDER BY updated_at ASC;
