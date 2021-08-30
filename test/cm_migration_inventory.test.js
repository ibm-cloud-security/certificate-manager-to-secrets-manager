const main_func = require('../cm_migration');
const nock = require('nock');

let save_env;

beforeAll(() => {
    save_env = {
        "script_name": process.env.SCRIPT_NAME,
        "cm_apikey": process.env.CM_APIKEY,
        "is_test_account": process.env.IS_TEST_ACCOUNT
    };

    delete process.env.SCRIPT_NAME;
    delete process.env.CM_APIKEY;
    delete process.env.IS_TEST_ACCOUNT;

});

afterAll(() => {
    process.env.SCRIPT_NAME = save_env.script_name;
    process.env.CM_APIKEY = save_env.cm_apikey;
    process.env.IS_TEST_ACCOUNT = save_env.is_test_account;
});

const parameters = {
    "SCRIPT_NAME": "cm_inventory",
    "CM_APIKEY": "cm_apikey",
    "IS_TEST_ACCOUNT": 'false'
};

const iam_bluemix_url = 'https://iam.cloud.ibm.com';
const iam_staging_url = 'https://iam.test.cloud.ibm.com';
const iam_endpoint = '/identity/token';
const iam_grant_type_cm = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey';

const iam_grant_type_cm_invalid_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_400';
const iam_grant_type_cm_invalid_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_500';

const resource_controller_url = 'https://resource-controller.cloud.ibm.com';
const iam_grant_type_cm_resource_controller_valid = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_valid';
const iam_grant_type_resource_controller_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_400';
const iam_grant_type_resource_controller_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_500';

const resource_controller_endpoint = '/v2/resource_instances?resource_plan_id=14edb41b-ebd6-46b1-a39a-92df79906ca7';

const resource_controller_url_test = 'https://resource-controller.test.cloud.ibm.com';
const iam_grant_type_cm_resource_controller_valid_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_valid_test';
const iam_grant_type_resource_controller_400_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_400_test';
const iam_grant_type_resource_controller_500_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_resource_controller_500_test';

const get_cert_list_url = 'https://eu-gb.certificate-manager.cloud.ibm.com';

const get_cert_list_paging_0 = '/api/v3/crn/certificates?order=expires_on&page_number=0&page_size=2';
const get_cert_list_paging_1 = '/api/v3/crn/certificates?order=expires_on&page_number=1&page_size=2&start_from_document_id=1&start_from_orderby_value=3';
const get_cert_list_paging_2 = '/api/v3/crn/certificates?order=expires_on&page_number=2&page_size=2&start_from_document_id=2&start_from_orderby_value=5';

const get_cert_list_url_test = 'https://eu-gb.certificate-manager.test.cloud.ibm.com';

const iam_grant_type_get_cert_list_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_get_cert_list_400';
const iam_grant_type_get_cert_list_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_get_cert_list_500';
const get_cert_list_main_endpoint_crn1 = '/api/v3/crn1%3A1%3Abluemix%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200';
const get_cert_list_main_endpoint_crn3 = '/api/v3/crn3%3A1%3Abluemix%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200';

const iam_grant_type_get_cert_list_400_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_get_cert_list_400_test';
const iam_grant_type_get_cert_list_500_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_get_cert_list_500_test';
const get_cert_list_main_endpoint_crn1_test = '/api/v3/crn1%3A1%3Astaging%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200';
const get_cert_list_main_endpoint_crn3_test = '/api/v3/crn3%3A1%3Astaging%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200';

const get_notification_number_url = 'https://eu-gb.certificate-manager.cloud.ibm.com';
const get_notification_number_main_endpoint_crn1 = '/api/v1/instances/crn1%3A1%3Abluemix%3A3%3A4%3Aeu-gb/notifications/channels';
const get_notification_number_main_endpoint_crn3 = '/api/v1/instances/crn3%3A1%3Abluemix%3A3%3A4%3Aeu-gb/notifications/channels';

const get_notification_number_valid_endpoint = '/api/v1/instances/crn_enc/notifications/channels';

