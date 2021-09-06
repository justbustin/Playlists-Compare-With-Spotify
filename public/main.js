// how the parsing works
//let link = "https://open.spotify.com/playlist/3TJG5xIEdVW4WqT3YcGpz0?si=077d6c12f13c4440";
//console.log(link.substring(34, 56));
let x = false;
let changed = true;

const mapLeft = new Map();
const mapRight = new Map();

document.addEventListener('aos:in:test', () => {
    if (x == true)
    {
        return;
    }
    AOS.refreshHard()
    x = true;
})

function displayDetails(e)
{
    let detailsRow = e.nextElementSibling;
    console.log(e.id)
    console.log(detailsRow.myParams)
    if (e.id == "artistRow")
    {
        if (detailsRow.myParams != true)
        {
            // displayStyle
            detailsRow.style.display = "flex"
            detailsRow.style.flexDirection = "row"
            detailsRow.style.position = "relative"
            detailsRow.style.left = 0;
            detailsRow.style.flexWrap = "wrap"
            detailsRow.style.backgroundColor = "rgb(70, 70, 70)"
            detailsRow.style.opacity = 1;
            detailsRow.style.margin = "20px"
            detailsRow.style.marginBottom = "-30px"
            detailsRow.style.transform =  "translateY(-20px)"

            detailsRow.myParams = true;
        }
        else
        {
            detailsRow.style = null;

            detailsRow.myParams = false;
        }
    }
    else
    {
        if (detailsRow.myParams != true)
        {
            // displayStyle
            detailsRow.style.display = "flex"
            detailsRow.style.flexDirection = "row";
            detailsRow.style.transform =  "translateY(-15px)"
            detailsRow.style.backgroundColor = "rgb(70, 70, 70)"
            detailsRow.style.opacity = 1;
            detailsRow.style.margin = "0"
            detailsRow.style.position = "relative"
            detailsRow.style.gridColumn = "1 / -1"
            detailsRow.style.left = 0;

            detailsRow.myParams = true;

        }
        else
        {
            detailsRow.style = null;

            detailsRow.myParams = false;
        }
    }
}

function collapse(e)
{
    let showingRow = e.parentElement.previousElementSibling;
    let detailsRow = e.parentElement;

    showingRow.scrollIntoView();
    detailsRow.style = null;
}

function topFunction() {
    document.querySelector("#demo").scrollIntoView();
}

//Get the button
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 1500 || document.documentElement.scrollTop > 1500) {
    mybutton.style.display = "block";
    
  } else {
    mybutton.style.display = "none";
  }
}

// return html through a fetch call api
async function callHTML(bodyData)
{
    let jsonData = JSON.stringify(bodyData);
    const response = await fetch('playlists/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: jsonData
    });
    const data = response.text();
    return data;
}

// receives playlists
async function callPlaylist(playlistID) 
{
    let res = (playlistID.substring(34, 56) != "") ? playlistID.substring(34, 56) : playlistID;
    console.log("result from parse: " + res);
    const response = await fetch(`playlists/${res}`);
    
    const data = await response.json();
    return data;
}

// adds playlist id to link
function place(e)
{
    if (e.id == "addButton")
    {
        document.querySelector("#inputOne").value = e.value; 
    }
    else
    {
        document.querySelector("#inputTwo").value = e.value;
    }
    
}

//formOne is box for submit and input
let formOne = document.querySelector("#formOne");
//formTwo is 2nd box for submit and input
let formTwo = document.querySelector("#formTwo");
//button dom
let loginBtn = document.querySelector("#log");

formOne.addEventListener("submit", onSubmit);
formOne.param = "One";
formTwo.addEventListener("submit", onSubmit);
formTwo.param = "Two"

loginBtn.addEventListener("click", redirectSpotAuth);

function redirectSpotAuth(e)
{
    window.location.href = "auth";
}

