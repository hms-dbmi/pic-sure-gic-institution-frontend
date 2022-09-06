use auth;

SET @uuidRole = REPLACE(UUID(),'-','');
INSERT INTO role VALUES (
    unhex(@uuidRole),
   'Data Admin',
   'Allow access to Dataset Requests tab'
  );

SET @uuidPrivilege = REPLACE(UUID(),'-','');
INSERT INTO privilege (uuid, name, description, application_id)
	VALUES (unhex(@uuidPrivilege),
		'DATA_ADMIN',
		'Data Admin privilege for PICSURE application',
		(SELECT uuid FROM application WHERE name = 'PICSURE')
	);

INSERT INTO role_privilege (role_id, privilege_id)
	VALUES (
		unhex(@uuidRole),
		unhex(@uuidPrivilege)
	);