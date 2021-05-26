use picsure;

SELECT @uuidAggResource =
  (LOWER(CONCAT(
    SUBSTR(HEX(uuid), 1, 8), '-',
    SUBSTR(HEX(uuid), 9, 4), '-',
    SUBSTR(HEX(uuid), 13, 4), '-',
    SUBSTR(HEX(uuid), 17, 4), '-',
    SUBSTR(HEX(uuid), 21)
  ))
FROM resource where name like 'PIC-SURE Aggregate Resource%' limit 1);


use auth;

SET @uuidCountRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidCountRule), 'HPDS Aggregate Counts', 'HPDS Counts', '$..expectedResultType', 4, 'COUNT', 0x00, 0x00, NULL, 0x00, 0x00);

SET @uuidResourceRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidResourceRule), 'Aggregate Only Access', 'Allow Access to Aggregate Resource', '$..resourceUUID', 4, @uuidAggResource, 0x00, 0x00, unhex(@uuidCountRule), 0x00, 0x00);
	
	
INSERT INTO privilege (uuid, name, description, application_id)
	VALUES (unhex(REPLACE(uuid(),'-','')),
		'AGGREGATE',
		'Aggregiate Data Sharing privilege for PICSURE application',
		(SELECT uuid FROM application WHERE name = 'PICSURE')
	);

INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		(SELECT uuid FROM privilege WHERE name = 'AGGREGATE'),
		(SELECT uuid FROM access_rule WHERE name = 'HPDS Aggregate Counts')
	);
	
SET @uuidRole = REPLACE(UUID(),'-','');
INSERT INTO role (uuid, name, description)
	VALUES (unhex(@uuidRole),
		'PIC-SURE Aggregate Count Role',
		'Can perform count queries using the aggregate resource only.'
	);

INSERT INTO role_privilege (role_id, privilege_id)
	VALUES (
		(SELECT uuid FROM role WHERE name = 'PIC-SURE Aggregate Count User'),
		(SELECT uuid FROM privilege WHERE name = 'AGGREGATE')
	);
	

SET @uuidConn = REPLACE(UUID(),'-','');
INSERT INTO `connection` VALUES (unhex(@uuidConn), 'Manual Token Connection', 'manual-token','','');

SET @uuidUser = REPLACE(UUID(),'-','');	
INSERT INTO user VALUES (unhex(@uuidUser), null, null, null, unhex(@uuidConn),'CommonAreaUser',0,concat('PIC_SURE_USER|', REPLACE(UUID(),'-','')),1,null);
INSERT INTO user_role VALUES (unhex(@uuidUser), unhex(@uuidRole));
