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
        "cert_id": process.env.CERTIFICATE_ID
    };

    delete process.env.SCRIPT_NAME;
    delete process.env.CM_APIKEY;
    delete process.env.SM_APIKEY;
    delete process.env.CM_INSTANCE_CRN;
    delete process.env.SM_INSTANCE_CRN;
    delete process.env.SECRET_GROUP_NAME;
    delete process.env.CERTIFICATE_ID;

});

afterAll(() => {
    process.env.SCRIPT_NAME = save_env.script_name;
    process.env.CM_APIKEY = save_env.cm_apikey;
    process.env.SM_APIKEY = save_env.sm_apikey;
    process.env.CM_INSTANCE_CRN = save_env.cm_instance_crn;
    process.env.SM_INSTANCE_CRN = save_env.sm_instance_crn;
    process.env.SECRET_GROUP_NAME = save_env.secret_group_name;
    process.env.CERTIFICATE_ID = save_env.cert_id;
});


const parameters = {
    "SCRIPT_NAME": "cm_cert_copy",
    "CM_APIKEY": "cm_apikey",
    "SM_APIKEY": "sm_apikey",
    "CM_INSTANCE_CRN": "cm_crn:1:bluemix:3:4:eu-gb",
    "SM_INSTANCE_CRN": "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id",
    "SECRET_GROUP_NAME": "Group2",
    "CERTIFICATE_ID": 'cert_id'
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

const get_cert_data_url = 'https://eu-gb.certificate-manager.cloud.ibm.com';
const get_cert_data_endpoint = '/api/v2/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id';
const get_cert_data_endpoint_not_imported = '/api/v2/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_not_imported';
const get_cert_data_endpoint_400 = '/api/v2/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_400';
const get_cert_data_endpoint_500 = '/api/v2/certificate/cm_crn%3A1%3Abluemix%3A3%3A4%3Aeu-gcertificate%3Acert_id_500';

const get_cert_data_test_url = 'https://eu-gb.certificate-manager.test.cloud.ibm.com';
const get_cert_data_endpoint_test = '/api/v2/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id';
const get_cert_data_endpoint_not_imported_test = '/api/v2/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id_not_imported';
const get_cert_data_endpoint_400_test = '/api/v2/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id_400';
const get_cert_data_endpoint_500_test = '/api/v2/certificate/cm_crn%3A1%3Astaging%3A3%3A4%3Aeu-gcertificate%3Acert_id_500';

const get_secret_group_id_url = 'https://sm_instance_id.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_400 = 'https://sm_instance_id_400.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_500 = 'https://sm_instance_id_500.eu-gb.secrets-manager.appdomain.cloud';

const get_secret_group_id_endpoint = '/api/v1/secret_groups';

const get_secret_group_id_url_test = 'https://sm_instance_id.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_400_test = 'https://sm_instance_id_400.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_500_test = 'https://sm_instance_id_500.eu-gb.secrets-manager.test.appdomain.cloud';

const create_secret_url = 'https://sm_instance_id.eu-gb.secrets-manager.appdomain.cloud';
const create_secret_url_400 = 'https://sm_instance_id_create_secret_400.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_secret_400 = 'https://sm_instance_id_create_secret_400.eu-gb.secrets-manager.appdomain.cloud';
const create_secret_url_500 = 'https://sm_instance_id_create_secret_500.eu-gb.secrets-manager.appdomain.cloud';
const get_secret_group_id_url_secret_500 = 'https://sm_instance_id_create_secret_500.eu-gb.secrets-manager.appdomain.cloud';

const create_secret_endpoint = '/api/v1/secrets/imported_cert';

const create_secret_url_test = 'https://sm_instance_id.eu-gb.secrets-manager.test.appdomain.cloud';
const create_secret_url_400_test = 'https://sm_instance_id_create_secret_400.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_secret_400_test = 'https://sm_instance_id_create_secret_400.eu-gb.secrets-manager.test.appdomain.cloud';
const create_secret_url_500_test = 'https://sm_instance_id_create_secret_500.eu-gb.secrets-manager.test.appdomain.cloud';
const get_secret_group_id_url_secret_500_test = 'https://sm_instance_id_create_secret_500.eu-gb.secrets-manager.test.appdomain.cloud';

const req_data = {
    "metadata": {
        "collection_type": "application/vnd.ibm.secrets-manager.secret+json",
        "collection_total": 1
    },
    "resources": [
        {
            "name": "cert_name",
            "secret_group_id": "Group2 id",
            "certificate": "cert content",
        }
    ]
};

const cert_data_imported = {
    "name": "cert_name_imported",
    "description":"description cert",
    "imported": true,
    "data": {
        "content": "cert content",
        "priv_key": "cert priv key",
        "intermediate": "cert intermediate"
    }
};

const cert_data_not_imported = {
    "name": "cert_name_not_imported",
    "description":"description cert",
    "imported": false,
    "data": {
        "content": "cert content",
        "priv_key": "cert priv key",
        "intermediate": "cert intermediate"
    }
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

const get_cert_data_nock = nock(get_cert_data_url)
    .persist()
    .get(get_cert_data_endpoint)
    .reply(200, cert_data_imported);

const get_cert_data_nock_test = nock(get_cert_data_test_url)
    .persist()
    .get(get_cert_data_endpoint_test)
    .reply(200, cert_data_not_imported);

get_cert_data_nock
    .persist()
    .get(get_cert_data_endpoint_400)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

get_cert_data_nock
    .persist()
    .get(get_cert_data_endpoint_500)
    .reply(500, {});

get_cert_data_nock_test
    .persist()
    .get(get_cert_data_endpoint_400_test)
    .reply(400, {"message": "Error message 400", "code": "code of 400"});

get_cert_data_nock_test
    .persist()
    .get(get_cert_data_endpoint_500_test)
    .reply(500, {});

describe('get_cert_data test', () => {

    test('valid input bluemix', async () => {
        const res = await main_func.get_cert_data(parameters.CM_INSTANCE_CRN, "eu-gb",
            parameters.CERTIFICATE_ID, "token", '.');
        expect(res).toEqual(cert_data_imported);
    });

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400" +
                    " (code: code of 400). Error in request: " + get_cert_data_url + get_cert_data_endpoint_400}})
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500:" +
                    " Something went wrong - please try again."}})
    });

    test('valid input staging', async () => {
        const res = await main_func.get_cert_data('cm_crn:1:staging:3:4:eu-gb', "eu-gb",
            parameters.CERTIFICATE_ID, "token", '.test.');
        expect(res).toEqual(cert_data_not_imported);
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_400";
        parameters_new.CM_INSTANCE_CRN = 'cm_crn:1:staging:3:4:eu-gb';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error message 400 " +
                    "(code: code of 400)." +
                    " Error in request: " + get_cert_data_test_url + get_cert_data_endpoint_400_test}})
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cert_id_500";
        parameters_new.CM_INSTANCE_CRN = 'cm_crn:1:staging:3:4:eu-gb';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500:" +
                    " Something went wrong - please try again."}})
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
        expect(res).toEqual({"error": {"error": 'Certificate migration failed: Error: Error code 400: Error with secret' +
                    ' group name: error message 400. Error in request: '
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
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400: Error with " +
                    "secret group name: error message 400. Error in request: " + get_secret_group_id_url_400_test +
                    get_secret_group_id_endpoint}})
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                    "Something went wrong - please try again."}})
    });
});

