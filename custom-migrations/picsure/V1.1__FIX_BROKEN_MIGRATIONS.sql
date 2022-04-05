use picsure;

delete from flyway_custom_schema_history where script = 'V2__CREATE_HPDS_RESOURCE.sql' and success = 0;