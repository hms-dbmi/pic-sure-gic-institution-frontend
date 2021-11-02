use auth;

update connection set requiredFields = '[{"label":"Account Name", "id":"name"}]' where id = "manual-token";
update user set general_metadata = '{"name":"Common Area Service User"}' where email = "CommonAreaUser";