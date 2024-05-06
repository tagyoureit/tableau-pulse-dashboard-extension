import express = require('express');
import cors from 'cors';
import axios from "axios";
import CryptoJS from 'crypto-js'; // Importing CryptoJS properly
import path = require('path');
import https from 'https';
import fs from 'fs';
import { IGetMetricResponse, IListSubscriptionResponse, IMetricSingleDefinitionResponse, IInsightBundleRequest, OutputFormat } from './extension/Interface'
const uuid = require('uuid');
import { tokenManager, TokenEntry } from './extension/TokenManager'

// const settings: ISettings = {
//     caClientId: '6b828aa5-dd31-4c35-9be9-fddf7e0b7933',
//     caSecretId: 'ad7949278-f28e-48cf-8313-765c17972961',
//     caSecretValue: 'dwPRgqnLDAO4G5GOrgmnylkAK5ODXxKfS/hEhTyZtzA=',
//     siteName: 'rgdemosite',
//     tableauUrl: 'https://10az.online.tableau.com',
//     userName: 'rgoldin@salesforce.com',
// };
const settings: ISettings = {
    caClientId: '01232e79-1fc4-4952-94ff-addbdb762b0a',
    caSecretId: '936b19a6-ea4e-49c2-b9cc-60e997e61410',
    caSecretValue: 'pWZar0FyoOJoHgM0MkvSghck1mjq9oI/VI4gyq4pL8U=',
    siteName: 'rgtableauonlinebetasite',
    tableauUrl: 'https://10ax.online.tableau.com',
    userName: 'rgoldin@salesforce.com',
};

const apiVersion = "3.21";

// const tableauUrl = "https://10az.online.tableau.com"; // Tableau Cloud url. For example: "https://10ax.online.tableau.com"
// const caClientId = "6b828aa5-dd31-4c35-9be9-fddf7e0b7933"; // Connected App Client ID
// const caSecretId = "d7949278-f28e-48cf-8313-765c17972961"; // Connected App Secret ID
// const caSecretValue = "dwPRgqnLDAO4G5GOrgmnylkAK5ODXxKfS/hEhTyZtzA="; // Connected App Secret Value
// const siteName = "rgdemosite"; // Tableau Cloud Site Name. For example: "mySite"
// const userName = "rgoldin@salesforce.com" // Username. Normally the email address the user uses to log in Tableau Cloud. 

const tableauUrl = "https://10ax.online.tableau.com"; // Tableau Cloud url. For example: "https://10ax.online.tableau.com"
const siteName = "rgtableauonlinebetasite"; // Tableau Cloud Site Name. For example: "mySite"
const userName = "rgoldin@salesforce.com" // Username. Normally the email address the user uses to log in Tableau Cloud. 
const caClientId = "01232e79-1fc4-4952-94ff-addbdb762b0a"; // Connected App Client ID
const caSecretId = "936b19a6-ea4e-49c2-b9cc-60e997e61410"; // Connected App Secret ID
const caSecretValue = "pWZar0FyoOJoHgM0MkvSghck1mjq9oI/VI4gyq4pL8U="; // Connected App Secret Value

const app = express();
let token: string;
let userId: string;
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('dist'));
app.use((request, response, next) => {
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, api_key, Authorization'); // api_key and Authorization needed for Swagger editor live API document calls
    // res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    console.log("Request received...");
    console.log("FROM: ", request.url);
    console.log("METHOD: ", request.method);
    console.log("User-Agent: ", request.headers["user-agent"]);
    next();
});


