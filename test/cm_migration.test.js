const main_func = require('../cm_migration');
const nock = require('nock');

const iam_bluemix_url = 'https://iam.cloud.ibm.com';
const iam_staging_url = 'https://iam.test.cloud.ibm.com';
const iam_endpoint = '/identity/token';
const iam_grant_type_cm = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey';
const iam_grant_type_sm = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey';

const iam_grant_type_cm_invalid_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_400';
const iam_grant_type_cm_invalid_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=cm_apikey_invalid_500';

const iam_grant_type_sm_invalid_400 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey_invalid_400';
const iam_grant_type_sm_invalid_500 = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&apikey=sm_apikey_invalid_500';


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

let parameters = {
    "SCRIPT_NAME": "cm_cert_copy",
    "CM_APIKEY": "cm_api",
    "SM_APIKEY": "sm-api",
    "CM_INSTANCE_CRN": "cm_crn:1:bluemix:3:4:cm_location",
    "SM_INSTANCE_CRN": "sm-crn:1:bluemix:3:4:sm_location:6:sm_crn",
    "CERTIFICATE_ID": "cert_id",
    "SECRET_GROUP_NAME": "group_name"
};

const iam_nock_bluemix = nock(iam_bluemix_url)
    .persist()
    .post(iam_endpoint, iam_grant_type_cm)
    .reply(200,{
        "access_token": "bluemix_token"
    });

const iam_nock_staging = nock(iam_staging_url)
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

    test('get token test - bluemix CM', async () => {
        delete process.env.CM_APIKEY;
        const res = await main_func.get_token("cm_apikey", '.', "CM");
        expect(res).toEqual("bluemix_token");
    });

    test('get token test - staging SM', async () => {
        const res = await main_func.get_token("sm_apikey", '.test.', "SM");
        expect(res).toEqual("staging_token");
    });

    test('get token test - bluemix CM - invalid API key 400', async () => {
        try{
            const res = await main_func.get_token("cm_apikey_invalid_400", '.', "CM");
        }
        catch(err){
            expect(err).toEqual(new Error("CM_APIKEY error: Error code 400: Error message 400. " +
                "Error in request: https://iam.cloud.ibm.com/identity/token"));
        }
    });

    test('get token test - staging SM - invalid API key 400', async () => {
        try{
            const res = await main_func.get_token("sm_apikey_invalid_400", '.test.', "SM");
        }
        catch(err){
            expect(err).toEqual(new Error("SM_APIKEY error: Error code 400: " +
                "Error message 400. Error in request: https://iam.test.cloud.ibm.com/identity/token"));
        }
    });

    test('get token test - bluemix CM - invalid API key 500', async () => {
        try{
            const res = await main_func.get_token("cm_apikey_invalid_500", '.', "CM");
        }
        catch(err){
            expect(err).toEqual(new Error("CM_APIKEY error: " +
                "Error code 500: Something went wrong - please try again."));
        }
    });

    test('get token test - staging SM - invalid API key 500', async () => {
        try{
            const res = await main_func.get_token("sm_apikey_invalid_500", '.test.', "SM");
        }
        catch(err){
            expect(err).toEqual(new Error("SM_APIKEY error: " +
                "Error code 500: Something went wrong - please try again."));
        }
    });

});

describe('parameters missing tests', () => {

    test('script name is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.SCRIPT_NAME;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({"error": {"error": "parameter SCRIPT_NAME is missing."}});
    });

    test('CM_APIKEY is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.CM_APIKEY;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: Parameter 'CM_APIKEY' is missing" }});
    });

    test('SM_APIKEY is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.SM_APIKEY;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: Parameter 'SM_APIKEY' is missing" }});
    });

    test('CM_INSTANCE_CRN is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.CM_INSTANCE_CRN;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: Parameter 'CM_INSTANCE_CRN' is missing" }});
    });

    test('SM_INSTANCE_CRN is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.SM_INSTANCE_CRN;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: Parameter 'SM_INSTANCE_CRN' is missing" }});
    });

    test('CERTIFICATE_ID is missing', async () => {
        const parameters_missing_one = {...parameters};
        delete parameters_missing_one.CERTIFICATE_ID;
        const data = await main_func.main(parameters_missing_one);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: Parameter 'CERTIFICATE_ID' is missing" }});
    });

});

