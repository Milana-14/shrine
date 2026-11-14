const CLIENT_ID = '161298425281459bad6422f5fc2e3306';
const CLIENT_SECRET = 'eb64adc9b272435ea6c06a1756be35b8';
const REFRESH_TOKEN = 'AQD76mZWtE1-Gepxbj-asUMdbAssvfD6_R0b-VmbKjS2Z5h0iDCbaDSS_uTEazwXqobWay9TtfPX2pXsHsEBQhZgpFq3zVbLLRuS3cStUJqD9dQW0mDA7B-wzc9O-ROE50c';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';


async function getAccessToken() {
    const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
        }),
    });

    return response.json();
}

async function updateNowPlaying() {
    try {
        const { access_token } = await getAccessToken();

        const response = await fetch(NOW_PLAYING_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const trackEl = document.getElementById('spotify-track');
        const artistEl = document.getElementById('spotify-artist');
        const coverEl = document.getElementById('spotify-cover');
        const eqEl = document.getElementById('spotify-eq');

        if (response.status === 204) {
            trackEl.textContent = 'She probably isnt listening to music rn...';
            trackEl.removeAttribute('href');
            artistEl.textContent = 'Offline';
            eqEl.classList.add('paused');
            return;
        }

        if (response.status > 400) {
            trackEl.textContent = 'The servers hate us...';
            trackEl.removeAttribute('href');
            artistEl.textContent = 'STATUS CODE: ' + response.status;
            eqEl.classList.add('paused');
            return;
        }

        const song = await response.json();

        if (!song || !song.item) {
            trackEl.textContent = 'Offline...';
            artistEl.textContent = 'Nothing is playing';
            eqEl.classList.add('paused');
            return;
        }

        const isPlaying = song.is_playing;
        const title = song.item.name;
        const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
        const albumImageUrl = song.item.album.images[0]?.url;
        const songUrl = song.item.external_urls.spotify;

        trackEl.textContent = title;
        trackEl.href = songUrl;
        artistEl.textContent = artist;
        if (albumImageUrl) coverEl.src = albumImageUrl;

        if (isPlaying) {
            eqEl.classList.remove('paused');
        } else {
            eqEl.classList.add('paused');
        }

    } catch (error) {
        console.error('Ошибка Spotify API:', error);
    }
}

updateNowPlaying();
setInterval(updateNowPlaying, 100000);