-- This is the access rule responsible for allowing aggregate requests
SET @uuidAccessRule = (SELECT uuid from access_rule WHERE access_rule.name = 'Allow Access to Aggregate Resource');

-- Delete all from accessRule_subRule for Aggregate Only Access
DELETE
    FROM accessRule_subRule
    WHERE accessRule_subRule.accessRule_id = @uuidAccessRule;

-- Delete all from accessRule_subRule for count rules (this should be empty anyways)
DELETE
FROM accessRule_subRule
WHERE
    accessRule_subRule.accessRule_id IN (
        SELECT access_rule.uuid
        FROM access_rule
        WHERE
            access_rule.rule = '$..expectedResultType'
            AND access_rule.value IN ('OBSERVATION_COUNT', 'OBSERVATION_CROSS_COUNT', 'CROSS_COUNT', 'COUNT', 'INFO_COLUMN_LISTING')
    );

-- Delete all from accessRule_gate for count rules
DELETE
FROM accessRule_gate
WHERE
    accessRule_gate.accessRule_id IN (
        SELECT access_rule.uuid
        FROM access_rule
        WHERE
            access_rule.rule = '$..expectedResultType'
            AND access_rule.value IN ('OBSERVATION_COUNT', 'OBSERVATION_CROSS_COUNT', 'CROSS_COUNT', 'COUNT', 'INFO_COLUMN_LISTING')
    );

-- Add new sub rule entries for all access rules that target expectedResultType and have a count value
INSERT INTO accessRule_gate (accessRule_id, gate_id)
    SELECT @uuidAccessRule AS accessRule_id, access_rule.uuid AS gate_id
    FROM access_rule
    WHERE
        access_rule.rule = '$..expectedResultType'
        AND access_rule.value IN ('OBSERVATION_COUNT', 'OBSERVATION_CROSS_COUNT', 'CROSS_COUNT', 'COUNT', 'INFO_COLUMN_LISTING');
