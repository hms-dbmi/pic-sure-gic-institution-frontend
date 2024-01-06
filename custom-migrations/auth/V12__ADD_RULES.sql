use auth;

-- The way authorization works for PIC-SURE is odd. Generally, you assign users a series of privileges.
-- Each privilege has  has a series of access rules that determine what you can access with that role.
-- BUT
-- If all the users privileges combine to have NO access rules, then that user gets UNIVERSAL access.
-- This results in really weird behavior when you add access rules to a privilege + role. You expect
-- for the user's permissions to expand, when in really you can actually drastically reduce permissions.
--
-- The default role 'PIC-SURE User' has the privilege 'PIC_SURE_ANY_QUERY'. In this case, 'any query'
-- means any request. Now, there are other restrictions on requests that are enforced at the role level
-- using the @RolesAllowed annotation. This is what would stop an attacker from granting themselves roles, etc.
--
-- All of this is to say, if I write a rule that grants the Data Admin permission to use the uploader resource
-- I'll actually just restrict them from using the rest of the application. So I have to:
-- 1. Make the implicit access rules that exist for the PIC_SURE_ANY_QUERY privilege explicit
-- 2. Make an access rule and privilege for the Data Admin to access the uploader resource
--    This is a bit tricky; I have to go by request URI and not resource ID because the resource may not be added
--    when this migrator runs.


SET @allowNonProxyRequests = unhex(REPLACE(UUID(),'-',''));

-- Access rule for making existing PIC_SURE_ANY_QUERY logic explicit. Allows all requests
-- to any NON proxy endpoint.
INSERT
    INTO access_rule (
        uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode,
        subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates
    )    VALUES (
        @allowNonProxyRequests, 'ALLOW_NON_PROXY_REQUESTS', 'Permit requests to non proxy endpoints',
        '$.[\'Target Service\']', 11, '^/(?!proxy).*$', 0x00, 0x00, NULL, 0x00, 0x00
    );

-- Add that access rule to the PIC_SURE_ANY_QUERY privilege
SET @uuidPriv = (SELECT uuid FROM privilege WHERE name = 'PIC_SURE_ANY_QUERY');
INSERT
    INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES
	    (@uuidPriv, @allowNonProxyRequests);

SET @allowUploaderRequests = unhex(REPLACE(UUID(),'-',''));
-- Access rule for allowing requests to the uploader via proxy
INSERT
    INTO access_rule (
        uuid, name, description, rule, type, value, checkMapKeyOnly, checkMapNode,
        subAccessRuleParent_uuid, isGateAnyRelation, isEvaluateOnlyByGates
    )    VALUES (
        @allowUploaderRequests, 'ALLOW_UPLOADER', 'Permit requests to uploader endpoints',
        '$.[\'Target Service\']', 11, '^/proxy/uploader.*$', 0x00, 0x00, NULL, 0x00, 0x00
    );
-- Add that access rule to the DATA_ADMIN privilege
SET @uuidPriv = (SELECT uuid FROM privilege WHERE name = 'DATA_ADMIN');
INSERT
    INTO accessRule_privilege (privilege_id, accessRule_id)
	VALUES
	    (@uuidPriv, @allowUploaderRequests);
