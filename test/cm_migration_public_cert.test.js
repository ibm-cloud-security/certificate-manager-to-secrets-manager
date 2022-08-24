const main_func = require('../cm_migration');
const nock = require('nock');

let save_env;

beforeAll(() => {
    save_env = {
        "script_name": process.env.SCRIPT_NAME,
        "cm_apikey": process.env.CM_APIKEY,
        "sm_apikey": process.env.SM_APIKEY,
        "cm_instance_crn": process.env.CM_INSTANCE_CRN,
        "sm_instance_crn": process.env.SM_INSTANCE_CRN,
        "secret_group_name": process.env.SECRET_GROUP_NAME,
        "cert_id": process.env.CERTIFICATE_ID,
        "ca_configuration_name": process.env.CA_CONFIGURATION_NAME,
        "dns_provider_configuration_name": process.env.DNS_PROVIDER_CONFIGURATION_NAME
    };

    delete process.env.SCRIPT_NAME;
    delete process.env.CM_APIKEY;
    delete process.env.SM_APIKEY;
    delete process.env.CM_INSTANCE_CRN;
    delete process.env.SM_INSTANCE_CRN;
    delete process.env.SECRET_GROUP_NAME;
    delete process.env.CERTIFICATE_ID;
    delete process.env.CA_CONFIGURATION_NAME;
    delete process.env.DNS_PROVIDER_CONFIGURATION_NAME;

});

afterAll(() => {
    process.env.SCRIPT_NAME = save_env.script_name;
    process.env.CM_APIKEY = save_env.cm_apikey;
    process.env.SM_APIKEY = save_env.sm_apikey;
    process.env.CM_INSTANCE_CRN = save_env.cm_instance_crn;
    process.env.SM_INSTANCE_CRN = save_env.sm_instance_crn;
    process.env.SECRET_GROUP_NAME = save_env.secret_group_name;
    process.env.CERTIFICATE_ID = save_env.cert_id;
    process.env.CA_CONFIGURATION_NAME = save_env.ca_configuration_name;
    process.env.DNS_PROVIDER_CONFIGURATION_NAME = save_env.dns_provider_configuration_name;
});


const parameters = {
    "SCRIPT_NAME": "sm_public_cert",
    "CM_APIKEY": "cm_apikey",
    "SM_APIKEY": "sm_apikey",
    "CM_INSTANCE_CRN": "cm_crn:1:bluemix:3:4:eu-gb",
    "SM_INSTANCE_CRN": "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id",
    "SECRET_GROUP_NAME": "Group2",
    "CERTIFICATE_ID": 'cert_id',
    "CA_CONFIGURATION_NAME": 'ca_configuration_name cert',
    "DNS_PROVIDER_CONFIGURATION_NAME": 'dns_configuration_name cert'

};

const iam_bluemix_url = 'https://iam.cloud.ibm.com';
const iam_staging_url = 'https://iam.test.cloud.ibm.com';
const iam_endpoint = '/identity/token';
const iam_grant_type_cm = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey';
const iam_grant_type_sm = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey';

const iam_grant_type_cm_invalid_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_400';
const iam_grant_type_cm_invalid_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_500';

const iam_grant_type_sm_invalid_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey_invalid_400';
const iam_grant_type_sm_invalid_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey_invalid_500';

const get_public_cert_data_url = 'https://eu-gb.certificate-manager.cloud.ibm.com';
const get_public_cert_data_endpoint = '/api/v1/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id/metadata';
const get_public_cert_data_endpoint_imported = '/api/v1/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_imported/metadata';
const get_public_cert_data_endpoint_400 = '/api/v1/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_400/metadata';
const get_public_cert_data_endpoint_500 = '/api/v1/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_500/metadata';

const get_public_cert_data_test_url = 'https://eu-gb.certificate-manager.test.cloud.ibm.com';
const get_public_cert_data_endpoint_test = '/api/v1/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id/metadata';
const get_public_cert_data_endpoint_400_test = '/api/v1/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id_400/metadata';
const get_public_cert_data_endpoint_500_test = '/api/v1/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id_500/metadata';

