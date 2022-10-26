# certificate-manager-to-secrets-manager

This repository stores scripts that you can use to migrate certificates and their private keys from [IBM Cloud Certificate Manager](https://www.ibm.com/cloud/certificate-manager) to [IBM Cloud Secrets Manager](https://www.ibm.com/cloud/secrets-manager).

For more information about migrating certificates to Secrets Manager, check out the [migration guide](https://cloud.ibm.com/docs/secrets-manager?topic=secrets-manager-migrate-from-certificate-manager).

## Prerequisites

Before you can work with these scripts, you'll need an [IBM Cloud API key](https://cloud.ibm.com/iam/apikeys) with the correct level of access. The minimum requirements depend on the script that you want to run. Check the instructions for each script to understand the level of access required.

## Installation

You can run the migration scripts from any Node.js environment, such as from your local machine or by using an IBM Cloud Functions action.

<details>
<summary><b>Show local run instructions</b></summary>

1. [Download and install Node.js](https://nodejs.org/en/download/). 
    
2. Download or clone this repository.

    ```sh
    git clone https://github.com/ibm-cloud-security/certificate-manager-to-secrets-manager.git
    ```

3. In your project directory, install required packages using `npm`.

    ```sh
    npm install
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>

1. Choose an option for [setting up a Node.js action](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-actions).

    You can use the IBM Cloud CLI or console to create an action. To view your available actions in the console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
2. Create an action that uses the **Node.js 16** runtime.
</details>

>**Tip:** Running these scripts locally? If you're not planning to run the migration scripts by using Cloud Functions, and you need further customizations, you can use our [Node.js SDK](https://github.com/IBM/secrets-manager-nodejs-sdk).

## Usage 

### Script 1: List of the properties of each Certificate Manager instance

Use this script to retrieve the properties of each Certificate Manager instance that is provisioned in the specified IBM Cloud account.

#### Instructions

Before you can run this script, be sure that you have an IBM Cloud API key with the correct level of access. Minimum access required: `Viewer` platform role and `Reader` service role on the Certificate Manager service.

<details>
<summary><b>Show local run instructions</b></summary>

1. In your command line (Windows or macOS / Linux), change into the directory that contains the `cm_migration.js` file.
2. Create the following environment variable:

    ```sh
    export CM_APIKEY=<api_key>
    ```

    Variable | Description
    --- | ---
    `CM_APIKEY` | The API key that has access to Certificate Manager instances in the target IBM Cloud account.
    `IS_TEST_ACCOUNT` | **For internal IBM teams only.** Optional. Set this variable to `true` if you are using an API key in your test IBM Cloud account. Otherwise, set to `false` (default). 


3. Run the script by using the following command:

    ```sh 
    npm run cm_inventory
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>

1. In the IBM Cloud console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
    If you haven't created an action yet, create one using the Node.js 16 runtime.
2. Copy the content of the `cm_migration.js` file into your IBM Cloud Functions action code.
3. Add the following parameters:

    ```sh
    SCRIPT_NAME=cm_inventory
    CM_APIKEY=<api_key>
    ```
    
    Parameter | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To retrieve the properties of your Certificate Manager instances, use `cm_inventory`.
    `CM_APIKEY` | The API key that has access to Certificate Manager instances in the target IBM Cloud account.
    `IS_TEST_ACCOUNT` | **For internal IBM teams only.** Optional. Set this variable to `true` if you are using an API key in your test IBM Cloud account. Otherwise, set to `false` (default). 


4. Click **Invoke** to run the script.

</details>
 
#### Response

The `cm_inventory` script outputs a dictionary of all Certificate Manager instances within the target account, listed by their Cloud Resource Names (CRN).

<details>
<summary><b>Show response</b></summary>

For each instance, the following data is displayed:

Property | Description
--- | ---
Region | The region in which the Certificate Manager instance is located.
Resource group ID | The ID of the resource group that contains the Certificate Manager instance.
Name | The name of the Certificate Manager instance.
CRN | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance.
Is BYOK | Specifies whether the instance is integrated with a key management service (KMS), such as IBM Key Protect, that supports Bring Your Own Keys or [customer-managed encryption](https://cloud.ibm.com/docs/certificate-manager?topic=certificate-manager-mng-data#about-encryption).<br><br><ul><li>`kms_info`: The ID and URL of the KMS instance that is associated with the Certificate Manager instance.</li><li>`tek_id`: The CRN of the root key that is associated with the Certificate Manager instance. 
Is private only | Specifies whether the instance is accessible only through [private service endpoints](https://cloud.ibm.com/docs/certificate-manager?topic=certificate-manager-service-connection).
Number of managed certificates | Not supported for private-only instances.
Number of configured notification channels | Not supported for private-only instances.
List of certificate IDs (CRN) | Not supported for private-only instances.
</details>

### Script 2: Copy a certificate to a Secrets Manager instance

Use this script to copy a single certificate from a Certificate Manager instance into a Secrets Manager instance that is provisioned in the specified IBM Cloud account.

Keep in mind the following limitations:

* Secrets Manager does not support secret names with spaces. If the name of the requested certificate contains spaces, the script will replace those spaces with dashes (`-`).
* Secrets Manager does not support secret names that start with *. If the name of the requested certificate starts with *, the script will replace that with 'star'.
* This script can't be run against instances that are accessible only through private service endpoints. 

#### Instructions

Before you can run this script, be sure that you have an IBM Cloud API key with the correct level of access. Minimum access required: `Writer` service role on the Certificate Manager service and `Writer` service role on the Secrets Manager service.

<details>
<summary><b>Show local run instructions</b></summary>

1. In your command line (Windows or macOS / Linux), change into the directory that contains the `cm_migration.js` file.
2. Create the following environment variables:

    ```sh
    export CM_APIKEY=<your_certificate_manager_api_key>
    export SM_APIKEY=<your_secrets_manager_api_key>
    export CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    export SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    export CERTIFICATE_ID=<certificate_UUID>
    ```

    Variable | Description
    --- | ---
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificate that you want to copy.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to copy your certificate to.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CERTIFICATE_ID` | The ID (UUID) of the requested certificate.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `ONLY_IMPORTED` | Optional. Specifies whether the script should migrate imported certificates only. To copy imported certificates only, set to `true` (default). If otherwise, set to `false`.


3. Run the script by using the following command:

    ```sh 
    npm run cm_cert_copy
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>

1. In the IBM Cloud console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
    If you haven't created an action yet, create one using the Node.js 16 runtime.
2. Copy the content of the `cm_migration.js` file into your IBM Cloud Functions action code.
3. Add the following parameters:

    ```sh
    SCRIPT_NAME=cm_cert_copy
    CM_APIKEY=<your_certificate_manager_api_key>
    SM_APIKEY=<your_secrets_manager_api_key>
    CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    CERTIFICATE_ID=<certificate_UUID>
    ```
    
    Parameter | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To copy a single certificate from a Certificate Manager instance to a Secrets Manager instance, use `cm_cert_copy`.
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificate that you want to copy.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to copy your certificate to.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CERTIFICATE_ID` | The ID (UUID) of the requested certificate.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `ONLY_IMPORTED` | Optional. Specifies whether the script should migrate imported certificates only. To copy imported certificates only, set to `true` (default). If otherwise, set to `false`.

4. Click **Invoke** to run the script.

</details>

#### Response

The `cm_cert_copy` script outputs a success message ("Certificate migrated successfully!") or an error message in case of an error.

### Script 3: Copy all imported certificates from a Certificate Manager instance to a Secrets Manager instance

Use this script to copy all of the imported certificates that are managed in a Certificate Manager instance to a destination Secrets Manager instance in your account.

Keep in mind the following limitations:

* Secrets Manager does not support secret names with spaces. If the name of the requested certificate contains spaces, the script will replace those spaces with dashes (`-`).
* Secrets Manager does not support secret names that start with *. If the name of the requested certificate starts with *, the script will replace that with 'star'.
* This script can't be run against instances that are accessible only through private service endpoints. 

#### Instructions

Before you can run this script, be sure that you have an IBM Cloud API key with the correct level of access. Minimum access required: `Writer` service role on the Certificate Manager service and `Writer` service role on the Secrets Manager service.

<details>
<summary><b>Show local run instructions</b></summary>

1. In your command line (Windows or macOS / Linux), change into the directory that contains the `cm_migration.js` file.
2. Create the following environment variables:

    ```sh
    export CM_APIKEY=<your_certificate_manager_api_key>
    export SM_APIKEY=<your_secrets_manager_api_key>
    export CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    export SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    ```

    Variable | Description
    --- | ---
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificates that you want to copy.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to copy your certificates to.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificates.
    `ONLY_IMPORTED` | Optional. Specifies whether the script should migrate imported certificates only. To copy imported certificates only, set to `true` (default). If otherwise, set to `false`.


3. Run the script by using the following command:

    ```sh 
    npm run cm_instance_copy
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>


1. In the IBM Cloud console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
    If you haven't created an action yet, create one using the Node.js 16 runtime.
2. Copy the content of the `cm_migration.js` file into your cloud function action code.
3. Add the following parameters:

    ```sh
    SCRIPT_NAME=cm_instance_copy
    CM_APIKEY=<your_certificate_manager_api_key>
    SM_APIKEY=<your_secrets_manager_api_key>
    CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    ```
    
    Parameter | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To copy all certificates from a Certificate Manager instance to a Secrets Manager instance, use `cm_instance_copy`.
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificates that you want to copy.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to copy your certificates to.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificates.
    `ONLY_IMPORTED` | Optional. Specifies whether the script should migrate imported certificates only. To copy imported certificates only, set to `true` (default). If otherwise, set to `false`.


4. Click **Invoke** to run the script.

</details>

#### Response

The `cm_instance_copy` script outputs a JSON object that contains information about the success or failure of the migration of each certificate.

### Script 4: Order a certificate in Secrets Manager that matches a Let’s Encrypt certificate in Certificate Manager

Use this script to order a single public certificate in a destination Secrets Manager instance. The certificate must match an existing Let's Encrypt certificate that is located in the specified Certificate Manager instance and IBM Cloud account.

Keep in mind the following limitations:

* Secrets Manager does not support secret names with spaces. If the name of the requested certificate contains spaces, the script will replace those spaces with dashes (`-`).
* Secrets Manager does not support secret names that start with *. If the name of the requested certificate starts with *, the script will replace that with 'star'.
* This script can't be run against instances that are accessible only through private service endpoints. 

#### Instructions

Before you can run this script, be sure that you have an IBM Cloud API key with the correct level of access. Minimum access required: `Writer` service role on the Certificate Manager service and `Writer` service role on the Secrets Manager service.

<details>
<summary><b>Show local run instructions</b></summary>

1. In your command line (Windows or macOS / Linux), change into the directory that contains the `cm_migration.js` file.
2. Create the following environment variables:

    ```sh
    export CM_APIKEY=<your_certificate_manager_api_key>
    export SM_APIKEY=<your_secrets_manager_api_key>
    export CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    export SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    export CERTIFICATE_ID=<certificate_UUID>
    export CA_CONFIGURATION_NAME=<ca_configuration_name>
    export DNS_PROVIDER_CONFIGURATION_NAME=<dns_provider_configuration_name>
    ```

    Variable | Description
    --- | ---
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificate that you want to order in Secrets Manager.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to order the certificate.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CERTIFICATE_ID` | The ID (UUID) of the requested certificate.
    `CA_CONFIGURATION_NAME` | The name of the certificate authority (CA) configuration in Secrets Manager.
    `DNS_PROVIDER_CONFIGURATION_NAME` | The name of the DNS provider configuration in Secrets Manager.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `BUNDLE_CERTS` | Optional. Set to `false` for the certificate file to contain only the issued certificate, and `true` (default) otherwise.
    

3. Run the script by using the following command:

    ```sh 
    npm run sm_public_cert
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>

1. In the IBM Cloud console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
    If you haven't created an action yet, create one using the Node.js 16 runtime.
2. Copy the content of the `cm_migration.js` file into your IBM Cloud Functions action code.
3. Add the following parameters:

    ```sh
    SCRIPT_NAME=sm_public_cert
    CM_APIKEY=<your_certificate_manager_api_key>
    SM_APIKEY=<your_secrets_manager_api_key>
    CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    CERTIFICATE_ID=<certificate_UUID>
    CA_CONFIGURATION_NAME=<ca_configuration_name>
    DNS_PROVIDER_CONFIGURATION_NAME=<dns_provider_configuration_name>
    ```
    
    Parameter | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To order a certificate in Secrets Manager that matches a Let’s Encrypt certificate in CM, use `sm_public_cert`.
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificate that you want to order in Secrets Manager.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to order the certificate.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CERTIFICATE_ID` | The ID (UUID) of the requested certificate.
    `CA_CONFIGURATION_NAME` | The name of the certificate authority (CA) configuration in Secrets Manager.
    `DNS_PROVIDER_CONFIGURATION_NAME` | The name of the DNS provider configuration in Secrets Manager.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `BUNDLE_CERTS` | Optional. Set to `false` for the certificate file to contain only the issued certificate, and `true` (default) if otherwise.


4. Click **Invoke** to run the script.

</details>

#### Response

The `sm_public_cert` script outputs a success message ("Certificate ordered successfully!") or an error message in case of an error.

### Script 5: Order all certificates in Secrets Manager that match Let’s Encrypt certificates in Certificate Manager

Use this script to order all public certificates in a destination Secrets Manager instance. The certificates must match existing Let's Encrypt certificates that are located in the specified Certificate Manager instance and IBM Cloud account.

Keep in mind the following limitations:

* Secrets Manager does not support secret names with spaces. If the name of the requested certificate contains spaces, the script will replace those spaces with dashes (`-`).
* Secrets Manager does not support secret names that start with *. If the name of the requested certificate starts with *, the script will replace that with 'star'.
* This script can't be run against instances that are accessible only through private service endpoints. 

#### Instructions

Before you can run this script, be sure that you have an IBM Cloud API key with the correct level of access. Minimum access required: `Writer` service role on the Certificate Manager service and `Writer` service role on the Secrets Manager service.

<details>
<summary><b>Show local run instructions</b></summary>

1. In your command line (Windows or macOS / Linux), change into the directory that contains the `cm_migration.js` file.
2. Create the following environment variables:

    ```sh
    export SCRIPT_NAME=sm_instance_public_cert
    export CM_APIKEY=<your_certificate_manager_api_key>
    export SM_APIKEY=<your_secrets_manager_api_key>
    export CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    export SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    export CA_CONFIGURATION_NAME=<ca_configuration_name>
    export DNS_PROVIDER_CONFIGURATION_NAME=<dns_provider_configuration_name>
    ```

    Variable | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To order all of the certificates in Secrets Manager that matches a Let’s Encrypt certificate in a specific instance of CM, use `sm_instance_public_cert`.
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificates that you want to order in Secrets Manager.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to order the certificates.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CA_CONFIGURATION_NAME` | The name of the certificate authority (CA) configuration in Secrets Manager. 
    `DNS_PROVIDER_CONFIGURATION_NAME` | The name of the DNS provider configuration in Secrets Manager.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `BUNDLE_CERTS` | Optional. Set to `false` for the certificate file to contain only the issued certificate, and `true` (default) if otherwise.


3. Run the script by using the following command:

    ```sh 
    npm run sm_instance_public_cert
    ```
</details>

<details>
<summary><b>Show IBM Cloud Function instructions</b></summary>

1. In the IBM Cloud console, click the **Menu** icon **> Functions > [Actions](https://cloud.ibm.com/functions/actions)**.
   
    If you haven't created an action yet, create one using the Node.js 16 runtime.
2. Copy the content of the `cm_migration.js` file into your cloud function action code.
3. Add the following parameters:

    ```sh
    SCRIPT_NAME=sm_instance_public_cert
    CM_APIKEY=<your_certificate_manager_api_key>
    SM_APIKEY=<your_secrets_manager_api_key>
    CM_INSTANCE_CRN=<certificate_manager_instance_CRN>
    SM_INSTANCE_CRN=<secrets_manager_instance_CRN>
    CA_CONFIGURATION_NAME=<ca_configuration_name>
    DNS_PROVIDER_CONFIGURATION_NAME=<dns_provider_configuration_name>
    ```
    
    Parameter | Description
    --- | ---
    `SCRIPT_NAME` | Targets the script to run. To order all of the certificates in Secrets Manager that matches a Let’s Encrypt certificate in a specific instance of CM, use `sm_instance_public_cert`.
    `CM_APIKEY` | The API key that has access to the Certificate Manager instance that contains the certificates that you want to order in Secrets Manager.
    `SM_APIKEY` | The API key that has access to the Secrets Manager instance where you'd like to order the certificates.
    `CM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. 
    `SM_INSTANCE_CRN` | The Cloud Resource Name (CRN) that uniquely identifies the Certificate Manager instance. You can find the CRN of your instance in the **Settings** page of the Secrets Manager service dashboard. 
    `CA_CONFIGURATION_NAME` | The name of the certificate authority (CA) configuration in Secrets Manager.
    `DNS_PROVIDER_CONFIGURATION_NAME` | The name of the DNS provider configuration in Secrets Manager.
    `SECRET_GROUP_NAME` | Optional. The name of the secret group in the target Secrets Manager instance that you want to assign to the certificate.
    `BUNDLE_CERTS` | Optional. Set to `false` for the certificate file to contain only the issued certificate, and `true` (default) if otherwise.


4. Click **Invoke** to run the script.

</details>

#### Response

The `sm_instance_public_cert` script outputs a JSON object that contains information about the success or failure of the migration of each certificate.

## Questions

If you have questions about this project, you can use [Stack Overflow](https://stackoverflow.com/questions/tagged/ibm-secrets-manager). Be sure to include the `ibm-cloud` and `ibm-secrets-manager` tags. You can also check out the [Secrets Manager documentation](https://cloud.ibm.com/docs/secrets-manager) and [API reference](https://cloud.ibm.com/apidocs/secrets-manager) for more information about the service.

## Issues

If you encounter an issue with this project, you're welcome to submit a [bug report](https://github.com/ibm-cloud-security/certificate-manager-to-secrets-manager/issues) to help us improve. Before you create a new issue, search for similar issues in case someone has already reported the same problem.

## License

This project is released under the Apache 2.0 license. The license's full text can be found in [LICENSE](LICENSE).

