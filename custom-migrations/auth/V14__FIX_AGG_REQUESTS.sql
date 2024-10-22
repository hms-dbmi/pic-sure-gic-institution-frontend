-- This is the access rule responsible for allowing aggregate requests
SET @uuidAccessRule = (SELECT uuid from access_rule WHERE access_rule.name = 'Aggregate Only Access' LIMIT 1 OFFSET 0);

-- This is an extra access rule that does the same thing. It's identical
SET @uuidThatBrokeThings = (SELECT uuid from access_rule WHERE access_rule.name = 'Aggregate Only Access' LIMIT 1 OFFSET 1);

-- Release the evil access rule and kill it
UPDATE accessRule_gate
    SET gate_id = @uuidAccessRule
    WHERE gate_id = @uuidThatBrokeThings;

-- There's one sub rule relation to expected result type = COUNT, but that makes no sense
DELETE FROM accessRule_subRule WHERE accessRule_id = @uuidThatBrokeThings;

DELETE FROM access_rule WHERE uuid = @uuidThatBrokeThings;

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

-- Delete all from accessRule_gate for Aggregate Only Access
DELETE FROM accessRule_gate WHERE accessRule_gate.gate_id = @uuidAccessRule;
DELETE FROM accessRule_gate WHERE accessRule_gate.accessRule_id = @uuidAccessRule;

-- Add new sub rule entries for all access rules that target expectedResultType and have a count value
INSERT INTO accessRule_gate (accessRule_id, gate_id)
    SELECT access_rule.uuid AS gate_id, @uuidAccessRule AS accessRule_id
    FROM access_rule
    WHERE
        access_rule.rule = '$..expectedResultType'
        AND access_rule.value IN ('OBSERVATION_COUNT', 'OBSERVATION_CROSS_COUNT', 'CROSS_COUNT', 'COUNT', 'INFO_COLUMN_LISTING');