const get_secret_group_id_url = 'https://sm_instance_id.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_400 = 'https://sm_instance_id_400.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_500 = 'https://sm_instance_id_500.eu-gb.secrets-manager.appdomain.cloud';

const get_secret_group_id_endpoint = '/api/v1/secret_groups';

const get_secret_group_id_url_test = 'https://sm_instance_id.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_400_test = 'https://sm_instance_id_400.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_500_test = 'https://sm_instance_id_500.eu-gb.secrets-manager.test.appdomain.cloud';

const order_cert_url = 'https://sm_instance_id.eu-gb.secrets-manager.appdomain.cloud';
const order_cert_url_400 = 'https://sm_instance_id_400_order.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_order_400_url = 'https://sm_instance_id_400_order.eu-gb.secrets-manager.appdomain.cloud';
const order_cert_url_500 = 'https://sm_instance_id_500_order.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_order_500_url = 'https://sm_instance_id_500_order.eu-gb.secrets-manager.appdomain.cloud';

const order_cert_endpoint = '/api/v1/secrets/public_cert';

const order_cert_url_test = 'https://sm_instance_id.eu-gb.secrets-manager.test.appdomain.cloud';
const order_cert_url_400_test = 'https://sm_instance_id_400_order.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_order_400_url_test = 'https://sm_instance_id_400_order.eu-gb.secrets-manager.test.appdomain.cloud';
const order_cert_url_500_test = 'https://sm_instance_id_500_order.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_order_500_url_test = 'https://sm_instance_id_500_order.eu-gb.secrets-manager.test.appdomain.cloud';

const cert_data_imported = {
    "name": "cert_name_not_imported",
    "description":"description cert",
    "imported": true,
    "key_algorithm": "rsaEncryption 2048 bit",
    "order_policy": {
        "auto_renew_enabled": false
    }
};

const cert_data_not_imported = {
    "name": "cert_name_not_imported",
    "description":"description cert",
    "imported": false,
    "domains": ["common_name_cert", "domain2", "domain3"],
    "key_algorithm": "rsaEncryption 2048 bit",
    "order_policy": {
        "auto_renew_enabled": true
    }
};

const req_data = {
    "metadata": {
        "collection_type": "application/vnd.ibm.secrets-manager.secret+json",
        "collection_total": 1
    },
    "resources": [
        {
            "name": "cert_name_not_imported",
            "description": "description cert",
            "ca": "ca_configuration_name cert",
            "dns": "dns_configuration_name cert",
            "common_name": "common_name cert",
            "alt_names": ["domain2", "domain3"],
            "key_algorithm": "RSA2048",
            "bundle_certs": true,
            "rotation": {
                "auto_rotate": true,
                "rotate_keys": false
            }
        }
    ]};


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

const iam_nock_bluemix_sm = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_sm)
    .reply(200,{
        "access_token": "bluemix_token"
    });

const iam_nock_staging_sm = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_sm)
    .reply(200,{
        "access_token": "staging_token"
    });

const iam_nock_bluemix_invalid_400 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_400)
    .reply(400, {"errorMessage": "Error message 400"});

const iam_nock_staging_invalid_400 = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_sm_invalid_400)
    .reply(400, {"errorMessage": "Error message 400"});

const iam_nock_bluemix_invalid_500 = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm_invalid_500)
    .reply(500, {});

const iam_nock_staging_invalid_500 = nock(iam_staging_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_sm_invalid_500)
    .reply(500, {});

describe('IAM Token tests', () => {

    test('get token test - bluemix CM - invalid API key 400', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: CM_APIKEY error: " +
                    "Error code 400: Error message 400. Error in request: https://iam.cloud.ibm.com/identity/token"}});
    });

    test('get token test - staging SM - invalid API key 400', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_APIKEY = "sm_apikey_invalid_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: SM_APIKEY error: Error code " +
                    "400: Error message 400. Error in request: https://iam.test.cloud.ibm.com/identity/token"}});
    });

    test('get token test - bluemix CM - invalid API key 500', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_APIKEY = "cm_apikey_invalid_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "CM_APIKEY error: Error code 500: Something went wrong - please try again."}});
    });

    test('get token test - staging SM - invalid API key 500', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_APIKEY = "sm_apikey_invalid_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "SM_APIKEY error: Error code 500: Something went wrong - please try again."}});
    });

});