async function apiAuth() {
    // first check to see if a token already exists

    // Get token
    const cachedToken = tokenManager.getToken(settings.caClientId, settings.caSecretId);
    console.log(cachedToken);
    if (cachedToken !== null) {
        console.log(`Returning cached, valid token instead of authenticating.`)
        return [cachedToken.token, cachedToken.userId];
    }

    console.log("Authenticating to Tableau through the API...")
    const myToken = getJWT();
    console.log(myToken);

    const credentials = {
        "credentials": {
            "jwt": myToken.token,
            "site": {
                "contentUrl": settings.siteName
            }
        }
    };
    const apiUrl = settings.tableauUrl + "/api/" + apiVersion + "/auth/signin";
    // [token, userId] = await apiAuth(credentials, apiUrl);\
    let apiResponse = await axios({
        method: "post",
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(credentials)
    })
    const token = apiResponse.data.credentials.token
    const userId = apiResponse.data.credentials.user.id
    // Add token entry with expiration time
    tokenManager.addToken(settings.caClientId, settings.caSecretId, userId, myToken.exp, token);
    return [token, userId]
}
app.put("/data", async (request, response) => {
    try {
        const settingsBody = request.body as ISettings;
        if (typeof settingsBody.caClientId === 'undefined' ||
            typeof settingsBody.caSecretId === 'undefined' ||
            typeof settingsBody.caSecretValue === 'undefined' ||
            typeof settingsBody.siteName === 'undefined' ||
            typeof settingsBody.tableauUrl === 'undefined' ||
            typeof settingsBody.userName === 'undefined'
        ) throw new Error(`Settings have not been successfully passed to the server.`);

        settings.tableauUrl = settingsBody.tableauUrl; // Tableau Cloud url. For example: "https://10ax.online.tableau.com"
        settings.siteName = settingsBody.siteName; // Tableau Cloud Site Name. For example: "mySite"
        settings.userName = settingsBody.userName // Username. Normally the email address the user uses to log in Tableau Cloud. 
        settings.caClientId = settingsBody.caClientId; // Connected App Client ID
        settings.caSecretId = settingsBody.caSecretId; // Connected App Secret ID

        let debug = true;
        if (debug) {
            console.log(settings.tableauUrl === tableauUrl);
            console.log(settings.siteName === siteName);
            console.log(settings.userName === userName);
            console.log(settings.caClientId === caClientId);
            console.log(settings.caSecretId === caSecretId);
            console.log(settings.caSecretValue === caSecretValue);
            settings.caSecretValue = settingsBody.caSecretValue; // Connected App Secret Value
        }

        // await getApiAuth()
        let [token, userId] = await apiAuth();
        let userSubscribedMetrics: string[] = await apiSubscribedMetrics(token, userId);
        let metricsArray = await apiMetricsArray(token, userSubscribedMetrics);
        let definitionIds = buildDefinitionIds(metricsArray);
        let definitionsArray = await apiDefinitionsArray(token, definitionIds);
        let insights = await apiInsights(token, definitionsArray, metricsArray);
        let detailInsights = await apiInsightsDetail(token, definitionsArray, metricsArray);

        response.status(200).json({ definitionsArray, metricsArray, insights, detailInsights }); // Shorthand for object property assignment
    } catch (error) {
        console.error('Error:', error);
        response.status(500).json({ error: 'An error occurred while fetching data from the API.' });
    }
});

app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint not found" })
});

function errorHandling(err: any, req: any, res: any, next: any) {
    res.status(500).json({ message: err.message });
}

app.use(errorHandling);
// Define your routes and middleware here

const PORT = process.env.PORT || 3000;

// Start the server
// Heroku terminates HTTPS at the router; the app only sees HTTP connections
// if (process.env.NODE_ENV === 'production') {
//     // Heroku provides SSL certificate through process.env
//     const sslKey = process.env.SSL_KEY;
//     const sslCert = process.env.SSL_CERT;

//     if (!sslKey || !sslCert) {
//         console.error('SSL key or certificate not provided by Heroku.');
//         process.exit(1);
//     }

//     const credentials = {
//         key: sslKey,
//         cert: sslCert
//     };

//     const httpsServer = https.createServer(credentials, app);

//     httpsServer.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });
// } else {
// In development, run without SSL
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// }

function base64url(source: any) {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
}