function onSubmit(e)
{
    e.preventDefault();

    let currentBoxID = e.currentTarget.id // gets HTML id from form
    let boxSelect = e.currentTarget.param; // string param to decide which box

    //uses the e object to basically get everything inside the html LOL IDK A BETTER WAY
    const playlistLink = document.querySelector(`#input${boxSelect}`);
    const queryImg = document.querySelector(`#img${boxSelect}`);
    const queryPlaylistName = document.querySelector(`#playName${boxSelect}`);
    const queryUsername = document.querySelector(`#name${boxSelect}`);
    const queryTracks = document.querySelector(`#tracks${boxSelect}`);

    if (playlistLink.value == "")
    {
        playlistLink.value = "";
        document.querySelector("#msg").innerHTML = "<h2>please input a valid link or id</h2>";

        setTimeout(() => {
            document.querySelector("#msg").innerHTML = "";
        }, 5000);
        return;
    }

    //calls the api function (api call done by server and server returns the data back here)
    callPlaylist(playlistLink.value).then(data => {
        //clears map before calling playlist if formOne
        if (currentBoxID == "formOne")
        {
            mapLeft.clear();
        }
        else{
            mapRight.clear();
        }

        // clears tracks
        queryTracks.innerHTML = "";

        queryImg.value = data.id;
        queryImg.src = data.images[0].url;

        //sets name of the playlist to the correct id
        queryPlaylistName.innerHTML = `<a href="${data.external_urls.spotify}" target="_blank">${data.name}</a>`;

        //sets name of the user to the correct id
        queryUsername.innerHTML = `<a href="${data.owner.external_urls.spotify}" target="_blank">${data.owner.display_name}</a>`;
        
        
        //takes the data and goes inside tracks and then items
        //which is an array given to us from the fetch data
        //use forEach function to do a function for each of the track
        data.tracks.items.forEach(song => {
            if (song.track.uri.substr(0, 13) != "spotify:local")
            {
                let fullKey = song.track.name + 'artist:' + song.track.artists[0].name;
                if (e.path[0].id == "formOne")
                {
                    mapLeft.set(fullKey, {songName: song.track.name, artist: song.track.artists[0].name, albumName: song.track.album.name, 
                        songImg: song.track.album.images[0].url, songID: song.track.id, artistID: song.track.artists[0].id, albumLink: song.track.album.external_urls.spotify});   
                }
                else if (e.path[0].id == "formTwo")
                {
                    mapRight.set(fullKey, {songName: song.track.name, artist: song.track.artists[0].name, albumName: song.track.album.name, 
                        songImg: song.track.album.images[0].url, songID: song.track.id, artistID: song.track.artists[0].id, albumLink: song.track.album.external_urls.spotify});

                }

            }
        })
        let objMain;
        if (currentBoxID == "formOne")
            {
                const arr = Array.from(mapLeft, ([name, value]) => ({name, value}))
                objMain = {items: arr};  
            }
            else if (currentBoxID == "formTwo")
            {
                const arr = Array.from(mapRight, ([name, value]) => ({name, value}))
                    objMain = {items: arr};
            }

            callHTML(objMain).then(htmlData => {
                queryTracks.innerHTML = htmlData;
                
            })
        

        playlistLink.value = "";
        changed = true;
    })
    .catch((err) => {

        playlistLink.value = "";
        document.querySelector("#msg").innerHTML = "<h2>please input a valid link or id</h2>";

        //queryImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEX///+nxBvIAAAASElEQVR4nO3BgQAAAADDoPlTX+AIVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwDcaiAAFXD1ujAAAAAElFTkSuQmCC";
        //queryPlaylistName.innerHTML = "";
        //queryUsername.innerHTML = "";

        setTimeout(() => {
            document.querySelector("#msg").innerHTML = "";
        }, 5000);
    });
}

function compare()
{
    if (changed == false || mapLeft.size == 0 || mapRight.size == 0)
    {
        document.querySelector("#msg").innerHTML = "<h2>please choose a new playlist before comparing</h2>";

        setTimeout(() => {
            document.querySelector("#msg").innerHTML = "";
        }, 5000);

        return;
    }

    changed = false;

    let queryTracks = document.querySelector("#same");
    
    // access value by saying testData[i].innerText

    const mapSame = new Map();
    const mapArtist = new Map();
    const mapAlbum = new Map();

    queryTracks.innerHTML = "";
    /*
    get full: tracks[i].innerText
    get song name: tracks[i].firstChild.data
    get artist name: tracks[i].firstChild.firstElementChild.innerText
    */


    for (let [key, value] of mapLeft)
    {
        

        if (mapRight.has(key))
        {
            mapSame.set(key, value);
        }

        // check if artist same and add song
        // make map value an object. artist: artist, songs: array of songs
        // 

        if (!mapArtist.has(value.artist))
        {
            mapArtist.set(value.artist, {artist: value.artist, songs: [{songName: value.songName, songImg: value.songImg, albumLink: value.albumLink}] })
           
        }
        else
        {
            mapArtist.get(value.artist).songs.push({songName: value.songName, songImg: value.songImg, albumLink: value.albumLink})
        }

        // adds all albums 
        if (!mapAlbum.has(value.albumName))
        {
           
            mapAlbum.set(value.albumName, {albumName: value.albumName, albumLink: value.albumLink, songs: [{songName: value.songName, songImg: value.songImg}] })
        }
        else
        {
            mapAlbum.get(value.albumName).songs.push({songName: value.songName, songImg: value.songImg})
        }
        
    }

    const artistSame = new Map();
    const albumSame = new Map();

    for (let [key, value] of mapRight)
    {
        if (mapArtist.has(value.artist))
        {
            if (!artistSame.has(value.artist))
            {

                artistSame.set(value.artist, {artistID: value.artistID, artist: value.artist, songsLeft: mapArtist.get(value.artist).songs, songsRight: [{songName: value.songName, songImg: value.songImg, albumLink: value.albumLink}] })
                
                
            }
            else // if artistSame does have value.artist key
            {
                artistSame.get(value.artist).songsRight.push({songName: value.songName, songImg: value.songImg, albumLink: value.albumLink})
            }
        }
        
        if (mapAlbum.has(value.albumName))
        {
            if (!albumSame.has(value.albumName))
            {

                albumSame.set(value.albumName, {albumIMG: value.songImg, albumLink: value.albumLink, songsLeft: mapAlbum.get(value.albumName).songs, songsRight: [{songName: value.songName, songImg: value.songImg}] })
                
                
            }
            else // if AlbumSame does have value.albumName key
            {
                albumSame.get(value.albumName).songsRight.push({songName: value.songName, songImg: value.songImg})
            }
        }
    }

    //calls server to render html with all this compare data and then ptus it on wbesite lets goo
    //if (mapSame.size > 0 || artistSame.size > 0 || albumSame.size > 0)
    //{   
        const arr = Array.from(mapSame, ([name, value]) => ({name, value}))
        const objMain = {items: arr};
        
        objMain.compare = true;
        objMain.artistSame = Array.from(artistSame, ([name, value]) => ({name, value}));
        objMain.albumSame = Array.from(albumSame, ([name, value]) => ({name, value}))

        callHTML(objMain).then(htmlData => {
            
            queryTracks.innerHTML = htmlData;
            
            x = false;
        })
    
}