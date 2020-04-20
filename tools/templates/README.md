## Templates
This folder contains reusable templates that can be called from the oc command line or from within DevOps tools such as Jenkins.

### bc.template.yaml
To process this file from the oc command line run:
```
oc process -f bc.template.yaml REPO_NAME='name of your repo' JOB_NAME='tag to identify instance' SOURCE_REPO_REF='name of branch eg. master' SOURCE_REPO_URL='url of repo' CONTEXT_DIR='route to location of root directory' GIT_REF='the branch you wish to build from'
```
#### bc-docker
This strategy looks for a file named "Dockerfile" located in the root directory specified by the CONTEXT_DIR parameter

#### bc-source
This strategy builds you application using the main project file (pom, package.json, etc) and a source image as the base. In addition to the parameters mentioned above, you will need to add a SOURCE_TAG='' parameter that specifies the base image (eg. node:lts-alpine).

### dc.template.yaml
To process this file from the oc command line run:
```
oc process -f dc.template.yaml REPO_NAME='name of your repo' JOB_NAME='tag to identify instance' NAMESPACE='namespace you wish to deploy to' APP_NAME='identifying tag' HOST_ROUTE='url of deployment' CONTAINER_PORT='port that this deployment is available from' TAG='tag to identify this deployment from others' HOST_PATH='anything appended to the end of the url (eg. /api)'
```

### pipeline.template.yaml
To process this file from the oc command line run:
```
oc process -f pipeline.template.yaml PIPELINE_NAME='name of pipeline (unique)' PIPELINE_REPO='repo where Jenkinsfile is located' PIPELINE_PATH='path from root directory to jenkinsfile'
```
