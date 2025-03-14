ENV_VALUE=$1
APP_NAME=$2
PEN_NAMESPACE=$3
COMMON_NAMESPACE=$4
SPLUNK_TOKEN=$5
BRANCH=$6
JOURNEY_BUILDER=$7
BCEID_REGISTRATION=$8

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
SOAM_KC="soam-$ENV_VALUE.apps.silver.devops.gov.bc.ca"
siteMinderLogoutUrl=""
HOST_ROUTE="$ENV_VALUE.getmypen.gov.bc.ca"
SERVER_FRONTEND="https://$ENV_VALUE.getmypen.gov.bc.ca"

if [ "$ENV_VALUE" != "prod" ]
then
  siteMinderLogoutUrl="https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
else
  SERVER_FRONTEND="https://getmypen.gov.bc.ca"
  HOST_ROUTE="getmypen.gov.bc.ca"
  siteMinderLogoutUrl="https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
fi
NATS_CLUSTER=educ_nats_cluster
NATS_URL="nats://nats.${COMMON_NAMESPACE}-${ENV_VALUE}.svc.cluster.local:4222"
SOAM_KC_LOAD_USER_ADMIN=$(oc -n "$COMMON_NAMESPACE-$ENV_VALUE" -o json get secret "sso-admin-${ENV_VALUE}" | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -n "$COMMON_NAMESPACE-$ENV_VALUE" -o json get secret "sso-admin-${ENV_VALUE}" | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)

echo Fetching SOAM token
TKN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=$SOAM_KC_LOAD_USER_ADMIN" \
  -d "password=$SOAM_KC_LOAD_USER_PASS" \
  -d "grant_type=password" \
  "https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/protocol/openid-connect/token" | jq -r '.access_token')

echo
echo Retrieving client ID for student-profile-soam
studentProfileClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="student-profile-soam")' | jq -r '.id')

echo
echo Retrieving client secret for student-profile-soam
studentProfileServiceClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentProfileClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')

echo
echo Removing student-profile-soam if exists
curl -sX DELETE "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentProfileClientID" \
  -H "Authorization: Bearer $TKN"