const get_notification_number_url_test = 'https://eu-gb.certificate-manager.test.cloud.ibm.com';
const get_notification_number_main_endpoint_crn1_test = '/api/v1/instances/crn1%3A1%3Astaging%3A3%3A4%3Aeu-gb/notifications/channels';
const get_notification_number_main_endpoint_crn3_test = '/api/v1/instances/crn3%3A1%3Astaging%3A3%3A4%3Aeu-gb/notifications/channels';

const iam_grant_type_valid = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_valid';
const iam_grant_type_valid_test = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_valid_test';

let resource_controller_valid_response_body = {
    "rows_count": 3,
    "next_url": null,
    "resources": [{
        "crn": "crn1:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group2",
        "name": "instance_name1",
        "parameters": {
            "kms_info": "kms_info 1",
            "tek_id": "tek_id 1",
            "allowed_network": "not private"
        }
    }, {
        "crn": "crn2:1:bluemix:3:4:us-south",
        "region_id": "us-south",
        "resource_group_id": "Group1",
        "name": "instance_name2",
        "parameters": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
            "allowed_network": "private-only"
        }
    }, {
        "crn": "crn3:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group3",
        "name": "instance_name3"
    }]
};

let resource_controller_valid_response_body_pagination_0 = {
    "rows_count": 3,
    "next_url": "/?start=pagination_0",
    "resources": [{
        "crn": "crn1:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group2",
        "name": "instance_name1",
        "parameters": {
            "kms_info": "kms_info 1",
            "tek_id": "tek_id 1",
            "allowed_network": "not private"
        }
    }, {
        "crn": "crn2:1:bluemix:3:4:us-south",
        "region_id": "us-south",
        "resource_group_id": "Group1",
        "name": "instance_name2",
        "parameters": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
            "allowed_network": "private-only"
        }
    }, {
        "crn": "crn3:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group3",
        "name": "instance_name3"
    }]
};

let resource_controller_valid_response_body_pagination_1 = {
    "rows_count": 2,
    "next_url": "/?start=pagination_1",
    "resources": [{
        "crn": "crn4:4:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group2",
        "name": "instance_name4",
        "parameters": {
            "kms_info": "kms_info 4",
            "tek_id": "tek_id 4",
            "allowed_network": "not private"
        }
    }, {
        "crn": "crn5:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group3",
        "name": "instance_name5"
    }]
};

let resource_controller_valid_response_body_pagination_2 = {
    "rows_count": 1,
    "next_url": null,
    "resources": [{
        "crn": "crn6:1:bluemix:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group3",
        "name": "instance_name6"
    }]
};

let build_dict_error_400_body = {
    "crn1:1:bluemix:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name1', " +
            "crn: 'crn1:1:bluemix:3:4:eu-gb'. Error getting certificates list: Error: Error code 400: Error message 400" +
            " (code: code of 400). Error in request: " +
            "https://eu-gb.certificate-manager.cloud.ibm.com/api/v3/crn1%3A1%3Abluemix%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200",
    },
    "crn2:1:bluemix:3:4:us-south":{
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:bluemix:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn3:1:bluemix:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name3', " +
            "crn: 'crn3:1:bluemix:3:4:eu-gb'. Error getting notifications channels: Error: Error code 400: Error message 400" +
            " (code: code of 400). Error in request: " +
            "https://eu-gb.certificate-manager.cloud.ibm.com/api/v1/instances/crn3%3A1%3Abluemix%3A3%3A4%3Aeu-gb/notifications/channels",
    },
};

let build_dict_error_500_body = {
    "crn3:1:bluemix:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name3', " +
            "crn: 'crn3:1:bluemix:3:4:eu-gb'. Error getting certificates list: Error: Error code 500: " +
            "Something went wrong - please try again."
    },
    "crn2:1:bluemix:3:4:us-south":{
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:bluemix:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn1:1:bluemix:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name1', " +
            "crn: 'crn1:1:bluemix:3:4:eu-gb'. Error getting notifications channels: Error: Error code 500: " +
            "Something went wrong - please try again."
    },
};