/////////////////////// get_cert_data tests ///////////////////////

const get_public_cert_data_nock = nock(get_public_cert_data_url)
    .persist()
    .get(get_public_cert_data_endpoint)
    .reply(200, cert_data_not_imported);

const get_public_cert_data_nock_test = nock(get_public_cert_data_test_url)
    .persist()
    .get(get_public_cert_data_endpoint_test)
    .reply(200, cert_data_not_imported);

const get_public_cert_data_imported_nock = nock(get_public_cert_data_url)
    .persist()
    .get(get_public_cert_data_endpoint_imported)
    .reply(200, cert_data_imported);

get_public_cert_data_nock
    .persist()
    .get(get_public_cert_data_endpoint_400)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

get_public_cert_data_nock
    .persist()
    .get(get_public_cert_data_endpoint_500)
    .reply(500, {});

get_public_cert_data_nock_test
    .persist()
    .get(get_public_cert_data_endpoint_400_test)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

get_public_cert_data_nock_test
    .persist()
    .get(get_public_cert_data_endpoint_500_test)
    .reply(500, {});

describe('get_public_cert_data test', () => {

    test('valid input bluemix', async () => {
        const res = await main_func.get_public_cert_data(parameters.CM_INSTANCE_CRN, "eu-gb",
            parameters.CERTIFICATE_ID, "token", '.');
        expect(res).toEqual(cert_data_not_imported);
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400"
                + " (code: code of 400). Error in request: " + get_public_cert_data_url + get_public_cert_data_endpoint_400}})
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500:" +
                " Something went wrong - please try again."}})
    });

    test('valid input staging', async () => {
        const res = await main_func.get_public_cert_data('cm_crn:1:staging:3:4:eu-gb', "eu-gb",
            parameters.CERTIFICATE_ID, "token", '.test.');
        expect(res).toEqual(cert_data_not_imported);
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_400";
        parameters_new.CM_INSTANCE_CRN = 'cm_crn:1:staging:3:4:eu-gb';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400"
                + " (code: code of 400)." +
                " Error in request: " + get_public_cert_data_test_url + get_public_cert_data_endpoint_400_test}})
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_500";
        parameters_new.CM_INSTANCE_CRN = 'cm_crn:1:staging:3:4:eu-gb';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500:" +
                " Something went wrong - please try again."}})
    });

    test('invalid input bluemix - imported cert', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_imported";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "The certificate you are trying to order is an imported certificate."}});
    });

});

/////////////////////// get_secret_group_id tests ///////////////////////

const get_secret_group_id_nock = nock(get_secret_group_id_url)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const get_secret_group_id_nock_400 = nock(get_secret_group_id_url_400)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_500 = nock(get_secret_group_id_url_500)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(500, {});

////

const get_secret_group_id_nock_test = nock(get_secret_group_id_url_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const get_secret_group_id_nock_400_test = nock(get_secret_group_id_url_400_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_500_test = nock(get_secret_group_id_url_500_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(500, {});


describe('get_secret_group_id test', () => {

    test('valid group name bluemix', async () => {
        const res = await main_func.get_secret_group_id("sm_instance_id", "Group2",
            "eu-gb", "sm_token", ".");
        expect(res).toEqual("Group2 id");
    });

    test('invalid group name bluemix', async () => {
        const res2 = await main_func.get_secret_group_id("sm_instance_id",
            "Invalid group name", "eu-gb", "sm_token",".");
        expect(res2).toEqual(new Error("Secret group name doesn't exist"));
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": 'Certificate migration failed: Error: Error code 400: Error with secret'
                + ' group name: error message 400. Error in request: '
                + get_secret_group_id_url_400 + get_secret_group_id_endpoint}})
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                "Something went wrong - please try again."}})
    });

    test('valid group name staging', async () => {
        const res = await main_func.get_secret_group_id("sm_instance_id", "Group2",
            "eu-gb", "sm_token", ".test.");
        expect(res).toEqual("Group2 id");
    });

    test('invalid group name staging', async () => {
        const res2 = await main_func.get_secret_group_id("sm_instance_id",
            "Invalid group name", "eu-gb", "sm_token",".test.");
        expect(res2).toEqual(new Error("Secret group name doesn't exist"));
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: " +
                    "Error code 400: Error with secret group name: error message 400. " +
                    "Error in request: " + get_secret_group_id_url_400_test + get_secret_group_id_endpoint}})
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                "Something went wrong - please try again."}})
    });
});


