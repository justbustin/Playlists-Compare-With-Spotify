# Playlists-Compare-With-Spotify
Web application that allows users to compare their Spotify playlists and others'!

live link: https://playlistscompare.me/

![PlaylistsCompare1](https://user-images.githubusercontent.com/77251579/131211397-8198b890-a84e-4212-8f3b-4772c3fc077c.png)

Built using MongoDB, Express, NodeJS, EJS, vanilla JavaScript, CSS, Animate on Scroll, and of course, the Spotify API. This was not made by Spotify nor was it endorsed by them. 

## Installation:
Clone repository first
<pre>
    <code>
        git clone https://github.com/justbustin/Playlists-Compare-With-Spotify.git
    </code>
</pre>
Use npm to install packages
<pre>
    <code>
        npm i
    </code>
</pre>

Note: You first need the necessary environment variables to run this application. Be sure to:
1. Create a Spotify app on the Spotify developers dashboard
2. Create a MongoDB database on Atlas

Afterwards, create a .env file anywhere you want and set the environment variables accordingly:
<pre>
    <code>
        SPOTIFY_CLIENT="example"
        SECRET="example"
        REFRESH_TOKEN_SECRET='example'
        COOKIE_SECRET='example'
        MONGODB_SECRET='example'
        MONGODB_CLIENT='example'
    </code>
</pre>

Run app.js!
<pre>
    <code>
        node app
    </code>
</pre>