let valid_main_response = {
    "crn1:1:bluemix:3:4:eu-gb": {
        "BYOK":{
            "kms_info": "kms_info 1",
            "tek_id": "tek_id 1",
        },
        "crn": "crn1:1:bluemix:3:4:eu-gb",
        "is_private_only": false,
        "list_certs_ids":[
            "crn1:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
        ],
        "managed_certs_count": 1,
        "name": "instance_name1",
        "notification_channels_count": 2,
        "region": "eu-gb",
        "resource_group_id": "Group2",
    },
    "crn2:1:bluemix:3:4:us-south": {
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:bluemix:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn3:1:bluemix:3:4:eu-gb": {
        "BYOK": {
            "kms_info": "none",
            "tek_id": "none",
        },
        "crn": "crn3:1:bluemix:3:4:eu-gb",
        "is_private_only": false,
        "list_certs_ids": [
            "crn3:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "crn3:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
        ],
        "managed_certs_count": 2,
        "name": "instance_name3",
        "notification_channels_count": 2,
        "region": "eu-gb",
        "resource_group_id": "Group3",
    },
};

let valid_notification_response = [
    {
        id: 'notification id 1',
        type: 'url',
        endpoint: 'notification endpoint 1',
        is_active: false,
        version: 4
    },
    {
        id: 'notification id 2',
        type: 'url',
        endpoint: 'notification endpoint 2',
        is_active: true,
        version: 4
    }
];

///

let resource_controller_valid_response_body_test = {
    "rows_count": 3,
    "resources": [{
        "crn": "crn1:1:staging:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group2",
        "name": "instance_name1 staging",
        "parameters": {
            "kms_info": "kms_info 1",
            "tek_id": "tek_id 1",
            "allowed_network": "not private"
        }
    }, {
        "crn": "crn2:1:staging:3:4:us-south",
        "region_id": "us-south",
        "resource_group_id": "Group1",
        "name": "instance_name2 staging",
        "parameters": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
            "allowed_network": "private-only"
        }
    }, {
        "crn": "crn3:1:staging:3:4:eu-gb",
        "region_id": "eu-gb",
        "resource_group_id": "Group3",
        "name": "instance_name3 staging"
    }]
};

let build_dict_error_400_body_test = {
    "crn1:1:staging:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name1 staging', " +
            "crn: 'crn1:1:staging:3:4:eu-gb'. Error getting certificates list: Error: Error code 400: Error message 400" +
            " (code: code of 400). Error in request: " +
            "https://eu-gb.certificate-manager.test.cloud.ibm.com/api/v3/crn1%3A1%3Astaging%3A3%3A4%3Aeu-gb/certificates?order=expires_on&page_number=0&page_size=200",
    },
    "crn2:1:staging:3:4:us-south":{
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:staging:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2 staging",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn3:1:staging:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name3 staging', " +
            "crn: 'crn3:1:staging:3:4:eu-gb'. Error getting notifications channels: Error: Error code 400: Error message 400" +
            " (code: code of 400). Error in request: " +
            "https://eu-gb.certificate-manager.test.cloud.ibm.com/api/v1/instances/crn3%3A1%3Astaging%3A3%3A4%3Aeu-gb/notifications/channels",
    },
};

let build_dict_error_500_body_test = {
    "crn3:1:staging:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name3 staging', " +
            "crn: 'crn3:1:staging:3:4:eu-gb'. Error getting certificates list: Error: Error code 500: " +
            "Something went wrong - please try again."
    },
    "crn2:1:staging:3:4:us-south":{
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:staging:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2 staging",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn1:1:staging:3:4:eu-gb":{
        "error": "Certificate Manager inventory failed processing instance: 'instance_name1 staging', " +
            "crn: 'crn1:1:staging:3:4:eu-gb'. Error getting notifications channels: Error: Error code 500: " +
            "Something went wrong - please try again."
    },
};

