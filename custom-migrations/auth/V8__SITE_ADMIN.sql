use auth;

 SET @uuidRole = REPLACE(UUID(),'-','');
  INSERT INTO role VALUES (
      unhex(@uuidRole),
     'Data Admin',
     'Allow access to Dataset Requests tab'
  );