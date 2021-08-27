require('dotenv').config();

const https = require ('https');
const queryString = require ('querystring');

const client = "46d2e73d137147a0b71385576ef05ba1";
//const secret = "1afc42f00a154ab49e809a8bac9b11d2";


const options = {
    host: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic ' + Buffer.from(client + ':' + process.env.SECRET).toString('base64')
    },   
}


const form = {
    grant_type:'client_credentials'
}

const authCodeForm = {
    grant_type:'authorization_code',

}

let token = function callToken(grant_type, code){

    return new Promise((resolve, reject) => {
        let body = "";
        const req = https.request(options, (res) => {
            //console.log(res)
            console.log('statusCode:' + res.statusCode);
            
            res.on("data", d =>{
                body += d;
                //console.log(body);
            })
    
            res.on("end", () => {
                //console.log(body);
                resolve(body);
            })
        })
    
        req.on('error', error => {
            console.error("error: " + error);
            reject(new Error('something went wrong with getting token'));
        })
        
        if (grant_type == "client_credentials")
        {
            req.write(queryString.stringify(form));
        }
        else
        {
            req.write(queryString.stringify({
                grant_type:'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:3000/auth/oauth-callback'
            }));
        }
        
        req.end();
    })
   
}

let apiCall = function callAPI(token, playlistID){

    return new Promise((resolve, reject) => {
    
        https.get(`https://api.spotify.com/v1/playlists/${playlistID}`, 
        {
        headers: { 'Authorization' : `Bearer ${token}`}
        }, 
        (resp) => {
            console.log("inside the https.get");

            let body = '';
            resp.on('data', d => {
                body+=d;
            });

            resp.on('end', () => {

                if (resp.statusCode != 200) {
                    console.log("non-200 response status code:", resp.statusCode);
                    reject(body);
                    return;
                }

                console.log("api called successfully");
                resolve(body);
            });
        })

    })
}

let getUser = function getUser(token)
{
    return new Promise((resolve, reject) => {
        let body = "";

        https.get('https://api.spotify.com/v1/me', { headers: { 'Authorization' : `Bearer ${token}`}}, (resp) => {
            console.log("inside the https.get");

            let body = '';
            resp.on('data', d => {
                body+=d;
            });

            resp.on('end', () => {

                if (resp.statusCode != 200) {
                    console.log("non-200 response status code:", resp.statusCode);
                    reject(body);
                    return;
                }

                console.log("api called successfully");
                resolve(body);
            });
        })
    })
}

let createPlaylist = function createPlaylist(token, userID, name)
{
    return new Promise((resolve, reject) => {

        let body = "";
        
        const req = https.request({
            host: 'api.spotify.com',
            path: `/v1/users/${userID}/playlists`,
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type' : 'application/json'
            }
        }, (res) => {
            //console.log(res)
            console.log('statusCode:' + res.statusCode);
            
            res.on("data", d =>{
                
                body += d;
                //console.log(body);
            })
    
            res.on("end", () => {
                //console.log(body);
                resolve(body);
            })
        })

        req.on('error', error => {
            console.error("error: " + error);
            reject(new Error('something went wrong with creating playlist'));
        })

        const opt = {
            name: name,
            public: false
        }

        req.write(JSON.stringify(opt));

        req.end();

    })
}

let getListPlaylists = function getListPlaylists (token, userID)
{
    return new Promise((resolve, reject) => {
        let body = "";
        
        const req = https.request({
            host: 'api.spotify.com',
            path: `/v1/users/${userID}/playlists?limit=25`,
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type' : 'application/json'
            }
        }, (res) => {
            //console.log(res)
            console.log('statusCode:' + res.statusCode);
            
            res.on("data", d =>{
                
                body += d;
                //console.log(body);
            })
    
            res.on("end", () => {
                //console.log(body);
                resolve(body);
            })
        })

        req.on('error', error => {
            console.error("error: " + error);
            reject(new Error('something went wrong with getting list of playlists from user'));
        })

        req.end();
    })
    
}

let getSeveralArtists = function getSeveralArtists(token, artistID)
{
    let ids = artistID.toString();
    console.log("ids: " + ids);

    return new Promise((resolve, reject) => {
        let body = "";
        
        const req = https.request({
            host: 'api.spotify.com',
            path: `/v1/artists?ids=${ids}`,
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type' : 'application/json'
            }
        }, (res) => {
            //console.log(res)
            console.log('statusCode:' + res.statusCode);
            
            res.on("data", d =>{
                
                body += d;
                //console.log(body);
            })
    
            res.on("end", () => {
                //console.log(body);
                resolve(body);
            })
        })

        req.on('error', error => {
            console.error("error: " + error);
            reject(new Error('something went wrong with getting several artists'));
        })

        req.end();
    })
}

module.exports = {token: token, apiCall: apiCall, getUser: getUser, createPlaylist: createPlaylist, getListPlaylists: getListPlaylists,
                  getSeveralArtists: getSeveralArtists};