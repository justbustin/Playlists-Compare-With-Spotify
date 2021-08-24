const express = require('express')
const router = express.Router()

const {callToken} = require('../helpers/token')

const Account = require('../models/acc')
const api = require('../api');


router.get('/:id', (req, res, next) => {
    const playlistID = req.params.id;

    tokenBeingUsed = referenceData.access_token;

    if (req.session.isAuth)
    {
        tokenBeingUsed = req.session.accessToken;
    }

    // passes in access token and parameters given
    api.apiCall(tokenBeingUsed, playlistID)
    .then((data) => {
        console.log("success on /:id")
        res.set({ 'Content-Type': 'application/json'});
        res.send(data);
    })
    .catch(e => {
        // e is the object given back from my api code on .reject
        
        console.log("Error: ", e);
        const errorHandling = JSON.parse(e);

        //when token gets expired, creates new one and also saves to DB
        if (errorHandling.error.message == "The access token expired") 
        {
            callToken()
                .then(async (data) => {
                    referenceData.access_token = data
                    await Account.Account.updateOne({_id: referenceData.databaseID}, {token: referenceData.access_token});
                    console.log("updated");
                })
        }

        res.sendStatus(404);
        return;
    });
})

router.post("/compare", (req, res) => {
    //how object is:
    /*
    {
    name: "Who's Lovin' You - Stereo\nThe Temptations",
    value: {
      songName: "Who's Lovin' You - Stereo",
      artist: 'The Temptations',
      albumName: 'The Temptations Sing Smokey',
      songImg: 'https://i.scdn.co/image/ab67616d0000b2731a5b6271ae1c8497df20916e',
      artistID: '3RwQ26hR2tJtA8F9p2n7jG'
    }
  }
    */
   console.log(req.body)
   if (req.body.compare)
   {
       if (req.session.isAuth)
       {
           let tempArr = []
           let limit = req.body.artistSame.length < 51 ? req.body.artistSame.length : 50 

           for (let i = 0; i < limit; i++)
           {
               tempArr.push(req.body.artistSame[i].value.artistID)
           }
           api.getSeveralArtists(req.session.accessToken, tempArr).then(data => {
               let useful = JSON.parse(data)
               console.log(useful);

               res.render('realCompare.ejs', {data: req.body, artists: useful.artists});
           })
       }
       else
       {
            let tempArr = []
            let limit = req.body.artistSame.length < 51 ? req.body.artistSame.length : 50 

            for (let i = 0; i < limit; i++)
            {
                tempArr.push(req.body.artistSame[i].value.artistID)
            }
            
            api.getSeveralArtists(referenceData.access_token, tempArr).then(data => {
                let useful = JSON.parse(data)
                console.log(useful);

                res.render('realCompare.ejs', {data: req.body, artists: useful.artists});
            })
       }
       //res.render('realCompare.ejs', {data: req.body});
   }
   else
   {
       res.render('compare', { data: req.body.items });
   }
})

module.exports = router