let valid_main_response_test = {
    "crn1:1:staging:3:4:eu-gb": {
        "BYOK":{
            "kms_info": "kms_info 1",
            "tek_id": "tek_id 1",
        },
        "crn": "crn1:1:staging:3:4:eu-gb",
        "is_private_only": false,
        "list_certs_ids":[
            "crn1:v1:staging:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
        ],
        "managed_certs_count": 1,
        "name": "instance_name1 staging",
        "notification_channels_count": 2,
        "region": "eu-gb",
        "resource_group_id": "Group2",
    },
    "crn2:1:staging:3:4:us-south": {
        "BYOK": {
            "kms_info": "kms_info 2",
            "tek_id": "tek_id 2",
        },
        "crn": "crn2:1:staging:3:4:us-south",
        "is_private_only": true,
        "name": "instance_name2 staging",
        "region": "us-south",
        "resource_group_id": "Group1",
    },
    "crn3:1:staging:3:4:eu-gb": {
        "BYOK": {
            "kms_info": "none",
            "tek_id": "none",
        },
        "crn": "crn3:1:staging:3:4:eu-gb",
        "is_private_only": false,
        "list_certs_ids": [
            "crn3:v1:staging:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "crn3:v1:staging:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
        ],
        "managed_certs_count": 2,
        "name": "instance_name3 staging",
        "notification_channels_count": 2,
        "region": "eu-gb",
        "resource_group_id": "Group3",
    },
};

/////////////////////// IAM token (get_token) tests ///////////////////////

const iam_nock_bluemix_cm = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm)
    .reply(200,{
        "access_token": "bluemix_token"
    });

const iam_nock_staging_cm = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm)
    .reply(200,{
        "access_token": "staging_token"
    });

const iam_nock_bluemix_invalid_400 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_400)
    .reply(400, {"errorMessage": "Error message 400"});

const iam_nock_staging_invalid_400 = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_400)
    .reply(400, {"errorMessage": "Error message 400"});

const iam_nock_bluemix_invalid_500 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_500)
    .reply(500, {});

const iam_nock_staging_invalid_500 = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_500)
    .reply(500, {});

describe('IAM Token tests', () => {

    test('get token test - bluemix CM - invalid API key 400', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: CM_APIKEY error: " +
                    "Error code 400: Error message 400. Error in request: https://iam.cloud.ibm.com/identity/token"}});
    });

    test('get token test - staging CM - invalid API key 400', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_400";
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: CM_APIKEY error: " +
                    "Error code 400: Error message 400. Error in request: https://iam.test.cloud.ibm.com/identity/token"}});
    });


    test('get token test - bluemix CM - invalid API key 500', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "CM_APIKEY error: Error code 500: Something went wrong - please try again."}});
    });

    test('get token test - staging CM - invalid API key 500', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_500";
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "CM_APIKEY error: Error code 500: Something went wrong - please try again."}});
    });

});

/////////////////////// get_instances_data tests ///////////////////////

const iam_nock_resource_controller_valid = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_resource_controller_valid)
    .reply(200,{
        "access_token": "resource controller valid token"
    });

const resource_controller_valid_nock = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body);

const resource_controller_valid_nock_pagination_0 = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body_pagination_0);

const resource_controller_valid_nock_pagination_1 = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get('/?start=pagination_0')
    .reply(200, resource_controller_valid_response_body_pagination_1);

const resource_controller_valid_nock_pagination_2 = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get('/?start=pagination_1')
    .reply(200, resource_controller_valid_response_body_pagination_2);

const iam_nock_resource_controller_400 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_resource_controller_400)
    .reply(200,{
        "access_token": "resource controller 400 token"
    });

const resource_controller_400_nock = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller 400 token'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const iam_nock_resource_controller_500 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_resource_controller_500)
    .reply(200,{
        "access_token": "resource controller 500 token"
    });

const resource_controller_500_nock = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller 500 token'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(500, {});

//

const iam_nock_resource_controller_valid_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_resource_controller_valid_test)
    .reply(200,{
        "access_token": "resource controller valid token test"
    });

const resource_controller_valid_nock_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token test'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body);

const resource_controller_valid_nock_pagination_0_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body_pagination_0);

