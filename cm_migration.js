const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const iam_token_endpoint = 'cloud.ibm.com/identity/token';
const iam_token_grant_type = 'urn:ibm:params:oauth:grant-type:apikey';

const resource_plan_id = '/v2/resource_instances?resource_plan_id=14edb41b-ebd6-46b1-a39a-92df79906ca7';
const get_cert_list_endpoint = 'cloud.ibm.com/api/v3/';
const get_notification_endpoint = 'cloud.ibm.com/api/v1/instances/';

const get_cert_endpoint = 'cloud.ibm.com/api/v2/certificate/';
const secret_group_endpoint = 'appdomain.cloud/api/v1/secret_groups';
const create_secret_endpoint = 'appdomain.cloud/api/v1/secrets/imported_cert';

const order_cert_endpoint = 'appdomain.cloud/api/v1/secrets/public_cert';
const get_public_cert_endpoint = 'cloud.ibm.com/api/v1/certificate/';

module.exports = {"main": main, "parameters_validation": parameters_validation, "get_token": get_token, "add_cert_to_secret": add_cert_to_secret,
    "get_cert_data": get_cert_data, "catch_error": catch_error, "cm_inventory": cm_inventory, "get_cert_list": get_cert_list,
    "get_secret_group_id": get_secret_group_id, "create_secret": create_secret, "cm_instance_copy": cm_instance_copy,
    "get_instances_data": get_instances_data, "get_notification_number": get_notification_number,
    "order_certificate": order_certificate, "get_public_cert_data": get_public_cert_data};

async function main(parameters){
    let cm_apikey = process.env.CM_APIKEY;
    let script_name = process.env.SCRIPT_NAME;
    let sm_apikey = process.env.SM_APIKEY;
    let cm_crn = process.env.CM_INSTANCE_CRN;
    let sm_crn = process.env.SM_INSTANCE_CRN;
    let cert_id = process.env.CERTIFICATE_ID;
    let secret_group_name = process.env.SECRET_GROUP_NAME;
    let is_test_account = process.env.IS_TEST_ACCOUNT;
    let only_imported = process.env.ONLY_IMPORTED;
    let ca_configuration_name = process.env.CA_CONFIGURATION_NAME;
    let dns_configuration_name = process.env.DNS_PROVIDER_CONFIGURATION_NAME;
    let bundle_certs = process.env.BUNDLE_CERTS;

    if(parameters !== undefined){
        if (parameters.CM_APIKEY) cm_apikey = parameters.CM_APIKEY;
        if (parameters.SCRIPT_NAME) script_name = parameters.SCRIPT_NAME;
        if (parameters.SM_APIKEY) sm_apikey = parameters.SM_APIKEY;
        if (parameters.CM_INSTANCE_CRN) cm_crn = parameters.CM_INSTANCE_CRN;
        if (parameters.SM_INSTANCE_CRN) sm_crn = parameters.SM_INSTANCE_CRN;
        if (parameters.CERTIFICATE_ID) cert_id = parameters.CERTIFICATE_ID;
        if (parameters.SECRET_GROUP_NAME) secret_group_name = parameters.SECRET_GROUP_NAME;
        if (parameters.IS_TEST_ACCOUNT) is_test_account = parameters.IS_TEST_ACCOUNT;
        if (parameters.ONLY_IMPORTED) only_imported = parameters.ONLY_IMPORTED;
        if (parameters.CA_CONFIGURATION_NAME) ca_configuration_name = parameters.CA_CONFIGURATION_NAME;
        if (parameters.DNS_PROVIDER_CONFIGURATION_NAME) dns_configuration_name = parameters.DNS_PROVIDER_CONFIGURATION_NAME;
        if (parameters.BUNDLE_CERTS) bundle_certs = parameters.BUNDLE_CERTS;
    }

    if(is_test_account === undefined){
        is_test_account = false;
    }

    if(only_imported === undefined){
        only_imported = true;
    }

    if(bundle_certs === undefined){
        bundle_certs = true;
    }

    if(script_name === 'cm_inventory'){
        return await cm_inventory(cm_apikey, is_test_account);
    }
    else if(script_name === 'cm_cert_copy'){
        return await cm_cert_copy(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, only_imported);
    }
    else if(script_name === 'cm_instance_copy'){
        return await cm_instance_copy(cm_apikey, sm_apikey, cm_crn, sm_crn, secret_group_name, only_imported);
    }
    else if(script_name === 'sm_public_cert'){
        return await sm_public_cert(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, ca_configuration_name, dns_configuration_name, bundle_certs);
    }
    else if(script_name === 'sm_instance_public_cert'){
        return await sm_instance_public_cert(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, ca_configuration_name, dns_configuration_name, bundle_certs);
    }
    else{
        if(script_name === undefined){
            console.log(`Error: parameter SCRIPT_NAME is missing.`);
            return {"error" : {"error": `parameter SCRIPT_NAME is missing.`}}
        }
        console.log(`Error: ${script_name} isn't a valid script name.`);
        return {"error" : {"error": `'${script_name}' isn't a valid script name.`}}
    }
}

