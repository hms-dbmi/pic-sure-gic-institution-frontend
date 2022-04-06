use picsure;

INSERT IGNORE INTO `resource` 
	(uuid, targetURL, resourceRSPath, description, name, token, hidden, metadata)
	VALUES
	(0x__RESOURCE_UUID__,NULL,'http://hpds:8080/PIC-SURE/','Basic HPDS resource','hpds',NULL, FALSE, NULL);