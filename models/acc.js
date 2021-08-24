const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { callToken } = require('../helpers/token')


const accSchema = new Schema({
    token: {
        type: String,
        required: true
    } 
}, { timestamps: true });

const Account = mongoose.model('Account', accSchema);

const checkToken = function checkToken() 
{
    return new Promise((resolve, reject) => {
        Account.find()
            .then(async (result) => {
                // if db is empty, will calltoken and save token in DB
                if (result[0] === undefined)
                {
                    let access_token = await callToken().catch((err) => console.log(err));
                    
                    const account = new Account({
                        token: access_token
                    });

                    account.save()
                        .then((result) => {
                            console.log("made new doc in DB")
                            // returns object of info from newly made document
                            resolve({
                                access_token: result.token,
                                databaseID: result._id
                            })
                        })
                }
                // if db is not empty, wil set access_token var to the established token in DB 
                else if (result[0])
                {
                    console.log("already has in db")
                    let databaseID = result[0]._id;
                    let access_token = result[0].token;

                    resolve({
                        access_token,
                        databaseID
                    })
            }

        })
        .catch((err) => reject(err))

    }
)}

module.exports = {Account, checkToken: checkToken};