describe('parameters incorrect tests', () => {

    test('script name is incorrect', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.SCRIPT_NAME = "incorrect script name";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "'incorrect script name' isn't a valid script name."}});
    });

    test('location is missing in CM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.CM_INSTANCE_CRN = "cm_crn:1:bluemix:3:4";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'CM_INSTANCE_CRN' is invalid - region is missing"}});
    });

    test('bluemix/staging is missing in CM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.CM_INSTANCE_CRN = "cm_crn:1";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'CM_INSTANCE_CRN' is invalid"}});
    });

    test('bluemix/staging is invalid in CM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.CM_INSTANCE_CRN = "cm_crn:1:invalid_bluemix_staging:3:4:eu-gb";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'CM_INSTANCE_CRN' is invalid"}});
    });

    test('location is missing in SM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.SM_INSTANCE_CRN = "sm_crn:1:bluemix:3:4";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'SM_INSTANCE_CRN' is invalid - region is missing"}});
    });

    test('bluemix/staging is missing in SM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.SM_INSTANCE_CRN = "sm_crn:1";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'SM_INSTANCE_CRN' is invalid"}});
    });

    test('bluemix/staging is invalid in SM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.SM_INSTANCE_CRN = "sm-crn:1:invalid_bluemix_staging:3:4:eu-gb:6:sm_instance_id";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'SM_INSTANCE_CRN' is invalid"}});
    });

    test('sm instance ID is missing in SM_INSTANCE_CRN', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.SM_INSTANCE_CRN = "cm_crn:1:bluemix:3:4:location:6";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'SM_INSTANCE_CRN' is invalid - SM instance ID is missing"}});
    });

    test('CERTIFICATE_ID is invalid', async () => {
        const parameters_new = {...parameters};
        parameters_new.CERTIFICATE_ID = "cm-crn:1:bluemix:3:4:cm_location:6:cm_crn_id:certificate:uuid";
        const data = await main_func.main(parameters_new);
        expect(data).toEqual({ "error": {"error": "Certificate migration failed: Error: The parameter 'CERTIFICATE_ID' is invalid. " +
                    "Please make sure you entered only the UUID part of the certificate's CRN ( ...:certificate:UUID)" }});
    });

    test('ONLY_IMPORTED is incorrect', async () => {
        const parameters_incorrect = {...parameters};
        parameters_incorrect.ONLY_IMPORTED = "incorrect only_imported value";
        const data = await main_func.main(parameters_incorrect);
        expect(data).toEqual({"error": {"error": "Certificate migration failed: Error: Parameter 'ONLY_IMPORTED' is invalid"}});
    });

    describe('bluemix/staging tests', () => {

        test('cm bluemix, sm bluemix test', async () => {
            const data = await main_func.parameters_validation(parameters.CM_APIKEY, parameters.SM_APIKEY, parameters.CM_INSTANCE_CRN, parameters.SM_INSTANCE_CRN, parameters.CERTIFICATE_ID, "true");
            expect(data).toEqual(["cm_location", "sm_location", "sm_crn", '.', '.', true]);
        });

        test('cm bluemix, sm staging test', async () => {
            const data = await main_func.parameters_validation(parameters.CM_APIKEY, parameters.SM_APIKEY, parameters.CM_INSTANCE_CRN, "sm-crn:1:staging:3:4:sm_location:6:sm_crn", parameters.CERTIFICATE_ID, true);
            expect(data).toEqual(["cm_location", "sm_location", "sm_crn", '.', '.test.', true]);
        });

        test('cm staging, sm bluemix test', async () => {
            const data = await main_func.parameters_validation(parameters.CM_APIKEY, parameters.SM_APIKEY, "cm_crn:1:staging:3:4:cm_location", parameters.SM_INSTANCE_CRN, parameters.CERTIFICATE_ID, 'false');
            expect(data).toEqual(["cm_location", "sm_location", "sm_crn", '.test.', '.', false]);
        });

        test('cm staging, sm staging test', async () => {
            const data = await main_func.parameters_validation(parameters.CM_APIKEY, parameters.SM_APIKEY, "cm_crn:1:staging:3:4:cm_location", "sm-crn:1:staging:3:4:sm_location:6:sm_crn", parameters.CERTIFICATE_ID, false);
            expect(data).toEqual(["cm_location", "sm_location", "sm_crn", '.test.', '.test.', false]);
        });

    })
});