function getJWT() {
    // let userToken = "";
    // let siteId = "";
    // let userId = "";

    const header = {
        alg: "HS256",
        typ: "JWT",
        kid: settings.caSecretId,
        iss: settings.caClientId
    };
    let exp = Math.floor(new Date().getTime() / 1000) + 9 * 60; // Expires in 9 minutes
    const payload = {
        iss: settings.caClientId,
        exp: exp,
        jti: uuid.v4(),
        aud: "tableau",
        sub: settings.userName,
        scp: ["tableau:insights:embed", "tableau:insight_definitions_metrics:read", "tableau:insights:read"]
    };

    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const encodedHeader = base64url(stringifiedHeader);
    const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    const encodedPayload = base64url(stringifiedPayload);

    // Create Signature
    const signature = CryptoJS.HmacSHA256(encodedHeader + "." + encodedPayload, settings.caSecretValue);
    const encodedSignature = base64url(signature);

    // Concatenate JWT
    const jwtToken = encodedHeader + "." + encodedPayload + "." + encodedSignature;

    return { exp, token: jwtToken };
}

async function apiSubscribedMetrics(token: string, userId: string) {
    console.log("Getting User's subscribed metrics...")
    const myApi = await axios({
        method: "get",
        url: settings.tableauUrl + "/api/-/pulse/subscriptions?user_id=" + userId,
        headers: {
            'Content-Type': 'application/json',
            'X-Tableau-Auth': token,
        }
    });
    const secondResponse: IListSubscriptionResponse = myApi.data;
    return secondResponse.subscriptions.map((item: any) => item.metric_id);
}

async function apiMetricsArray(token: string, userSubscribedMetrics: string[]) {
    console.log("Getting Metric data...")
    let metricsArray: IGetMetricResponse[] = [];
    for (const n of userSubscribedMetrics) {
        const getMetric = await axios({
            method: "get",
            url: settings.tableauUrl + "/api/-/pulse/metrics/" + n,
            headers: {
                'Content-Type': 'application/json',
                'X-Tableau-Auth': token,
            }
        });
        const metricResponse: IGetMetricResponse = getMetric.data;
        metricsArray.push(metricResponse);
    }
    return metricsArray;
}

function buildDefinitionIds(metricsArray: IGetMetricResponse[]) {
    console.log("Getting Metric Definition data...")
    // const idDefinitionMap: any = {};
    const definitionIds: string[] = [];
    metricsArray.forEach((item, index) => {
        const { id, specification, definition_id } = item.metric;
        // idDefinitionMap[index] = {
        //     metric_id: id,
        //     metric_specification: specification,
        //     definition_id: definition_id
        // };
        definitionIds.push(definition_id);
    });
    console.log(definitionIds);
    return definitionIds;
}

async function apiDefinitionsArray(token: string, definitionIds: string[]) {
    console.log("Getting Metric Definition Default View...")
    let definitionsArray: IMetricSingleDefinitionResponse[] = [];
    for (const i of definitionIds) {
        // view can be one of "DEFINITION_VIEW_UNSPECIFIED" "DEFINITION_VIEW_BASIC" "DEFINITION_VIEW_FULL" "DEFINITION_VIEW_DEFAULT"
        const getDefinitions = await axios({
            method: "get",
            url: settings.tableauUrl + "/api/-/pulse/definitions/" + i + "?view=DEFINITION_VIEW_BASIC",
            headers: {
                'Content-Type': 'application/json',
                'X-Tableau-Auth': token,
            }
        });
        const definitionResponse: IMetricSingleDefinitionResponse = getDefinitions.data;
        definitionsArray.push(definitionResponse);
    }
    return definitionsArray;
}