const resource_controller_valid_nock_pagination_1_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get('/?start=pagination_0')
    .reply(200, resource_controller_valid_response_body_pagination_1);

const resource_controller_valid_nock_pagination_2_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller valid token pagination'
    }})
    .persist()
    .get('/?start=pagination_1')
    .reply(200, resource_controller_valid_response_body_pagination_2);

const iam_nock_resource_controller_400_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_resource_controller_400_test)
    .reply(200,{
        "access_token": "resource controller 400 token test"
    });

const resource_controller_400_nock_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller 400 token test'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const iam_nock_resource_controller_500_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_resource_controller_500_test)
    .reply(200,{
        "access_token": "resource controller 500 token test"
    });

const resource_controller_500_nock_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer resource controller 500 token test'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(500, {});

describe('get_instances_data test', () => {

    test('valid input bluemix', async () => {
        const res = await main_func.get_instances_data("resource controller valid token", '.');
        expect(res).toEqual(resource_controller_valid_response_body.resources);
    });

    test('pagination bluemix', async () => {
        const res = await main_func.get_instances_data("resource controller valid token pagination", '.');
        let expect_this = resource_controller_valid_response_body_pagination_0.resources.concat(resource_controller_valid_response_body_pagination_1.resources);
        expect_this = expect_this.concat(resource_controller_valid_response_body_pagination_2.resources);
        expect(res).toEqual(expect_this);
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_resource_controller_400';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400 "
                    + "(code: code of 400). Error in request: " + resource_controller_url + resource_controller_endpoint}});
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_resource_controller_500';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: " +
                    "Error: Error code 500: Something went wrong - please try again."}});
    });

    test('valid input staging', async () => {
        const res = await main_func.get_instances_data("resource controller valid token test", '.test.');
        expect(res).toEqual(resource_controller_valid_response_body.resources);
    });

    test('pagination staging', async () => {
        const res = await main_func.get_instances_data("resource controller valid token pagination", '.test.');
        let expect_this = resource_controller_valid_response_body_pagination_0.resources.concat(resource_controller_valid_response_body_pagination_1.resources);
        expect_this = expect_this.concat(resource_controller_valid_response_body_pagination_2.resources);
        expect(res).toEqual(expect_this);
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_resource_controller_400_test';
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400 " +
                    "(code: code of 400). Error in request: " + resource_controller_url_test + resource_controller_endpoint}});
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_resource_controller_500_test';
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "Error code 500: Something went wrong - please try again."}});
    });

});

/////////////////////// get_cert_list + get_notification_number tests ///////////////////////

const get_cert_list_nock = nock(get_cert_list_url)
    .persist()
    .get(get_cert_list_paging_0)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": 1,
            "startWithOrderByValue": 3
        },
        "totalScannedDocs": 2,
        "certificates": [{
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "cert1_test"
        }, {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "name": "cert2_test"
        }]}
    );

get_cert_list_nock.persist()
    .get(get_cert_list_paging_1)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": 2,
            "startWithOrderByValue": 5
        },
        "totalScannedDocs": 2,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert3_test:cert3_test:certificate:cert3_test_id",
            "name": "cert3_test"
        }, {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert4_test:cert4_test:certificate:cert4_test_id",
            "name": "cert4_test"
        }]
    });

get_cert_list_nock.persist()
    .get(get_cert_list_paging_2)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test"
        }]
    });

const get_notification_valid = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer token'
    }})
    .persist()
    .get(get_notification_number_valid_endpoint)
    .reply(200, valid_notification_response);

const iam_nock_get_cert_list_400 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_get_cert_list_400)
    .reply(200,{
        "access_token": "get_cert_list_400 token"
    });

const get_cert_list_nock_400_crn1 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const get_notification_number_400_crn_1 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1)
    .reply(200, valid_notification_response);

const get_cert_list_nock_400_crn3 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test"
        }]
    });

const get_notification_number_400_crn_3 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const resource_controller_valid_nock_get_cert_list_400 = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body);