/////////// main functions ///////////

async function cm_inventory(apikey, is_test_account) {
    if(apikey === undefined){
        let err = new Error("Parameter 'CM_APIKEY' is missing");
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }

    let cm_api_prefix = '.';
    if(is_test_account === 'true' || is_test_account === true){
        cm_api_prefix = '.test.';
    }
    else if(is_test_account !== 'false' && is_test_account !== false){
        let err = new Error("Parameter 'IS_TEST_ACCOUNT' is invalid");
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
    try{
        const token = await get_token(apikey, cm_api_prefix, "CM");
        const instances_data = await get_instances_data(token, cm_api_prefix);
        return await build_dict(instances_data, token, cm_api_prefix);
    }
    catch (err){
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
}

async function cm_cert_copy(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, only_imported){
    try {
        const valid_arr = await parameters_validation(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, only_imported, "ONLY_IMPORTED");
        const cm_location = valid_arr[0];
        const sm_location = valid_arr[1];
        const sm_instance_id = valid_arr[2];
        const cm_api_prefix = valid_arr[3];
        const sm_api_prefix = valid_arr[4];
        only_imported = valid_arr[5];

        const cm_token = await get_token(cm_apikey, cm_api_prefix, "CM");
        const sm_token = await get_token(sm_apikey, sm_api_prefix, "SM");

        const cert_data = await get_cert_data(cm_crn, cm_location, cert_id, cm_token, cm_api_prefix);

        const response = await add_cert_to_secret(sm_crn, sm_instance_id, secret_group_name, cert_data, sm_location, sm_token, sm_api_prefix, only_imported);

        if(response){
            console.log("Certificate migrated successfully!");
            return { message: "Certificate migrated successfully!" };
        }
        else{
            throw new Error("Certificate: " + cert_id + " was not migrated since it's not an imported certificate. " +
                "If you wish to migrate it anyway, please change the value of the parameter 'ONLY_IMPORTED' to 'false'");
        }

    } catch (err) {
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
}

async function cm_instance_copy(cm_apikey, sm_apikey, cm_crn, sm_crn, secret_group_name, only_imported){
    try {
        const valid_arr = await parameters_validation(cm_apikey, sm_apikey, cm_crn, sm_crn, "", only_imported, "ONLY_IMPORTED");
        const cm_location = valid_arr[0];
        const sm_location = valid_arr[1];
        const sm_instance_id = valid_arr[2];
        const cm_api_prefix = valid_arr[3];
        const sm_api_prefix = valid_arr[4];
        only_imported = valid_arr[5];

        const cm_token = await get_token(cm_apikey, cm_api_prefix, "CM");
        const sm_token = await get_token(sm_apikey, sm_api_prefix, "SM");

        const cert_lst = await get_cert_list(false, cm_crn, cm_location, cm_api_prefix, cm_token, 200);

        let report_json = {};
        for(let i=0; i<cert_lst.length; i++){
            try{
                console.log("Processing certificate: '" + cert_lst[i].name + "', id: " + cert_lst[i].id);
                const cert_data = await get_cert_data(cm_crn, cm_location, cert_lst[i].id, cm_token, cm_api_prefix);
                const response = await add_cert_to_secret(sm_crn, sm_instance_id, secret_group_name, cert_data, sm_location, sm_token, sm_api_prefix, only_imported);
                if(response){
                    report_json["Certificate: '" + cert_lst[i].name + "', id: " + cert_lst[i].id] =  "migrated successfully!";
                }
                else{
                    throw new Error("Certificate: " + cert_lst[i].id + " was not migrated since it's not an imported certificate. " +
                        "If you wish to migrate it anyway, please change the value of the parameter 'ONLY_IMPORTED' to 'false'");
                }

            }
            catch(err){
                report_json["Certificate: '" + cert_lst[i].name + "', id: " + cert_lst[i].id] =  "migration failed: " + err.message;
            }
        }
        console.log(report_json);
        return report_json;

    } catch (err) {
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
}

async function sm_public_cert(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, ca_configuration_name, dns_configuration_name, bundle_certs){
    try{
        if(ca_configuration_name === undefined){
            let err = new Error("Parameter 'CA_CONFIGURATION_NAME' is missing");
            console.log(`Error: Certificate migration failed: ${err}`);
            return {"error" : {"error": `Certificate migration failed: ${err}`}};
        }
        if(dns_configuration_name === undefined){
            let err = new Error("Parameter 'DNS_PROVIDER_CONFIGURATION_NAME' is missing");
            console.log(`Error: Certificate migration failed: ${err}`);
            return {"error" : {"error": `Certificate migration failed: ${err}`}};
        }

        const valid_arr = await parameters_validation(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, bundle_certs, "BUNDLE_CERTS");
        const cm_location = valid_arr[0];
        const sm_location = valid_arr[1];
        const sm_instance_id = valid_arr[2];
        const cm_api_prefix = valid_arr[3];
        const sm_api_prefix = valid_arr[4];
        bundle_certs = valid_arr[5];

        const cm_token = await get_token(cm_apikey, cm_api_prefix, "CM");
        const sm_token = await get_token(sm_apikey, sm_api_prefix, "SM");

        const cert_data = await get_public_cert_data(cm_crn, cm_location, cert_id, cm_token, cm_api_prefix);

        if(cert_data.imported){
            throw new Error("The certificate you are trying to order is an imported certificate.")
        }

        let secret_group_id = secret_group_name;
        if(secret_group_name !== undefined){
            secret_group_id = await get_secret_group_id(sm_instance_id, secret_group_name, sm_location, sm_token, sm_api_prefix);
            if (secret_group_id instanceof Error){
                throw secret_group_id;
            }
        }

        let response = await order_certificate(sm_token, cert_data, sm_location, sm_instance_id, sm_api_prefix, secret_group_id, ca_configuration_name, dns_configuration_name, bundle_certs);
        let report_json = {}
        await verifySuccessfulOrders(report_json, [{"id": response.data.resources[0].id, "name": response.data.resources[0].name}], sm_instance_id, sm_location, sm_api_prefix, sm_token, true);

        console.log(report_json[`Certificate: '${response.data.resources[0].name}', id: ${response.data.resources[0].id}`]);
        return { message: report_json[`Certificate: '${response.data.resources[0].name}', id: ${response.data.resources[0].id}`] };

    }
    catch(err){
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
}

async function sm_instance_public_cert(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, secret_group_name, ca_configuration_name, dns_configuration_name, bundle_certs){
    try{
        if(ca_configuration_name === undefined){
            let err = new Error("Parameter 'CA_CONFIGURATION_NAME' is missing");
            console.log(`Error: Certificate migration failed: ${err}`);
            return {"error" : {"error": `Certificate migration failed: ${err}`}};
        }
        if(dns_configuration_name === undefined){
            let err = new Error("Parameter 'DNS_PROVIDER_CONFIGURATION_NAME' is missing");
            console.log(`Error: Certificate migration failed: ${err}`);
            return {"error" : {"error": `Certificate migration failed: ${err}`}};
        }

        const valid_arr = await parameters_validation(cm_apikey, sm_apikey, cm_crn, sm_crn, "", bundle_certs, "BUNDLE_CERTS");
        const cm_location = valid_arr[0];
        const sm_location = valid_arr[1];
        const sm_instance_id = valid_arr[2];
        const cm_api_prefix = valid_arr[3];
        const sm_api_prefix = valid_arr[4];
        bundle_certs = valid_arr[5];

        const cm_token = await get_token(cm_apikey, cm_api_prefix, "CM");
        const sm_token = await get_token(sm_apikey, sm_api_prefix, "SM");

        let secret_group_id = secret_group_name;
        if(secret_group_name !== undefined){
            secret_group_id = await get_secret_group_id(sm_instance_id, secret_group_name, sm_location, sm_token, sm_api_prefix);
            if (secret_group_id instanceof Error){
                throw secret_group_id;
            }
        }

        const cert_lst = await get_cert_list(false, cm_crn, cm_location, cm_api_prefix, cm_token, 200);

        let report_json = {};
        let ordered_certs_list = [];
        for(let i=0; i<cert_lst.length; i++){
            if(!cert_lst[i].imported){
                try {
                    console.log(`Processing certificate: '${cert_lst[i].name}', id: ${cert_lst[i].id}`);
                    const cert_data = await get_public_cert_data(cm_crn, cm_location, cert_lst[i].id, cm_token, cm_api_prefix);
                    let response = await order_certificate(sm_token, cert_data, sm_location, sm_instance_id, sm_api_prefix, secret_group_id, ca_configuration_name, dns_configuration_name, bundle_certs);
                    ordered_certs_list.push({"id": response.data.resources[0].id, "name": response.data.resources[0].name});

                    if (ordered_certs_list.length === 50){
                        await verifySuccessfulOrders(report_json, ordered_certs_list, sm_instance_id, sm_location, sm_api_prefix, sm_token, false);
                    }
                } catch (error) {
                    report_json[`Certificate: '${cert_lst[i].name}', id: ${cert_lst[i].id}`] =  `migration failed: ${error.message}`;
                }
            }
        }
        await verifySuccessfulOrders(report_json, ordered_certs_list, sm_instance_id, sm_location, sm_api_prefix, sm_token, true);
        console.log(report_json);
        return report_json;

    }
    catch(err){
        console.log(`Error: Certificate migration failed: ${err}`);
        return {"error" : {"error": `Certificate migration failed: ${err}`}};
    }
}

/////////// get_token, catch_error, parameter_validation ///////////

async function get_token(api_key, prefix, service){

    try{
        const response =  await axios.post('https://iam' + prefix + iam_token_endpoint, querystring.stringify({grant_type: iam_token_grant_type,
            apikey: api_key}));
        return response.data.access_token;

    } catch (err){
        let errMsg = "Something went wrong - please try again.";
        if(err !== undefined) {
            if(err.response === undefined){
                errMsg = errMsg + " Error: " + err;
            }
            else{
                if(400 <= err.response.status && err.response.status < 500){
                    errMsg = service + "_APIKEY error: Error code " + err.response.status + ": " +
                        err.response.data.errorMessage + ". Error in request: " + err.config.url;
                }
                else if(500 <= err.response.status){
                    errMsg = service + "_APIKEY error: Error code " + err.response.status + ": " + errMsg;
                }
            }
        }
        throw new Error(errMsg);
    }
}

function catch_error(err, format){
    let errMsg = "Something went wrong - please try again.";

    if(err !== undefined){
        if(err.response === undefined){
            errMsg = errMsg + " Error: " + err;
        }
        else{
            if(format === 1){
                if(400 <= err.response.status && err.response.status < 500){
                    errMsg = "Error code " + err.response.status + ": " + err.response.data.message + " (code: " + err.response.data.code + "). Error in request: " + err.config.url;
                }
                else if(500<= err.response.status){
                    errMsg = "Error code " + err.response.status + ": " + errMsg;
                }
            }
            else if (format === 2){
                if(400 <= err.response.status && err.response.status < 500){
                    errMsg = "Error code " + err.response.status + ": " + err.response.data.resources[0].error_message + ". Error in request: " + err.config.url;
                }
                else if(500<= err.response.status){
                    errMsg = "Error code " + err.response.status + ": " + errMsg;
                }
            }
        }
    }
    if(errMsg) {
        throw new Error(errMsg);
    }
    throw err;

}

function parameters_validation(cm_apikey, sm_apikey, cm_crn, sm_crn, cert_id, boolean_var, boolean_var_name){
    let cm_data = crn_validation(cm_crn, "CM");
    let errMsg = cm_data[0];

    let sm_data = crn_validation(sm_crn, "SM");
    if(sm_data[0]){
        errMsg = sm_data[0];
    }
    if(cert_id == null){
        errMsg = "Parameter 'CERTIFICATE_ID' is missing";
    }
    else if(cert_id.includes(":")){
        errMsg = "The parameter 'CERTIFICATE_ID' is invalid. Please make sure you entered " +
            "only the UUID part of the certificate's CRN ( ...:certificate:UUID)"
    }

    if(cm_apikey == null){
        errMsg = "Parameter 'CM_APIKEY' is missing";
    }

    if(sm_apikey == null){
        errMsg = "Parameter 'SM_APIKEY' is missing";
    }

    if(!(typeof boolean_var === 'boolean')){
        if(boolean_var === 'true'){
            boolean_var = true;
        }

        else if(boolean_var === 'false'){
            boolean_var = false;
        }

        else{
            errMsg = "Parameter '" + boolean_var_name + "' is invalid";
        }
    }

    if(errMsg) {
        throw new Error(errMsg);
    }
    return [cm_data[1], sm_data[1], sm_data[3], cm_data[2], sm_data[2], boolean_var];
}

function crn_validation(crn, cm_or_sm){
    let errMsg;
    let location = null;
    let prefix = null;
    let sm_instance_id = null;

    if(crn != null){
        if(cm_or_sm === 'SM'){
            sm_instance_id = crn.split(":")[7];
            if(sm_instance_id == null){
                errMsg = "Parameter 'SM_INSTANCE_CRN' is invalid - SM instance ID is missing";
            }
        }
        location = crn.split(":")[5];
        if(location == null){
            errMsg = "Parameter '" + cm_or_sm + "_INSTANCE_CRN' is invalid - region is missing";
        }
        if (crn.split(":")[2] === 'bluemix'){
            prefix = '.';
        }
        else if(crn.split(":")[2] === 'staging'){
            prefix = '.test.'
        }
        else{
            errMsg = "Parameter '" + cm_or_sm + "_INSTANCE_CRN' is invalid";
        }
    }
    else{
        errMsg = "Parameter '" + cm_or_sm + "_INSTANCE_CRN' is missing";
    }

    return [errMsg, location, prefix, sm_instance_id];
}

/////////// cm_inventory functions ///////////

async function get_instances_data(token, cm_api_prefix){
    try{
        let main_url = 'https://resource-controller' + cm_api_prefix + "cloud.ibm.com";

        let response = await axios.get(main_url + resource_plan_id , {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        let next_url = response.data.next_url;
        let resources = response.data.resources;
        while(next_url != null){
            response = await axios.get(main_url + next_url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            next_url = response.data.next_url;
            resources = resources.concat(response.data.resources);
        }
        return resources;

    }
    catch(err){
        catch_error(err, 1);
    }
}

async function build_dict(instances_data, token, cm_api_prefix){
    let dict = {};

    let crn_lst = [];
    let cert_lst_promises = [];
    let notification_promises = [];

    let complete_cnt = 0;

    for (let i=0; i<instances_data.length; i++){
        let current_instance = instances_data[i];
        dict[current_instance.crn] = {};
        dict[current_instance.crn]["region"] = current_instance.region_id;
        dict[current_instance.crn]["resource_group_id"] = current_instance.resource_group_id;
        dict[current_instance.crn]["name"] = current_instance.name;
        dict[current_instance.crn]["crn"] = current_instance.crn;
        dict[current_instance.crn]["is_private_only"] = false;
        dict[current_instance.crn]['BYOK'] = {kms_info: 'none', tek_id: 'none'};

        if("parameters" in current_instance){
            dict[current_instance.crn]['BYOK'] = {kms_info: current_instance.parameters.kms_info, tek_id: current_instance.parameters.tek_id};
            if("allowed_network" in current_instance.parameters){
                if (current_instance.parameters.allowed_network === 'private-only'){
                    dict[current_instance.crn]["is_private_only"] = true;
                }
            }
        }

        if(!dict[current_instance.crn]["is_private_only"]){
            crn_lst.push(current_instance.crn);

            let crn_enc = encodeURIComponent(current_instance.crn);

            cert_lst_promises.push(get_cert_list(true, current_instance.crn, current_instance.region_id, cm_api_prefix, token, 200)); //won't work for private-only
            notification_promises.push(get_notification_number(current_instance.region_id, crn_enc, cm_api_prefix, token)); //won't work for private-only

        }
        else{
            complete_cnt++;
            console.log((complete_cnt) + "/" + instances_data.length + " instances completed");
        }

    }
    let all_promises = cert_lst_promises.concat(notification_promises);
    await Promise.all(all_promises).then((values) => {
        for(let j=0; j<crn_lst.length; j++){
            let err_cnt = 0;
            let current_crn = crn_lst[j];

            if(values[j] instanceof Error){
                try{
                    catch_error(values[j], 1);
                }
                catch(err){
                    console.log("Certificate Manager inventory failed processing instance: '" + dict[current_crn].name + "', crn: '" + current_crn + "'. Error getting certificates list: " + err);
                    dict[current_crn] = { error: "Certificate Manager inventory failed processing instance: '" + dict[current_crn].name + "', crn: '" + current_crn + "'. Error getting certificates list: " + err};
                    err_cnt++;
                }

            }
            if(err_cnt === 0){
                if(values[j+crn_lst.length] instanceof Error){
                    try{
                        catch_error(values[j+crn_lst.length], 1);
                    }
                    catch(err){
                        console.log("Certificate Manager inventory failed processing instance: '" + dict[current_crn].name + "', crn: '" + current_crn + "'. Error getting notifications channels: " + err);
                        dict[current_crn] = { error: "Certificate Manager inventory failed processing instance: '" + dict[current_crn].name + "', crn: '" + current_crn + "'. Error getting notifications channels: " + err};
                        err_cnt++;
                    }
                }
                if(err_cnt === 0){
                    dict[current_crn]["managed_certs_count"] = values[j].length; //won't work for private-only
                    dict[current_crn]['notification_channels_count'] = values[(j+crn_lst.length)]; //won't work for private-only
                    dict[current_crn]["list_certs_ids"] =  values[j]; //won't work for private-only
                    console.log((j+complete_cnt+1) + "/" + instances_data.length + " instances completed");
                }
            }
        }

    });

    console.log(dict);
    return dict;
}

async function get_notification_number(location, crn_enc, cm_api_prefix, token){
    try{
        let response = await axios.get('https://' + location + '.certificate-manager'  + cm_api_prefix +
            get_notification_endpoint + crn_enc + '/notifications/channels', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        return response.data.length;
    }
    catch(err){
        return err;
    }
}

/////////// cm_cert_copy functions ///////////

async function add_cert_to_secret(sm_crn, sm_instance_id, secret_group_name, cert_data, sm_location, sm_token, sm_api_prefix, only_imported){
    let name = cert_data.name;
    const description = cert_data.description;
    const private_key = cert_data.data.priv_key;
    const intermediate = cert_data.data.intermediate;
    const certificate_content = cert_data.data.content;
    const is_imported = cert_data.imported;
    let secret_group_id = secret_group_name;

    if(name.charAt(0) === '*'){
        name="star"+name.substring(1);
    }

    if(!is_imported && only_imported){
        return false;
    }

    else{
        if(secret_group_name !== undefined){
            secret_group_id = await get_secret_group_id(sm_instance_id, secret_group_name, sm_location, sm_token, sm_api_prefix);
            if (secret_group_id instanceof Error){
                throw secret_group_id;
            }
        }

        await create_secret(sm_token, sm_instance_id, sm_location, sm_api_prefix, name, description, secret_group_id, certificate_content, private_key, intermediate);
        return true;
    }


}

async function create_secret(sm_token, sm_instance_id, sm_location, sm_api_perfix, name, description, secret_group_id, certificate_content, private_key, intermediate){

    const req_data = {
        "metadata": {
            "collection_type": "application/vnd.ibm.secrets-manager.secret+json",
            "collection_total": 1
        },
        "resources": [
            {
                "description": description,
                "private_key": private_key,
                "secret_group_id": secret_group_id,
                "intermediate": intermediate,
                "certificate": certificate_content,
            }
        ]
    };

    // Secrets Manager does not support secret name with spaces. Replace with dashes
    if(name !== undefined){
        name = name.replace(/\s+/g, '-');
        req_data.resources[0].name = name;
    }
    if(description !== undefined && description.trim() === "") {
        req_data.resources[0].description = undefined;
    }
    try{
        return await axios.post('https://' + sm_instance_id + '.' + sm_location + '.secrets-manager' + sm_api_perfix + create_secret_endpoint, req_data,{
            headers: {
                'Authorization': 'Bearer ' + sm_token,
                'Content-Type': 'application/json'
            }
        });
    }
    catch(err){
        catch_error(err, 2);
    }
}

async function get_secret_group_id(sm_instance_id, secret_group_name, location, sm_token, sm_api_prefix) {
    try {
        const response = await axios.get('https://' + sm_instance_id + '.' + location + '.secrets-manager' + sm_api_prefix + secret_group_endpoint, {
            headers: {
                'Authorization': 'Bearer ' + sm_token
            }
        });
        for (let i = 0; i < response.data.metadata.collection_total; i++) {
            if (response.data.resources[i].name === secret_group_name) {
                return response.data.resources[i].id;
            }
        }
        throw new Error("Secret group name doesn't exist");
    } catch (err) {
        if (err.message === "Secret group name doesn't exist") {
            return err;
        }
        if (400 <= err.response.status && err.response.status < 500) {
            err.response.data.resources[0].error_message = "Error with secret group name: " + err.response.data.resources[0].error_message;
        }
        catch_error(err, 2);
    }
}

async function get_cert_data(cm_crn, location, cert_id, cm_token, cm_api_prefix){
    const crn_enc = encodeURIComponent((cm_crn.slice(0, -1) + 'certificate:' + cert_id));
    try{
        const data = await axios.get('https://' + location + '.certificate-manager' + cm_api_prefix + get_cert_endpoint + crn_enc , {
            headers: {
                'Authorization': 'Bearer ' + cm_token
            }
        });
        return data.data;
    }
    catch(err){
        catch_error(err, 1);
    }
}

/////////// cm_instance_copy functions ///////////

async function get_cert_list(inventory_or_instanceCopy, cm_crn, cm_location, cm_api_prefix, cm_token, page_size){
    let cert_id_lst = [];
    const crn_enc = encodeURIComponent(cm_crn);

    try{
        let cert_list_data = await get_cert_list_call(inventory_or_instanceCopy, cm_token, cm_location, cm_api_prefix, crn_enc, 0, page_size, null, null);

        cert_id_lst = cert_list_data[0];
        let doc_id = cert_list_data[1];
        let start_orderby = cert_list_data[2];
        let page_number = cert_list_data[3];

        while(doc_id.length !== 0 && start_orderby.length !== 0){
            cert_list_data = await get_cert_list_call(inventory_or_instanceCopy, cm_token, cm_location, cm_api_prefix, crn_enc, page_number, page_size, doc_id, start_orderby);

            cert_id_lst = cert_id_lst.concat(cert_list_data[0]);
            doc_id = cert_list_data[1];
            start_orderby = cert_list_data[2];
            page_number = cert_list_data[3];
        }

        return cert_id_lst;
    }
    catch (err){
        if(inventory_or_instanceCopy){
            return err;
        }
        catch_error(err, 1);
    }
}

async function get_cert_list_call(inventory_or_instanceCopy, cm_token, cm_location, cm_api_prefix, crn_enc, page_number, page_size, doc_id, start_orderby){
    let cert_id_lst = [];

    let url = 'https://' + cm_location + '.certificate-manager' + cm_api_prefix + get_cert_list_endpoint + crn_enc + '/certificates?order=expires_on&page_number=' + page_number + '&page_size=' + page_size;
    if(doc_id != null && start_orderby != null){
        url += '&start_from_document_id=' + doc_id + '&start_from_orderby_value=' + start_orderby;
    }

    let response = await axios.get(url, {
        headers: {
            'Authorization': 'Bearer ' + cm_token
        }
    });

    for(let i=0; i<response.data.totalScannedDocs; i++){
        if(inventory_or_instanceCopy){
            cert_id_lst.push(response.data.certificates[i]._id);
        }
        else{
            cert_id_lst.push({"id" :response.data.certificates[i]._id.split(":")[9], "name": response.data.certificates[i].name, "imported": response.data.certificates[i].imported});
        }
    }

    doc_id = response.data.nextPageInfo.startWithDocId;
    start_orderby = response.data.nextPageInfo.startWithOrderByValue;

    return [cert_id_lst, doc_id, start_orderby, page_number+1];

}


/////////// sm_order_cert functions ///////////

async function get_public_cert_data(cm_crn, location, cert_id, cm_token, cm_api_prefix){
    const crn_enc = encodeURIComponent((cm_crn.slice(0, -1) + 'certificate:' + cert_id));
    try{
        const data = await axios.get('https://' + location + '.certificate-manager' + cm_api_prefix + get_public_cert_endpoint + crn_enc + '/metadata' , {
            headers: {
                'Authorization': 'Bearer ' + cm_token
            }
        });
        return data.data;
    }
    catch(err){
        catch_error(err, 1);
    }
}

async function order_certificate(sm_token, cert_data, sm_location, sm_instance_id, sm_api_prefix, secret_group_id, ca_configuration_name, dns_configuration_name, bundle_certs){
    try{
        let key_algorithm = cert_data.key_algorithm;
        if(key_algorithm === 'rsaEncryption 2048 bit'){
            key_algorithm = 'RSA2048';
        }
        else if(key_algorithm === 'rsaEncryption 4096 bit'){
            key_algorithm = 'RSA4096';
        }
        else{
            throw new Error("Key algorithm is invalid");
        }

        let domains = cert_data.domains;
        const common_name = domains.shift();

        let rotation = {
            "auto_rotate": cert_data.order_policy.auto_renew_enabled,
            "rotate_keys": false
        };

        const req_data = {
            "metadata": {
                "collection_type": "application/vnd.ibm.secrets-manager.secret+json",
                "collection_total": 1
            },
            "resources": [
                {
                    "description": cert_data.description,
                    "secret_group_id": secret_group_id,
                    "ca": ca_configuration_name,
                    "dns": dns_configuration_name,
                    "common_name": common_name,
                    "alt_names": domains,
                    "bundle_certs": bundle_certs,
                    "key_algorithm": key_algorithm,
                    "rotation": rotation
                }
            ]};

        // Secrets Manager does not support secret name with spaces. Replace with dashes
        if(cert_data.name !== undefined){
            req_data.resources[0].name = cert_data.name.replace(/\s+/g, '-');
        }
        if(cert_data.description !== undefined && cert_data.description.trim() === "") {
            req_data.resources[0].description = undefined;
        }

        return await axios.post('https://' + sm_instance_id + '.' + sm_location + '.secrets-manager' + sm_api_prefix +
            order_cert_endpoint, req_data, {
            headers: {
                'Authorization': 'Bearer ' + sm_token,
                'Content-Type': 'application/json'
            }
        });

    }
    catch(err){
        catch_error(err, 2);
    }
}

async function getSecretState(sm_instance_id, sm_location, sm_api_prefix, secret_type, secret_id, sm_token) {
    let error = `Secret couldn't reach the expected state.`;
    const response = await axios.get(`https://${sm_instance_id}.${sm_location}.secrets-manager${sm_api_prefix}appdomain.cloud/api/v1/secrets/${secret_type}/${secret_id}/metadata`, {
        headers: {
            'Authorization': 'Bearer ' + sm_token,
            'Content-Type': 'application/json'
        }
    });
    if (response.status === 200) {
        let current_secret = response.data.resources[0];
        if (current_secret.state_description === "Active") {
            return;
        } else if (current_secret.state_description === "Pre-activation") {
            error = "Pre-activation";
        } else {
            if (current_secret.issuance_info) {
                error = `${current_secret.issuance_info.error_message}. 
                        Error code: ${current_secret.issuance_info.error_code}`
            }
        }
    }
    return error;
}

async function wait(msc){
    return new Promise((resolve) => {
        setTimeout(resolve, msc);
    })
}

async function verifySuccessfulOrders(report_json, ordered_certs_list, sm_instance_id, sm_location, sm_api_prefix, sm_token, last_run, maximum_retries = 30, interval_wait_time = 5000) {
    let maximum_certs_list_length = ordered_certs_list.length;
    let tries = 0;

    while (tries < maximum_retries) {
        for (let i=0; i<ordered_certs_list.length; i++){
            let response = await getSecretState(sm_instance_id, sm_location, sm_api_prefix, "public_cert", ordered_certs_list[i].id, sm_token)
            if (!response) {
                report_json[`Certificate: '${ordered_certs_list[i].name}', id: ${ordered_certs_list[i].id}`] =  "Certificate ordered successfully!";
                ordered_certs_list.splice(i, 1);
                i--;
            } else{
                if (response !== "Pre-activation"){
                    report_json[`Certificate: '${ordered_certs_list[i].name}', id: ${ordered_certs_list[i].id}`] =  `migration failed: ${response}`;
                    ordered_certs_list.splice(i, 1);
                    i--;
                }
            }
        }
        if (ordered_certs_list.length > 0 && (ordered_certs_list.length === maximum_certs_list_length || last_run)){
            await wait(interval_wait_time);
            tries++;
        } else {
            break;
        }
    }
    if (tries === maximum_retries) {
        for (let i=0; i<ordered_certs_list.length; i++){
            report_json[`Certificate: '${ordered_certs_list[i].name}', id: ${ordered_certs_list[i].id}`] =  `migration failed: Secret couldn't reach the expected state.`;
            ordered_certs_list.splice(i, 1);
            i--;
        }
    }

}