async function apiInsights(token: string, definitionsArray: IMetricSingleDefinitionResponse[], metricsArray: IGetMetricResponse[]) {
    console.log("Getting Metrics Insights...")
    // Convert definitionsArray to a JSON object
    const definitionsJsonObject: IMetricSingleDefinitionResponse[] = JSON.parse(JSON.stringify(definitionsArray));

    const combinedObjectArray: IInsightBundleRequest[] = [];

    for (let i = 0; i < Math.min(metricsArray.length, definitionsJsonObject.length); i++) {
        const combinedObject: IInsightBundleRequest = {
            "bundle_request": {
                "version": 1,
                "options": {
                    "output_format": OutputFormat.TEXT,
                    "time_zone": "Europe/Madrid"
                },
                "input": {
                }
            }
        };
        let cloned = Object.assign({}, combinedObject)
        const metricInfo = metricsArray[i].metric;
        const definitionInfo = definitionsJsonObject[i].definition;

        // Populate the combined object based on the current index
        combinedObject.bundle_request.input = {
            "metadata": {
                "name": definitionInfo.metadata.name,
                "metric_id": metricInfo.id,
                "definition_id": definitionInfo.metadata.id
            },
            "metric": {
                "definition": {
                    "datasource": definitionInfo.specification.datasource,
                    "basic_specification": definitionInfo.specification.basic_specification,
                    "viz_state_specification": definitionInfo.specification.viz_state_specification,
                    "is_running_total": definitionInfo.specification.is_running_total
                },
                "metric_specification": metricInfo.specification,
                "extension_options": definitionInfo.extension_options,
                "representation_options": {
                    "type": "NUMBER_FORMAT_TYPE_NUMBER",
                    "number_units": {
                        "singular_noun": "hour",
                        "plural_noun": "hours"
                    },
                    "sentiment_type": definitionInfo.representation_options.sentiment_type,
                    "row_level_id_field": definitionInfo.representation_options.row_level_id_field,
                    "row_level_entity_names": definitionInfo.representation_options.row_level_entity_names
                },
                "insights_options": definitionInfo.insights_options
            }
        };
        combinedObjectArray.push(combinedObject);
    }

    const promises: any[] = [];
    combinedObjectArray.forEach(element => {
        promises.push(
            axios({
                method: "post",
                url: settings.tableauUrl + "/api/-/pulse/insights/ban",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tableau-Auth': token
                },
                data: JSON.stringify(element)
            })
        )
    });

    const banResults = await Promise.all(promises);

    return banResults.map(response => response.data.bundle_response.result);
}

async function apiInsightsDetail(token: string, definitionsArray: IMetricSingleDefinitionResponse[], metricsArray: IGetMetricResponse[]) {
    console.log("Getting full Metric Insights data...")
    // Convert definitionsArray to a JSON object
    const definitionsJsonObject: IMetricSingleDefinitionResponse[] = JSON.parse(JSON.stringify(definitionsArray));

    const combinedObjectArray: IInsightBundleRequest[] = [];

    for (let i = 0; i < Math.min(metricsArray.length, definitionsJsonObject.length); i++) {
        const combinedObject = {
            "bundle_request": {
                "version": 1,
                "options": {
                    "output_format": OutputFormat.TEXT,
                    "time_zone": "Europe/Madrid"
                },
                "input": {}
            }
        };
        let cloned = Object.assign({}, combinedObject)
        const metricInfo = metricsArray[i].metric;
        const definitionInfo = definitionsJsonObject[i].definition;

        // Populate the combined object based on the current index
        combinedObject.bundle_request.input = {
            "metadata": {
                "name": definitionInfo.metadata.name,
                "metric_id": metricInfo.id,
                "definition_id": definitionInfo.metadata.id
            },
            "metric": {
                "definition": {
                    "datasource": definitionInfo.specification.datasource,
                    "basic_specification": definitionInfo.specification.basic_specification,
                    "viz_state_specification": definitionInfo.specification.viz_state_specification,
                    "is_running_total": definitionInfo.specification.is_running_total
                },
                "metric_specification": metricInfo.specification,
                "extension_options": definitionInfo.extension_options,
                "representation_options": {
                    "type": "NUMBER_FORMAT_TYPE_NUMBER",
                    "number_units": {
                        "singular_noun": "hour",
                        "plural_noun": "hours"
                    },
                    "sentiment_type": definitionInfo.representation_options.sentiment_type,
                    "row_level_id_field": definitionInfo.representation_options.row_level_id_field,
                    "row_level_entity_names": definitionInfo.representation_options.row_level_entity_names
                },
                "insights_options": definitionInfo.insights_options
            }
        };
        combinedObjectArray.push(combinedObject);
    }

    const promises: any = [];
    combinedObjectArray.forEach(element => {
        promises.push(
            axios({
                method: "post",
                url: settings.tableauUrl + "/api/-/pulse/insights/detail",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tableau-Auth': token
                },
                data: JSON.stringify(element)
            })
        )
    });

    const detailResults = await Promise.all(promises);

    return detailResults.map(response => response.data.bundle_response.result);
}