const iam_nock_get_cert_list_500 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_get_cert_list_500)
    .reply(200,{
        "access_token": "get_cert_list_500 token"
    });

const get_cert_list_nock_500_crn1 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test"
        }]
    });

const get_notification_number_500_crn1 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1)
    .reply(500, valid_notification_response);

const get_cert_list_nock_500_crn3 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3)
    .reply(500, {});

const get_notification_number_500_crn_3 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3)
    .reply(200, valid_notification_response);

const resource_controller_valid_nock_get_cert_list_500 = nock(resource_controller_url, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body);


//


const get_cert_list_nock_test = nock(get_cert_list_url_test)
    .persist()
    .get(get_cert_list_paging_0)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": 1,
            "startWithOrderByValue": 3
        },
        "totalScannedDocs": 2,
        "certificates": [{
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "cert1_test"
        }, {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "name": "cert2_test"
        }]}
    );

get_cert_list_nock_test.persist()
    .get(get_cert_list_paging_1)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": 2,
            "startWithOrderByValue": 5
        },
        "totalScannedDocs": 2,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert3_test:cert3_test:certificate:cert3_test_id",
            "name": "cert3_test"
        }, {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert4_test:cert4_test:certificate:cert4_test_id",
            "name": "cert4_test"
        }]
    });

get_cert_list_nock_test.persist()
    .get(get_cert_list_paging_2)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test"
        }]
    });

const get_notification_valid_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer token test'
    }})
    .persist()
    .get(get_notification_number_valid_endpoint)
    .reply(200, valid_notification_response);

const iam_nock_get_cert_list_400_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_get_cert_list_400_test)
    .reply(200,{
        "access_token": "get_cert_list_400 token test"
    });

const get_cert_list_nock_400_crn1_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token test'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1_test)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const get_notification_number_400_crn1_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token test'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1_test)
    .reply(200, valid_notification_response);

const get_cert_list_nock_400_crn3_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token test'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3_test)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:staging:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test staging"
        }]
    });

const get_notification_number_400_crn_3_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token test'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3_test)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

const resource_controller_valid_nock_get_cert_list_400_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_400 token test'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body_test);

const iam_nock_get_cert_list_500_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_get_cert_list_500_test)
    .reply(200,{
        "access_token": "get_cert_list_500 token staging"
    });

const get_cert_list_nock_500_crn1_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token staging'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1_test)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [ {
            "_id": "crn:v1:staging:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id",
            "name": "cert5_test staging"
        }]
    });

const get_notification_number_500_crn1_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token staging'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1_test)
    .reply(500, valid_notification_response);

const get_cert_list_nock_500_crn3_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token staging'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3_test)
    .reply(500, {});

const get_notification_number_500_crn_3_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token staging'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3_test)
    .reply(200, valid_notification_response);

const resource_controller_valid_nock_get_cert_list_500_test = nock(resource_controller_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer get_cert_list_500 token staging'
    }})
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body_test);


describe('get_cert_list + get_notification_number tests', () => {

    test('get_cert_list - valid multiple pages test - bluemix', async () => {
        const res = await main_func.get_cert_list(true, "crn", "eu-gb", '.', "token", 2);
        expect(res).toEqual([
            "crn:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert3_test:cert3_test:certificate:cert3_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert4_test:cert4_test:certificate:cert4_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id"]);
    });

    test('get_notification_number valid test - bluemix', async () => {
        const res = await main_func.get_notification_number("eu-gb", "crn_enc", ".", "token");
        expect(res).toEqual(2);
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_get_cert_list_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(build_dict_error_400_body)
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_get_cert_list_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(build_dict_error_500_body)
    });

    test('get_cert_list - valid multiple pages test - staging', async () => {
        const res = await main_func.get_cert_list(true, "crn", "eu-gb", '.test.', "token", 2);
        expect(res).toEqual([
            "crn:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert3_test:cert3_test:certificate:cert3_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert4_test:cert4_test:certificate:cert4_test_id",
            "crn:v1:bluemix:public:cloudcerts:us-south:cert5_test:cert5_test:certificate:cert5_test_id"]);
    });

    test('get_notification_number valid test - staging', async () => {
        const res = await main_func.get_notification_number("eu-gb", "crn_enc", ".test.", "token test");
        expect(res).toEqual(2);
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_get_cert_list_400_test";
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(build_dict_error_400_body_test)
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_get_cert_list_500_test";
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(build_dict_error_500_body_test)
    });

});

