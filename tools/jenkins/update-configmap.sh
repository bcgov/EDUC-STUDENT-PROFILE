envValue=$1
APP_NAME=$2
PEN_NAMESPACE=$3
COMMON_NAMESPACE=$4
APP_NAME_UPPER=${APP_NAME^^}

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
KCADM_FILE_BIN_FOLDER="/tmp/keycloak-9.0.3/bin"
SOAM_KC=soam-$envValue.apps.silver.devops.gov.bc.ca
siteMinderLogoutUrl=""
HOST_ROUTE="${envValue}.getmypen.gov.bc.ca"
SERVER_FRONTEND="https://${envValue}.getmypen.gov.bc.ca"
if [ "$envValue" != "prod" ]
then
  siteMinderLogoutUrl="https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
else
  SERVER_FRONTEND="https://getmypen.gov.bc.ca"
  HOST_ROUTE="getmypen.gov.bc.ca"
  siteMinderLogoutUrl="https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
fi
NATS_CLUSTER=educ_nats_cluster
NATS_URL="nats://nats.${COMMON_NAMESPACE}-${envValue}.svc.cluster.local:4222"
oc project $COMMON_NAMESPACE-$envValue
SOAM_KC_LOAD_USER_ADMIN=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)
oc project $PEN_NAMESPACE-$envValue


$KCADM_FILE_BIN_FOLDER/kcadm.sh config credentials --server https://$SOAM_KC/auth --realm $SOAM_KC_REALM_ID --user $SOAM_KC_LOAD_USER_ADMIN --password $SOAM_KC_LOAD_USER_PASS

