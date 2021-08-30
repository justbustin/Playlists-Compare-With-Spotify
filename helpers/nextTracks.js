const api = require('./api');

let callNextTracks = function callNextTracks(res, tokenBeingUsed, hasNext)
{
    //playlists w/ 100+ songs
    api.nextCall(tokenBeingUsed, hasNext)
    .then((response) => {
        responseTracks = JSON.parse(response)
            
        playlistTracks.tracks.items.push(...responseTracks.items)

        hasNext = responseTracks.next
        
        if (!hasNext)
        {
            let json = JSON.stringify(playlistTracks)
            res.send(json)
        }
        else
        {   
            // playlists w/ 200+ songs
            api.nextCall(tokenBeingUsed, hasNext)
            .then(received => {
                receivedTracks = JSON.parse(received)
                    
                playlistTracks.tracks.items.push(...receivedTracks.items)

                let json = JSON.stringify(playlistTracks)
                res.send(json)
            })
        }
    })
}

module.exports = {callNextTracks: callNextTracks}