use auth;

UPDATE access_rule
    SET rule = '$.[\'Target Service\']'
    WHERE name IN ('AR_ONLY_SEARCH');
