use picsure;

SET @uuidAggResource = (SELECT
  (LOWER(CONCAT(
    SUBSTR(HEX(uuid), 1, 8), '-',
    SUBSTR(HEX(uuid), 9, 4), '-',
    SUBSTR(HEX(uuid), 13, 4), '-',
    SUBSTR(HEX(uuid), 17, 4), '-',
    SUBSTR(HEX(uuid), 21)
  )))
FROM resource where name like 'PIC-SURE Aggregate Resource%' limit 1);

use auth;

SET @uuidCountPrivilege = REPLACE(UUID(),'-','');

INSERT INTO privilege (uuid, name, description, application_id)
	VALUES (unhex(@uuidCountPrivilege),
		'AGGREGATE',
		'Aggregiate Data Sharing privilege for PICSURE application',
		(SELECT uuid FROM application WHERE name = 'PICSURE')
	);

	
SET @uuidCountRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidCountRule), 'HPDS Aggregate Counts', 'HPDS counts', '$..expectedResultType', 4, 'COUNT', 0x00, 0x00, NULL, 0x00, 0x00);

INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		unhex(@uuidCountPrivilege),
		unhex(@uuidCountRule)
	);
	
SET @uuidCountRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidCountRule), 'HPDS Aggregate Cross Counts', 'HPDS cross counts', '$..expectedResultType', 4, 'CROSS_COUNT', 0x00, 0x00, NULL, 0x00, 0x00);

INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		unhex(@uuidCountPrivilege),
		unhex(@uuidCountRule)
	);
	
SET @uuidRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule VALUES (unhex(@uuidRule), 'AR_INFO_COLUMN_LISTING', 'Allow query to info_column_listing', '$..expectedResultType',  4, 'INFO_COLUMN_LISTING', 0, 0, NULL, 0, 0);	
	
INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
VALUES (
	unhex(@uuidCountPrivilege),
	unhex(@uuidRule)
);
	
SET @uuidRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule VALUES ( unhex(@uuidRule), 'AR_ONLY_SEARCH', 'Can do /search', ' $.[\'Target Service\']', 6, '/search', 0, 0, NULL, 0, 0);
INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
VALUES (
	unhex(@uuidCountPrivilege),
	unhex(@uuidRule)
);
	
	
SET @uuidResourceRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidResourceRule), 'Aggregate Only Access', 'Allow Access to Aggregate Resource', '$..resourceUUID', 4, @uuidAggResource, 0x00, 0x00, unhex(@uuidCountRule), 0x00, 0x00);
	
INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		unhex(@uuidCountPrivilege),
		unhex(@uuidResourceRule)
	);
	
	
SET @uuidRole = REPLACE(UUID(),'-','');
INSERT INTO role (uuid, name, description)
	VALUES (unhex(@uuidRole),
		'PIC-SURE Aggregate Count Role',
		'Can perform count queries using the aggregate resource only.'
	);

INSERT INTO role_privilege (role_id, privilege_id)
	VALUES (
		unhex(@uuidRole),
		unhex(@uuidCountPrivilege)
	);
	

SET @uuidConn = REPLACE(UUID(),'-','');
INSERT INTO `connection` VALUES (unhex(@uuidConn), 'Manual Token Connection', 'manual-token','','');

SET @uuidUser = REPLACE(UUID(),'-','');	
INSERT INTO user VALUES (unhex(@uuidUser), null, null, null, unhex(@uuidConn),'CommonAreaUser',0,concat('PIC_SURE_USER|', REPLACE(UUID(),'-','')),1,null);
INSERT INTO user_role VALUES (unhex(@uuidUser), unhex(@uuidRole));
