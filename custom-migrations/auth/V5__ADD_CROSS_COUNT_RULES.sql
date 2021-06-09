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

SET @uuidResourceRule = REPLACE(UUID(),'-','');
INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(@uuidResourceRule), 'Aggregate Only Access', 'Allow Access to Aggregate Resource', '$..resourceUUID', 4, @uuidAggResource, 0x00, 0x00, unhex(@uuidCountRule), 0x00, 0x00);
	

INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(REPLACE(uuid(),'-','')), 'HPDS Aggregate Observation Counts', 'HPDS observation Counts', '$..expectedResultType', 4, 'OBSERVATION_COUNT', 0x00, 0x00, NULL, 0x00, 0x00);

INSERT INTO access_rule (uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode, subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates)
	VALUES (unhex(REPLACE(uuid(),'-','')), 'HPDS Aggregate Observation Cross Counts', 'HPDS observation cross Counts', '$..expectedResultType', 4, 'OBSERVATION_CROSS_COUNT', 0x00, 0x00, NULL, 0x00, 0x00);
	
	
INSERT INTO accessRule_gate (accessRule_id, gate_id)
	VALUES (
	(SELECT uuid FROM access_rule WHERE name = 'HPDS Aggregate Observation Cross Counts'),
	unhex(@uuidResourceRule)
	);
	
	
INSERT INTO accessRule_gate (accessRule_id, gate_id)
	VALUES (
	(SELECT uuid FROM access_rule WHERE name = 'HPDS Aggregate Observation Counts'),
	unhex(@uuidResourceRule)
	);
	
	
	INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		(SELECT uuid FROM privilege WHERE name = 'AGGREGATE'),
		(SELECT uuid FROM access_rule WHERE name = 'HPDS Aggregate Observation Counts')
	);
	
INSERT INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (
		(SELECT uuid FROM privilege WHERE name = 'AGGREGATE'),
		(SELECT uuid FROM access_rule WHERE name = 'HPDS Aggregate Observation Cross Counts')
	);
	