/////////////////////// add_cert_to_secret tests ///////////////////////


describe('add_cert_to_secret tests', () => {

    test('valid output - bluemix - imported + only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_imported, "eu-gb", "token", ".", true);
        expect(res).toEqual(true);
    });

    test('valid output - bluemix - not imported + only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_not_imported, "eu-gb", "token", ".", true);
        expect(res).toEqual(false);
    });

    test('valid output - bluemix - imported + not only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_imported, "eu-gb", "token", ".", false);
        expect(res).toEqual(true);
    });

    test('valid output - bluemix - not imported + not only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_not_imported, "eu-gb", "token", ".", false);
        expect(res).toEqual(true);
    });

    test('valid output - staging - imported + only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_imported, "eu-gb", "token", ".test.", true);
        expect(res).toEqual(true);
    });

    test('valid output - staging - not imported + only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_not_imported, "eu-gb", "token", ".test.", true);
        expect(res).toEqual(false);
    });

    test('valid output - staging - imported + not only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_imported, "eu-gb", "token", ".test.", false);
        expect(res).toEqual(true);
    });

    test('valid output - staging - not imported + not only_imported', async () => {
        const res = await main_func.add_cert_to_secret(parameters.SM_INSTANCE_CRN, "sm_instance_id",
            parameters.SECRET_GROUP_NAME, cert_data_not_imported, "eu-gb", "token", ".test.", false);
        expect(res).toEqual(true);
    });


});

/////////////////////// create_secret tests ///////////////////////

