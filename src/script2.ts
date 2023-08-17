// made a new script file for going beyond tutorial in case it doesn't work
const clientId = "c131aa95d6234bc8a1751d64eb173dcf";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile); // profile data logs to console
    //populateUI(profile); takes two objects since I didn't write a new method for populating new artists
    
    // need to add these for top artists and tracks- then create their own methods(?)
    const topArtists = await fetchTopArtists(accessToken);
    console.log(topArtists); // topArtists data logs to console
    populateUI(profile, topArtists);
}

export async function redirectToAuthCodeFlow(clientId: string) {
    // TODO: Redirect to Spotify authorization page
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/");
    // added additional scopes to add more data about user
    params.append("scope", "user-read-private user-read-email user-top-read user-read-recently-played");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function  getAccessToken(clientId: string, code: string) {
    // TODO: Get access token for code
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token: string): Promise<UserProfile> {
    // TODO: Call Web API
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

// will not uses types for this object just yet-just need to get it working
async function fetchTopArtists(token: string): Promise<any> {
    // TODO: Call Web API for top artist data
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

// need to add DOM commands to add top song type info to html and new object types
function populateUI(profile: UserProfile, topArtists: any) {
    // TODO: Update UI with profile data
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';

    // update with top artist data
    console.log(topArtists);
    document.getElementById("art1")!.innerText = topArtists.Array[0].name;
}