if [ "$studentProfileServiceClientSecret" != "" ] && [ "$ENV_VALUE" = "dev" ]
then
  echo
  echo Creating client student-profile-soam with secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{\"clientId\" : \"student-profile-soam\",\"secret\" : \"$studentProfileServiceClientSecret\", \"name\" : \"Student Profile SOAM\", \"description\" : \"Connect user from Student Profile backend to the SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"http://localhost*\", \"$SERVER_FRONTEND\", \"$SERVER_FRONTEND/api/auth/callback_bcsc\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_ump\" , \"$SERVER_FRONTEND/logout\", \"$SERVER_FRONTEND/session-expired\", \"$SERVER_FRONTEND/api/auth/callback_bceid\", \"$SERVER_FRONTEND/api/auth/callback_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bceid_ump\", \"$SERVER_FRONTEND/login-error\", \"$SERVER_FRONTEND/api/auth/login_bcsc\", \"$SERVER_FRONTEND/api/auth/login_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/login_bcsc_ump\", \"$SERVER_FRONTEND/api/auth/login_bceid\", \"$SERVER_FRONTEND/api/auth/login_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/login_bceid_ump\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"last_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"last_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"last_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"first_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"first_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"first_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"middle_names\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"middle_names\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"middle_names\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"SOAM Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-soam-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"user_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"user_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"user_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"bceid_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"bceid_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"bceid_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"email_address\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"email_address\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"email_address\",\"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"READ_STUDENT_CODES\", \"READ_STUDENT_PROFILE_CODES\", \"WRITE_STUDENT_PROFILE\", \"profile\", \"roles\", \"email\", \"READ_STUDENT_PROFILE\", \"READ_DIGITALID\", \"READ_STUDENT\", \"SEND_STUDENT_PROFILE_EMAIL\", \"DELETE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_REQUIREMENTS_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"SEND_STUDENT_PROFILE_EMAIL\", \"READ_DIGITALID_CODETABLE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"READ_PEN_REQUEST_CODES\", \"WRITE_PEN_REQUEST\", \"READ_PEN_REQUEST\", \"SEND_PEN_REQUEST_EMAIL\", \"DELETE_DOCUMENT\", \"READ_DOCUMENT\", \"READ_DOCUMENT_REQUIREMENTS\", \"WRITE_DOCUMENT\", \"READ_DOCUMENT_TYPES\", \"READ_PEN_REQUEST_STATUSES\",\"PEN_REQUEST_COMMENT_SAGA\",\"STUDENT_PROFILE_COMMENT_SAGA\",\"STUDENT_PROFILE_READ_SAGA\"], \"optionalClientScopes\" : [ \"address\", \"phone\"], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true }}"
else
  echo
  echo Creating client student-profile-soam without secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{\"clientId\" : \"student-profile-soam\", \"name\" : \"Student Profile SOAM\", \"description\" : \"Connect user from Student Profile backend to the SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"$SERVER_FRONTEND\", \"$SERVER_FRONTEND/api/auth/callback_bcsc\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_ump\" , \"$SERVER_FRONTEND/logout\", \"$SERVER_FRONTEND/session-expired\", \"$SERVER_FRONTEND/api/auth/callback_bceid\", \"$SERVER_FRONTEND/api/auth/callback_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bceid_ump\", \"$SERVER_FRONTEND/login-error\", \"$SERVER_FRONTEND/api/auth/login_bcsc\", \"$SERVER_FRONTEND/api/auth/login_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/login_bcsc_ump\", \"$SERVER_FRONTEND/api/auth/login_bceid\", \"$SERVER_FRONTEND/api/auth/login_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/login_bceid_ump\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"last_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"last_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"last_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"first_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"first_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"first_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"middle_names\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"middle_names\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"middle_names\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"SOAM Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-soam-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"user_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"user_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"user_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"idir_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"bceid_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"bceid_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"bceid_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"email_address\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"email_address\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"email_address\",\"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"READ_STUDENT_CODES\", \"READ_STUDENT_PROFILE_CODES\", \"WRITE_STUDENT_PROFILE\", \"profile\", \"roles\", \"email\", \"READ_STUDENT_PROFILE\", \"READ_DIGITALID\", \"READ_STUDENT\", \"SEND_STUDENT_PROFILE_EMAIL\", \"DELETE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_REQUIREMENTS_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"SEND_STUDENT_PROFILE_EMAIL\", \"READ_DIGITALID_CODETABLE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"READ_PEN_REQUEST_CODES\", \"WRITE_PEN_REQUEST\", \"READ_PEN_REQUEST\", \"SEND_PEN_REQUEST_EMAIL\", \"DELETE_DOCUMENT\", \"READ_DOCUMENT\", \"READ_DOCUMENT_REQUIREMENTS\", \"WRITE_DOCUMENT\", \"READ_DOCUMENT_TYPES\", \"READ_PEN_REQUEST_STATUSES\",\"PEN_REQUEST_COMMENT_SAGA\",\"STUDENT_PROFILE_COMMENT_SAGA\",\"STUDENT_PROFILE_READ_SAGA\"], \"optionalClientScopes\" : [ \"address\", \"phone\"], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true }}"
fi

echo Fetching public key from SOAM
fullKey=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.keys | .[] | select(.algorithm == "RS256") | .publicKey')

echo Fetching public key from SOAM
soamFullPublicKey="-----BEGIN PUBLIC KEY----- $fullKey -----END PUBLIC KEY-----"
newline=$'\n'
formattedPublicKey="${soamFullPublicKey:0:26}${newline}${soamFullPublicKey:27:64}${newline}${soamFullPublicKey:91:64}${newline}${soamFullPublicKey:155:64}${newline}${soamFullPublicKey:219:64}${newline}${soamFullPublicKey:283:64}${newline}${soamFullPublicKey:347:64}${newline}${soamFullPublicKey:411:9}${newline}${soamFullPublicKey:420}"

getSecret(){
head /dev/urandom | tr -dc A-Za-z0-9 | head -c 5000 | base64
}
JWT_SECRET_KEY=$(getSecret)

echo
echo Retrieving client ID for student-profile-soam
studentProfileClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="student-profile-soam")' | jq -r '.id')

echo
echo Retrieving client secret for student-profile-soam
studentProfileServiceClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentProfileClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')

if [ "$ENV_VALUE" = "dev" ]
then
  bannerEnvironment="DEV"
  bannerColor="#8d28d7"
elif [ "$ENV_VALUE" = "test" ]
then
  bannerEnvironment="TEST"
  bannerColor="#dba424"
fi

RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_IN_SEC="60"
RATE_LIMIT_LIMIT="1000"

echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempPenBackendkey -m pem -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempPenBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempPenBackendkey -e -m pem)"
echo Removing key files
rm tempPenBackendkey
rm tempPenBackendkey.pub
echo Creating config map "$APP_NAME-backend-config-map"
oc create -n "$PEN_NAMESPACE-$ENV_VALUE" configmap "$APP_NAME-backend-config-map" \
  --from-literal=TZ=$TZVALUE \
  --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL" \
  --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" \
  --from-literal=SOAM_CLIENT_ID="$APP_NAME-soam" \
  --from-literal=SOAM_CLIENT_SECRET="$studentProfileServiceClientSecret" \
  --from-literal=SERVER_FRONTEND="$SERVER_FRONTEND" \
  --from-literal=ISSUER=PEN_Retrieval_Application \
  --from-literal=STUDENT_PROFILE_API_ENDPOINT="http://student-profile-api-master.$COMMON_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080/api/v1/student-profile" \
  --from-literal=SOAM_PUBLIC_KEY="$formattedPublicKey" \
  --from-literal=SOAM_DISCOVERY="https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration" \
  --from-literal=SOAM_URL="https://$SOAM_KC" \
  --from-literal=STUDENT_API_ENDPOINT="http://student-api-master.$COMMON_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080/api/v1/student" \
  --from-literal=DIGITALID_API_ENDPOINT="http://digitalid-api-master.$COMMON_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080/api/v1/digital-id" \
  --from-literal=STUDENT_PROFILE_EMAIL_API_ENDPOINT="http://student-profile-email-api-master.$PEN_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080" \
  --from-literal=STUDENT_PROFILE_EMAIL_SECRET_KEY="$JWT_SECRET_KEY" \
  --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" \
  --from-literal=STUDENT_DEMOG_API_ENDPOINT="http://pen-demographics-api-master.$COMMON_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080" \
  --from-literal=LOG_LEVEL=info \
  --from-literal=REDIS_HOST=redis \
  --from-literal=REDIS_PORT=6379 \
  --from-literal=TOKEN_TTL_MINUTES=1440 \
  --from-literal=SCHEDULER_CRON_PROFILE_REQUEST_DRAFT="0 0 0 * * *" \
  --from-literal=NUM_DAYS_ALLOWED_IN_DRAFT_STATUS=7 \
  --from-literal=EXPECTED_DRAFT_REQUESTS=200  \
  --from-literal=NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_EMAIL=5 \
  --from-literal=NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_ABANDONED=7  \
  --from-literal=PEN_REQUEST_API_ENDPOINT="http://pen-request-api-master.$COMMON_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080/api/v1/pen-request" \
  --from-literal=NATS_URL="$NATS_URL" \
  --from-literal=NATS_CLUSTER="$NATS_CLUSTER" \
  --from-literal=SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS="0 0/5 * * * *" \
  --from-literal=MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES=5 \
  --from-literal=PROFILE_REQUEST_SAGA_API_URL="http://student-profile-saga-api-master.$PEN_NAMESPACE-$ENV_VALUE.svc.cluster.local:8080/api/v1/student-profile-saga" \
  --from-literal=BCEID_REG_URL="$BCEID_REGISTRATION" \
  --from-literal=IDLE_TIMEOUT_IN_MILLIS=1800000 \
  --from-literal=JOURNEY_BUILDER="$JOURNEY_BUILDER" \
  --from-literal=BANNER_COLOR="$bannerColor" \
  --from-literal=BANNER_ENVIRONMENT="$bannerEnvironment" \
  --from-literal=NODE_ENV="openshift" \
  --from-literal=RATE_LIMIT_ENABLED="$RATE_LIMIT_ENABLED" \
  --from-literal=RATE_LIMIT_WINDOW_IN_SEC="$RATE_LIMIT_WINDOW_IN_SEC" \
  --from-literal=RATE_LIMIT_LIMIT="$RATE_LIMIT_LIMIT" \
  --dry-run=client -o yaml | oc apply -f -

