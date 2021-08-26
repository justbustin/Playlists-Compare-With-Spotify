console.log("working");

// how the parsing works
//let link = "https://open.spotify.com/playlist/3TJG5xIEdVW4WqT3YcGpz0?si=077d6c12f13c4440";
//console.log(link.substring(34, 56));
let x = false;
let changed = true;

const mapLeft = new Map();
const mapRight = new Map();


document.addEventListener('aos:in:test', () => {
    if (x == false)
    {
        AOS.refreshHard()
        x = true;
    }
    
})

function topFunction() {
    document.body.scrollTop = 800;
    document.documentElement.scrollTop = 800;
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

//so you can indeed return html through a fetch call apis dfbnasdiugnskjdngfsdfkajhng
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



async function callPlaylist(playlistID) 
{
    let res = (playlistID.substring(34, 56) != "") ? playlistID.substring(34, 56) : playlistID;
    console.log("result from parse: " + res);
    const response = await fetch(`playlists/${res}`);
    console.log(response);
    const data = await response.json();
    return data;
}

function place(e)
{
    if (e.id == "addButton")
    {
        console.log(e.value);
        document.querySelector("#inputOne").value = e.value; 
    }
    else
    {
        console.log(e.value);
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
formTwo.addEventListener("submit", onSubmit);

loginBtn.addEventListener("click", redirectSpotAuth);

function redirectSpotAuth(e)
{
    console.log("hello");
    window.location.href = "auth";
}

function onSubmit(e)
{

    e.preventDefault();
    console.log(e);

    //uses the e object to basically get everything inside the html LOL IDK A BETTER WAY
    const playlistLink = e.path[1].firstElementChild[0];
    const queryImg = e.path[1].children[1].firstElementChild;
    const queryPlaylistName = e.path[1].children[2].children[0];
    const queryUsername = e.path[1].children[2].children[1];
    const queryTracks = e.path[1].children[3];

    console.log(`Playlist link: ${playlistLink.value}`);

    if (playlistLink.value == "")
    {
        console.log("error");

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
        if (e.path[0].id == "formOne")
        {
            mapLeft.clear();
        }
        else{
            mapRight.clear();
        }

        // clears tracks
        queryTracks.innerHTML = "";

        console.log("inside callPlaylist");
        console.log(data);
        queryImg.value = data.id;
        console.log("REEEEEEEEEEEEEEEEE: " + queryImg.value);
        queryImg.src = data.images[0].url;

        //sets name of the playlist to the correct id
        queryPlaylistName.innerHTML = data.name;
        //sets name of the user to the correct id
        queryUsername.innerHTML = data.owner.display_name;
        
        
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
        if (e.path[0].id == "formOne")
            {
                const arr = Array.from(mapLeft, ([name, value]) => ({name, value}))
                objMain = {items: arr};  
            }
            else if (e.path[0].id == "formTwo")
            {
                const arr = Array.from(mapRight, ([name, value]) => ({name, value}))
                    objMain = {items: arr};
            }

            callHTML(objMain).then(htmlData => {
                console.log(htmlData);
                queryTracks.innerHTML = htmlData;
                
            })
        

        playlistLink.value = "";
        console.log("done with async call");
        changed = true;
    })
    .catch((err) => {
        console.log("err: " + err);

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

    //console.log(testData)

    let artistPlaylists = {};

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

    console.log("aristSame:")
    console.log(artistSame)
    console.log("albumSame:")
    console.log(albumSame)

    //calls server to render html with all this compare data and then ptus it on wbesite lets goo
    //if (mapSame.size > 0 || artistSame.size > 0 || albumSame.size > 0)
    //{   
        const arr = Array.from(mapSame, ([name, value]) => ({name, value}))
        const objMain = {items: arr};
        console.log(arr);
        
        objMain.compare = true;
        objMain.artistSame = Array.from(artistSame, ([name, value]) => ({name, value}));
        objMain.albumSame = Array.from(albumSame, ([name, value]) => ({name, value}))
        console.log("objMain:")
        console.log(objMain)
        callHTML(objMain).then(htmlData => {
            
            queryTracks.innerHTML = htmlData;
            
            x = false;
        })
    //}

    // for tomorrow
    // basically just make the page look nice
    // clean the data ina  way so you can find same artists, songs, playlists
    // for comparing, the object we send will be different and it'll allow us to display the similarities
    // yeee
    console.log(mapSame);
    
}