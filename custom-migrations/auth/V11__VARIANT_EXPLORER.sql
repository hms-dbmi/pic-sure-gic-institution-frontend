use auth;

SET @resourceUUID = (SELECT
  LOWER(CONCAT(
    SUBSTR(HEX(uuid), 1, 8), '-',
    SUBSTR(HEX(uuid), 9, 4), '-',
    SUBSTR(HEX(uuid), 13, 4), '-',
    SUBSTR(HEX(uuid), 17, 4), '-',
    SUBSTR(HEX(uuid), 21)
  )) from picsure.resource where name = "PIC-SURE Aggregate Resource");

SET @uuidParentRule = REPLACE(UUID(),'-','');
SET @uuidChildRule = REPLACE(UUID(),'-','');

INSERT
    INTO access_rule (
        uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode,
        subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates
    )    VALUES (
        unhex(@uuidParentRule), 'EXPLORE_VARIANT', 'Sync query for variant explorer', '$..expectedResultType', 11,
        '(VARIANT_COUNT_FOR_QUERY|AGGREGATE_VCF_EXCERPT)', 0x00, 0x00, NULL, 0x00, 0x00
    );

INSERT
    INTO access_rule (
        uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode,
        subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates
    )
    VALUES (
        unhex(@uuidChildRule), 'EXPLORE_VARIANT_URI', 'Sync query for variant explorer',
        '$.[\'Target Service\']', 4, '/query/sync', 0x00, 0x00,
        unhex(@uuidParentRule), 0x00, 0x00
    );

SET @uuidPriv = REPLACE(UUID(),'-','');
INSERT
    INTO privilege (uuid, name, description, application_id)
    VALUES (
        unhex(@uuidPriv), 'EXPLORE_VARIANT', 'Explore aggregate results for variant',
        (SELECT uuid FROM application WHERE name = 'PICSURE')
    );

INSERT
    INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES (unhex(@uuidPriv), unhex(@uuidParentRule));

INSERT
    INTO role_privilege (role_id, privilege_id)
    VALUES ((SELECT uuid FROM role WHERE name = 'PIC-SURE Aggregate Count Role'), unhex(@uuidPriv));