echo
echo Setting environment variables for "$APP_NAME-backend-$SOAM_KC_REALM_ID" application
oc -n "$PEN_NAMESPACE-$ENV_VALUE" set env \
  --from="configmap/$APP_NAME-backend-config-map" \
  "deployment/$APP_NAME-backend-$BRANCH"

echo Creating config map "$APP_NAME-frontend-config-map"
oc create -n "$PEN_NAMESPACE-$ENV_VALUE" configmap "$APP_NAME-frontend-config-map" \
  --from-literal=TZ="$TZVALUE" \
  --from-literal=HOST_ROUTE="$HOST_ROUTE" \
  --dry-run=client -o yaml | oc apply -f -
echo
echo Setting environment variables for "$APP_NAME-frontend-$SOAM_KC_REALM_ID" application
oc -n "$PEN_NAMESPACE-$ENV_VALUE" set env \
  --from="configmap/$APP_NAME-frontend-config-map" \
  "deployment/$APP_NAME-frontend-$BRANCH"

SPLUNK_URL="gww.splunk.educ.gov.bc.ca"
FLB_CONFIG="[SERVICE]
   Flush        1
   Daemon       Off
   Log_Level    debug
   HTTP_Server   On
   HTTP_Listen   0.0.0.0
   Parsers_File parsers.conf