/////////////////////// order_cert tests ///////////////////////

const order_cert_nock = nock(order_cert_url, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(200, {"resources": [{"id": "cert2_test_id_not_imported", "name": "cert2_test_not_imported"}]});

const order_cert_nock_400 = nock(order_cert_url_400, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_order_400 = nock(get_secret_group_id_order_400_url)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const order_cert_nock_500 = nock(order_cert_url_500, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(500, "");

const get_secret_group_id_nock_order_500 = nock(get_secret_group_id_order_500_url)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

///

const order_cert_nock_test = nock(order_cert_url_test, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(200, {"resources": [{"id": "cert2_test_id_not_imported", "name": "cert2_test_not_imported"}]});

const order_cert_nock_400_test = nock(order_cert_url_400_test, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_order_400_test = nock(get_secret_group_id_order_400_url_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const order_cert_nock_500_test = nock(order_cert_url_500_test, req_data)
    .persist()
    .post(order_cert_endpoint)
    .reply(500, "");

const get_secret_group_id_nock_order_500_test = nock(get_secret_group_id_order_500_url_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});


describe('order_cert tests', () => {

    test('valid nock bluemix', async () => {
        const res = await main_func.order_certificate("sm_token", cert_data_not_imported, "eu-gb",
            "sm_instance_id", ".", undefined,
            "ca_configuration_name cert", "dns_configuration_name cert");
        expect(res.status).toEqual(200);
        expect(res.data).toEqual({"resources": [{"id": "cert2_test_id_not_imported", "name": "cert2_test_not_imported"}]});
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_400_order";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": 'Certificate migration failed: Error: Error code 400:' +
                ' error message 400. Error in request: '
                + order_cert_url_400 + order_cert_endpoint}})
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_500_order";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                "Something went wrong - please try again."}})
    });

    test('valid nock staging', async () => {
        const res = await main_func.order_certificate("sm_token", cert_data_not_imported, "eu-gb",
            "sm_instance_id", ".test.", undefined,
            "ca_configuration_name cert", "dns_configuration_name cert");
        expect(res.status).toEqual(200);
        expect(res.data).toEqual({"resources": [{"id": "cert2_test_id_not_imported", "name": "cert2_test_not_imported"}]});
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_400_order";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": 'Certificate migration failed: Error: Error code 400:' +
                ' error message 400. Error in request: '
                + order_cert_url_400_test + order_cert_endpoint}})
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_500_order";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                "Something went wrong - please try again."}})
    });
});


/////////////////////// main function (sm_public_cert) tests ///////////////////////

describe('sm_public_cert tests', () => {

    test('CA_CONFIGURATION_NAME is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.CA_CONFIGURATION_NAME;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: " +
                    "Parameter 'CA_CONFIGURATION_NAME' is missing" }});
    });

    test('DNS_PROVIDER_CONFIGURATION_NAME is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.DNS_PROVIDER_CONFIGURATION_NAME;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: " +
                    "Parameter 'DNS_PROVIDER_CONFIGURATION_NAME' is missing" }});
    });

    test('invalid parameter BUNDLE_CERTS', async () => {
        let parameters_new = {...parameters};
        parameters_new.BUNDLE_CERTS = 'invalid';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({
            "error": {"error": "Certificate migration failed: Error: Parameter 'BUNDLE_CERTS' is invalid"}
        });
    });

    test('valid input CM = bluemix, SM = staging', async () => {
        const res = await main_func.main(parameters);
        expect(res).toEqual({"message": "Certificate ordered successfully!"});
    });

    test('valid input CM = staging, SM = bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_INSTANCE_CRN = "cm_crn:1:staging:3:4:eu-gb";
        parameters_new.SM_INSTANCE_CRN = 'sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"message": "Certificate ordered successfully!"});
    });

});

