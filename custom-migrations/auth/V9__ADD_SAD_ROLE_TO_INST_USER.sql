use auth;

-- The GIC institute nodes have a special user called CommonAreaUser that the common area uses to run federated queries.
-- This user now needs the ability to run these queries, so we add them to the Secret Admin Dataframe role

-- We're ignoring duplicate key errors (the constraint will still be enforced) to handle institutes that already
-- upgraded and did this manually.
INSERT IGNORE INTO user_role (user_id, role_id)
	VALUES (
	    (SELECT uuid FROM user WHERE email = 'CommonAreaUser'),
	    (SELECT uuid FROM role WHERE name = 'PIC-SURE Secret Dataframe Requester')
    );
