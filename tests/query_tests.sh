#! /bin/bash

# Usage ./query_tests.sh [ hostname ]

set -eo pipefail

echo "🚀 Begin testing..."

# Set query endpoint
HOSTNAME=${1:-"https://localhost:443"}

# Set bearer token
BEARER_TOKEN=$(
    sudo docker run -v /root/.my.cnf:/root/.my.cnf --network=host mysql mysql -se \
    "
        USE auth;
        SELECT long_term_token FROM user WHERE email = 'CommonAreaUser';
    "
)

# Set resource UUID
RESOURCE_UUID=$(
    sudo docker run -v /root/.my.cnf:/root/.my.cnf --network=host mysql mysql -se \
    "
        USE picsure;
        SELECT
            concat(
                left(resource_uuid, 8),
                '-',
                substring(resource_uuid, 9, 4),
                '-',
                substring(resource_uuid, 13, 4),
                '-',
                substring(resource_uuid, 17, 4),
                '-',
                right(resource_uuid, 12)
            ) AS resource_uuid
        FROM (
            SELECT lower(hex(uuid)) AS resource_uuid
            FROM resource
            WHERE name = 'PIC-SURE Aggregate Resource'
            LIMIT 1
        ) AS resource_uuid;
    "
)

# Test query endpoint
echo "  📝 Testing /query endpoint"
QUERY_ENDPOINT="$HOSTNAME/picsure/query/sync"

# Send valid queries
echo "    ✅ Testing queries with valid ResultTypes"

VALID_RESULT_TYPES=(
    "COUNT"
    "CROSS_COUNT"
    "INFO_COLUMN_LISTING"
    "OBSERVATION_COUNT"
    "OBSERVATION_CROSS_COUNT"
)

for RESULT_TYPE in ${VALID_RESULT_TYPES[*]};
do
    echo "      ⏳ Expecting: $RESULT_TYPE"

    response=$(
        curl \
            --data-raw "{\"resourceUUID\":\"$RESOURCE_UUID\",\"query\":{\"categoryFilters\":{},\"numericFilters\":{},\"requiredFields\":[],\"anyRecordOf\":[],\"variantInfoFilters\":[{\"categoryVariantInfoFilters\":{},\"numericVariantInfoFilters\":{}}],\"expectedResultType\":\"$RESULT_TYPE\"},\"resourceCredentials\":{}}" \
            -H "Accept: */*" \
            -H "Authorization: Bearer $BEARER_TOKEN" \
            -H "Content-Type: application/json" \
            --include \
            --insecure \
            -X POST \
            $QUERY_ENDPOINT
    )
    status_code=$(echo $response | grep "HTTP" |  awk '{print $2}')

    echo "      ⌛ HTTP status: $status_code"
done

# Send invalid queries
echo "    ❌ Testing queries failing ResultTypes"

INVALID_RESULT_TYPES=(
    "DATAFRAME"
)

for RESULT_TYPE in ${INVALID_RESULT_TYPES[*]};
do
    echo "      ⏳ Expecting: $RESULT_TYPE"

    response=$(
        curl \
            --data-raw "{\"resourceUUID\":\"$RESOURCE_UUID\",\"query\":{\"categoryFilters\":{},\"numericFilters\":{},\"requiredFields\":[],\"anyRecordOf\":[],\"variantInfoFilters\":[{\"categoryVariantInfoFilters\":{},\"numericVariantInfoFilters\":{}}],\"expectedResultType\":\"$RESULT_TYPE\"},\"resourceCredentials\":{}}" \
            -H "Accept: */*" \
            -H "Authorization: Bearer $BEARER_TOKEN" \
            -H "Content-Type: application/json" \
            --include \
            --insecure \
            -X POST \
            $QUERY_ENDPOINT
    )
    status_code=$(echo $response | grep HTTP |  awk '{print $2}')

    echo "      ⌛ HTTP status: $status_code"
done

# Test search endpoint
echo "  📝 Testing /search endpoint"
SEARCH_ENDPOINT="$HOSTNAME/picsure/search/$RESOURCE_UUID"

# Send valid queries
echo "    ✅ Testing searches"

echo "      ⏳ Expecting: race"

response=$(
    curl \
        --data-raw "{\"query\":\"race\"}" \
        -H "Accept: */*" \
        -H "Authorization: Bearer $BEARER_TOKEN" \
        -H "Content-Type: application/json" \
        --include \
        --insecure \
        -X POST \
        $SEARCH_ENDPOINT
)
status_code=$(echo $response | grep HTTP |  awk '{print $2}')

echo "      ⌛ HTTP status: $status_code"

echo "🎉 Finished testing!"
