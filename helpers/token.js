const api = require('./api');

let callToken = async function callToken()
{
    const data = await api.token('client_credentials');
    console.log("calling token: ");
    //it returns json object so then parse and only get access token
    let access_token = JSON.parse(data).access_token;
    return access_token;
}

module.exports = {callToken: callToken}