/////////////////////// main function (cm_inventory) tests ///////////////////////

const iam_nock_valid = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_valid)
    .reply(200,{
        "access_token": "valid token"
    });

const main_resource_controller_valid_nock = nock(resource_controller_url)
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body);

const main_get_cert_list_crn1 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer valid token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [{
            "_id": "crn1:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "crn1_cert1_test"}]
    });

const main_get_cert_list_crn3 = nock(get_cert_list_url, {
    "reqheaders": {
        'Authorization': 'Bearer valid token'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 2,
        "certificates": [{
            "_id": "crn3:v1:bluemix:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "crn3_cert1_test"
        }, {
            "_id": "crn3:v1:bluemix:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "name": "crn3_cert2_test"
        }]}
    );

const main_get_notification_crn1 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer valid token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1)
    .reply(200, valid_notification_response);

const main_get_notification_crn3 = nock(get_notification_number_url, {
    "reqheaders": {
        'Authorization': 'Bearer valid token'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3)
    .reply(200, valid_notification_response);


//


const iam_nock_valid_test = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_valid_test)
    .reply(200,{
        "access_token": "valid token test"
    });

const main_resource_controller_valid_nock_test = nock(resource_controller_url_test)
    .persist()
    .get(resource_controller_endpoint)
    .reply(200, resource_controller_valid_response_body_test);

const main_get_cert_list_crn1_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer valid token test'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn1_test)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 1,
        "certificates": [{
            "_id": "crn1:v1:staging:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "crn1_cert1_test staging"}]
    });

const main_get_cert_list_crn3_test = nock(get_cert_list_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer valid token test'
    }})
    .persist()
    .get(get_cert_list_main_endpoint_crn3_test)
    .reply(200, {
        "nextPageInfo": {
            "startWithDocId": [],
            "startWithOrderByValue": []
        },
        "totalScannedDocs": 2,
        "certificates": [{
            "_id": "crn3:v1:staging:public:cloudcerts:us-south:cert1_test:cert1_test:certificate:cert1_test_id",
            "name": "crn3_cert1_test staging"
        }, {
            "_id": "crn3:v1:staging:public:cloudcerts:us-south:cert2_test:cert2_test:certificate:cert2_test_id",
            "name": "crn3_cert2_test staging"
        }]}
    );

const main_get_notification_crn1_test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer valid token test'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn1_test)
    .reply(200, valid_notification_response);

const main_get_notification_crn3_Test = nock(get_notification_number_url_test, {
    "reqheaders": {
        'Authorization': 'Bearer valid token test'
    }})
    .persist()
    .get(get_notification_number_main_endpoint_crn3_test)
    .reply(200, valid_notification_response);


describe('cm_inventory tests', () => {

    test('missing API key', async () => {
        let parameters_new = {"SCRIPT_NAME": "cm_inventory"};
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "Parameter 'CM_APIKEY' is missing"}});
    });

    test('IS_TEST_ACCOUNT is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.IS_TEST_ACCOUNT;
        parameters_missing_one.CM_APIKEY = 'cm_apikey_valid';
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual(valid_main_response);
    });

    test('IS_TEST_ACCOUNT is invalid', async () => {
        const parameters_invalid = {...parameters};
        parameters_invalid.IS_TEST_ACCOUNT = 'invalid';
        const data = await main_func.main(parameters_invalid);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: " +
                    "Error: Parameter 'IS_TEST_ACCOUNT' is invalid" }});
    });

    test('valid input bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_valid';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(valid_main_response);
    });

    test('valid input staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = 'cm_apikey_valid_test';
        parameters_new.IS_TEST_ACCOUNT = 'true';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual(valid_main_response_test);
    });

});