const create_secret_nock = nock(create_secret_url, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(200, "");

const create_secret_nock_400 = nock(create_secret_url_400, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_secret_400 = nock(get_secret_group_id_url_secret_400)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const create_secret_nock_500 = nock(create_secret_url_500, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(500, {});

const get_secret_group_id_nock_secret_500 = nock(get_secret_group_id_url_secret_500)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

//

const create_secret_nock_test = nock(create_secret_url_test, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(200, "");

const create_secret_nock_400_test = nock(create_secret_url_400_test, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(400, {"resources": [{"error_message": "error message 400"}]});

const get_secret_group_id_nock_secret_400_test = nock(get_secret_group_id_url_secret_400_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

const create_secret_nock_500_test = nock(create_secret_url_500_test, req_data)
    .persist()
    .post(create_secret_endpoint)
    .reply(500, {});

const get_secret_group_id_nock_secret_500_test = nock(get_secret_group_id_url_secret_500_test)
    .persist()
    .get(get_secret_group_id_endpoint)
    .reply(200, {"metadata": {"collection_total": 3},
        "resources": [{"name": "Group1", "id": "Group1 id"}, {"name": "Group2", "id": "Group2 id"},
            {"name": "Group3", "id": "Group3 id"}]});

describe('create_secret test', () => {

    test('Error 400 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_create_secret_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400:" +
                    " error message 400. Error in request: " + create_secret_url_400 + create_secret_endpoint}});
    });

    test('Error 500 bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id_create_secret_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                    "Something went wrong - please try again."}})
    });

    test('Error 400 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_create_secret_400";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 400:" +
                    " error message 400. Error in request: " + create_secret_url_400_test + create_secret_endpoint}});
    });

    test('Error 500 staging', async () => {
        let parameters_new = {...parameters};
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:staging:3:4:eu-gb:6:sm_instance_id_create_secret_500";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Error code 500: " +
                    "Something went wrong - please try again."}})
    });
});


/////////////////////// main function (cm_cert_copy) tests ///////////////////////

const get_cert_data_not_imported_nock = nock(get_cert_data_url)
    .persist()
    .get(get_cert_data_endpoint_not_imported)
    .reply(200, cert_data_not_imported);

const get_cert_data_not_imported_nock_test = nock(get_cert_data_test_url)
    .persist()
    .get(get_cert_data_endpoint_not_imported_test)
    .reply(200, cert_data_not_imported);

describe('cm_cert_copy test', () => {

    test('valid input - CM = bluemix, SM = staging, only_imported = true, imported', async () => {
        const res = await main_func.main(parameters);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});
    });

    test('valid input - CM = bluemix, SM = staging, only_imported = true, not imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = 'cert_id_not_imported';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Certificate: " +
                    "cert_id_not_imported was not migrated since it's not an imported certificate. " +
                    "If you wish to migrate it anyway, please change the value of the parameter " +
                    "'ONLY_IMPORTED' to 'false'"}});

    });

    test('valid input - CM = bluemix, SM = staging, only_imported = false, imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.ONLY_IMPORTED = 'false';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});

    });

    test('valid input - CM = bluemix, SM = staging, only_imported = false, not imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.ONLY_IMPORTED = 'false';
        parameters_new.CERTIFICATE_ID = 'cert_id_not_imported';
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});

    });

    test('valid input CM = staging, SM = bluemix', async () => {
        let parameters_new = {...parameters};
        parameters_new.CM_INSTANCE_CRN = "cm_crn:1:staging:3:4:eu-gb";
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id";
        const res = await main_func.main(parameters);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});
    });

    test('valid input - CM = staging, SM = bluemix, only_imported = true, not imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = 'cert_id_not_imported';
        parameters_new.CM_INSTANCE_CRN = "cm_crn:1:staging:3:4:eu-gb";
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"error": {"error": "Certificate migration failed: Error: Certificate: " +
                    "cert_id_not_imported was not migrated since it's not an imported certificate. " +
                    "If you wish to migrate it anyway, please change the value of the parameter " +
                    "'ONLY_IMPORTED' to 'false'"}});

    });

    test('valid input - CM = staging, SM = bluemix, only_imported = false, imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.ONLY_IMPORTED = 'false';
        parameters_new.CM_INSTANCE_CRN = "cm_crn:1:staging:3:4:eu-gb";
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});

    });

    test('valid input - CM = staging, SM = bluemix, only_imported = false, not imported', async () => {
        let parameters_new = {...parameters};
        parameters_new.ONLY_IMPORTED = 'false';
        parameters_new.CERTIFICATE_ID = 'cert_id_not_imported';
        parameters_new.CM_INSTANCE_CRN = "cm_crn:1:staging:3:4:eu-gb";
        parameters_new.SM_INSTANCE_CRN = "sm-crn:1:bluemix:3:4:eu-gb:6:sm_instance_id";
        const res = await main_func.main(parameters_new);
        expect(res).toEqual({"message": "Certificate migrated successfully!"});

    });

});