[INPUT]
   Name   tail
   Path   /mnt/log/*
   Parser docker
   Mem_Buf_Limit 20MB
[FILTER]
   Name record_modifier
   Match *
   Record hostname \${HOSTNAME}
[OUTPUT]
   Name   stdout
   Match  *
[OUTPUT]
   Name  splunk
   Match *
   Host  $SPLUNK_URL
   Port  443
   TLS         On
   TLS.Verify  Off
   Message_Key $APP_NAME
   Splunk_Token $SPLUNK_TOKEN
"
PARSER_CONFIG="
[PARSER]
    Name        docker
    Format      json
"

echo Creating config map "$APP_NAME-flb-sc-config-map"
oc create -n "$PEN_NAMESPACE-$ENV_VALUE" configmap \
  "$APP_NAME-flb-sc-config-map" \
  --from-literal=fluent-bit.conf="$FLB_CONFIG" \
  --from-literal=parsers.conf="$PARSER_CONFIG" \
  --dry-run=client -o yaml | oc apply -f -

echo Removing un-needed config entries
oc -n "$PEN_NAMESPACE-$ENV_VALUE" set env \
  "deployment/$APP_NAME-backend-$SOAM_KC_REALM_ID" STUDENT_PROFILE_CLIENT_ID-
oc -n "$PEN_NAMESPACE-$ENV_VALUE" set env \
  "deployment/$APP_NAME-backend-$SOAM_KC_REALM_ID" STUDENT_PROFILE_CLIENT_SECRET-