getStudentProfileClientID(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients -r $SOAM_KC_REALM_ID --fields 'id,clientId' | grep -B2 '"clientId" : "student-profile-soam"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}
studentProfileClientID=$(getStudentProfileClientID)

echo Removing PEN Request client if exists
$KCADM_FILE_BIN_FOLDER/kcadm.sh delete clients/$studentProfileClientID -r $SOAM_KC_REALM_ID

echo Creating student-profile-soam Keycloak client

$KCADM_FILE_BIN_FOLDER/kcadm.sh create clients -r $SOAM_KC_REALM_ID --body "{\"clientId\" : \"student-profile-soam\", \"name\" : \"Student Profile SOAM\", \"description\" : \"Connect user from Student Profile backend to the SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"$SERVER_FRONTEND\", \"$SERVER_FRONTEND/api/auth/callback_bcsc\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bcsc_ump\" , \"$SERVER_FRONTEND/logout\", \"$SERVER_FRONTEND/session-expired\", \"$SERVER_FRONTEND/api/auth/callback_bceid\", \"$SERVER_FRONTEND/api/auth/callback_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/callback_bceid_ump\", \"$SERVER_FRONTEND/login-error\", \"$SERVER_FRONTEND/api/auth/login_bcsc\", \"$SERVER_FRONTEND/api/auth/login_bcsc_gmp\", \"$SERVER_FRONTEND/api/auth/login_bcsc_ump\", \"$SERVER_FRONTEND/api/auth/login_bceid\", \"$SERVER_FRONTEND/api/auth/login_bceid_gmp\", \"$SERVER_FRONTEND/api/auth/login_bceid_ump\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"last_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"last_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"last_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"first_name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"first_name\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"first_name\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"middle_names\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"middle_names\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"middle_names\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"SOAM Mapper\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-soam-mapper\", \"consentRequired\" : false, \"config\" : {\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"userinfo.token.claim\" : \"true\" } }, { \"name\" : \"idir_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"idir_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"idir_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"bceid_guid\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"bceid_guid\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"bceid_guid\",\"jsonType.label\" : \"String\" } }, { \"name\" : \"email_address\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : {\"userinfo.token.claim\" : \"true\",\"user.attribute\" : \"email_address\",\"id.token.claim\" : \"true\",\"access.token.claim\" : \"true\",\"claim.name\" : \"email_address\",\"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"READ_STUDENT_CODES\", \"READ_STUDENT_PROFILE_CODES\", \"WRITE_STUDENT_PROFILE\", \"profile\", \"roles\", \"email\", \"READ_STUDENT_PROFILE\", \"READ_DIGITALID\", \"READ_STUDENT\", \"SEND_STUDENT_PROFILE_EMAIL\", \"DELETE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_REQUIREMENTS_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"SEND_STUDENT_PROFILE_EMAIL\", \"READ_DIGITALID_CODETABLE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"READ_PEN_REQUEST_CODES\", \"WRITE_PEN_REQUEST\", \"READ_PEN_REQUEST\", \"SEND_PEN_REQUEST_EMAIL\", \"DELETE_DOCUMENT\", \"READ_DOCUMENT\", \"READ_DOCUMENT_REQUIREMENTS\", \"WRITE_DOCUMENT\", \"READ_DOCUMENT_TYPES\", \"READ_PEN_REQUEST_STATUSES\",\"PEN_REQUEST_COMMENT_SAGA\",\"STUDENT_PROFILE_COMMENT_SAGA\"], \"optionalClientScopes\" : [ \"address\", \"phone\"], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true }}"

getPublicKey(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get keys -r $SOAM_KC_REALM_ID | grep -Po 'publicKey" : "\K([^"]*)'
}

echo Fetching public key from SOAM
soamFullPublicKey="-----BEGIN PUBLIC KEY----- $(getPublicKey) -----END PUBLIC KEY-----"

getStudentProfileServiceClientID(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients -r $SOAM_KC_REALM_ID --fields 'id,clientId' | grep -B2 '"clientId" : "student-profile-soam"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}
getStudentProfileServiceClientSecret(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients/$studentProfileServiceClientID/client-secret -r $SOAM_KC_REALM_ID | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}

getOfflineAccessID(){
  offlineAccessScopeID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get client-scopes --fields 'id,name' | grep -B2 '"name" : "offline_access"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}
getSecret(){
head /dev/urandom | tr -dc A-Za-z0-9 | head -c 5000 | base64
}
JWT_SECRET_KEY=$(getSecret)

echo
echo Fetching client ID for student-profile-soam client
studentProfileServiceClientID=$(getStudentProfileServiceClientID)
echo Fetching client secret for student-profile-soam client
studentProfileServiceClientSecret=$(getStudentProfileServiceClientSecret)
echo
echo getting scope id for offline access.
offlineAccessID=$(getOfflineAccessID)

$KCADM_FILE_BIN_FOLDER/kcadm.sh update clients/$studentProfileServiceClientID/default-client-scopes/$offlineAccessID

echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempPenBackendkey -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempPenBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempPenBackendkey -e -m pem)"
echo Removing key files
rm tempPenBackendkey
rm tempPenBackendkey.pub
echo Creating config map $APP_NAME-backend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=TZ=$TZVALUE --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL" --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" --from-literal=SOAM_CLIENT_ID=$APP_NAME-soam --from-literal=SOAM_CLIENT_SECRET=$studentProfileServiceClientSecret --from-literal=SERVER_FRONTEND="$SERVER_FRONTEND" --from-literal=ISSUER=PEN_Retrieval_Application --from-literal=STUDENT_PROFILE_API_ENDPOINT=https://student-profile-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=SOAM_PUBLIC_KEY="$soamFullPublicKey" --from-literal=SOAM_DISCOVERY=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration --from-literal=SOAM_URL=https://$SOAM_KC --from-literal=STUDENT_API_ENDPOINT=https://student-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=DIGITALID_API_ENDPOINT=https://digitalid-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=STUDENT_PROFILE_CLIENT_ID=student-profile-soam --from-literal=STUDENT_PROFILE_CLIENT_SECRET=$studentProfileServiceClientSecret --from-literal=STUDENT_PROFILE_EMAIL_API_ENDPOINT=https://student-profile-email-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=STUDENT_PROFILE_EMAIL_SECRET_KEY="$JWT_SECRET_KEY" --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" --from-literal=STUDENT_DEMOG_API_ENDPOINT=https://pen-demographics-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=LOG_LEVEL=info --from-literal=REDIS_HOST=redis --from-literal=REDIS_PORT=6379 --from-literal=TOKEN_TTL_MINUTES=1440 --from-literal=SCHEDULER_CRON_PROFILE_REQUEST_DRAFT="0 0 0 * * *" --from-literal=NUM_DAYS_ALLOWED_IN_DRAFT_STATUS=7 --from-literal=EXPECTED_DRAFT_REQUESTS=200  --from-literal=NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_EMAIL=5 --from-literal=NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_ABANDONED=7  --from-literal=PEN_REQUEST_API_ENDPOINT=https://pen-request-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=NATS_URL="$NATS_URL" --from-literal=NATS_CLUSTER="$NATS_CLUSTER" --from-literal=PROFILE_REQUEST_SAGA_API_URL=https://student-profile-saga-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-$SOAM_KC_REALM_ID

bceid_reg_url=""
journey_builder_url=""
if [ "$envValue" = "dev" ] || [ "$envValue" = "test"  ]
then
    bceid_reg_url="https://www.test.bceid.ca/os/?7081&SkipTo=Basic#action"
    journey_builder_url="https://www2.qa.gov.bc.ca/gov/content/education-training/k-12/support/pen"
else
    bceid_reg_url="https://www.bceid.ca/os/?7081&SkipTo=Basic#action"
    journey_builder_url="https://www2.gov.bc.ca/gov/content?id=74E29C67215B4988ABCD778F453A3129"
fi

if [ "$envValue" = "tools" ]
then
  HOST_ROUTE="dev.getmypen.gov.bc.ca"
elif [ "$envValue" = "dev" ]
then
  HOST_ROUTE="test.getmypen.gov.bc.ca"
fi


snowplow="
// <!-- Snowplow starts plowing - Standalone vE.2.14.0 -->
;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
 p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
 };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
 n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,\"script\",\"https://www2.gov.bc.ca/StaticWebResources/static/sp/sp-2-14-0.js\",\"snowplow\"));
var collector = 'spt.apps.gov.bc.ca';
 window.snowplow('newTracker','rt',collector, {
  appId: \"Snowplow_standalone\",
  cookieLifetime: 86400 * 548,
  platform: 'web',
  post: true,
  forceSecureTracker: true,
  contexts: {
   webPage: true,
   performanceTiming: true
  }
 });
 window.snowplow('enableActivityTracking', 30, 30); // Ping every 30 seconds after 30 seconds
 window.snowplow('enableLinkClickTracking');
 window.snowplow('trackPageView');
//  <!-- Snowplow stop plowing -->
"

regConfig="var config = (function() {
  return {
    \"VUE_APP_BCEID_REG_URL\" : \"$bceid_reg_url\",
    \"VUE_APP_JOURNEY_BUILDER\" : \"$journey_builder_url\",
    \"VUE_APP_IDLE_TIMEOUT_IN_MILLIS\" : \"1800000\"
  };
})();"

echo Creating config map $APP_NAME-frontend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$HOST_ROUTE --from-literal=config.js="$regConfig" --from-literal=snowplow.js="$snowplow"  --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-$SOAM_KC_REALM_ID

SPLUNK_TOKEN=$(oc -o json get configmaps ${APP_NAME}-${envValue}-setup-config | sed -n "s/.*\"SPLUNK_TOKEN_${APP_NAME_UPPER}\": \"\(.*\)\"/\1/p")

SPLUNK_URL="gww.splunk.educ.gov.bc.ca"
FLB_CONFIG="[SERVICE]
   Flush        1
   Daemon       Off
   Log_Level    debug
   HTTP_Server   On
   HTTP_Listen   0.0.0.0
   HTTP_Port     2020
[INPUT]
   Name   tail
   Path   /mnt/log/*
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

echo Creating config map $APP_NAME-flb-sc-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-flb-sc-config-map --from-literal=fluent-bit.conf="$FLB_CONFIG"  --dry-run -o yaml | oc apply -f -
