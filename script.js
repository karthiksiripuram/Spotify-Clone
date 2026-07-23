console.log("Lets write Java script");
let currentSong = new Audio();
let songs;
let CurrFolder;
let cardContainer = document.querySelector(".cardContainer")

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    minutes = String(minutes).padStart(2, '0');
    remainingSeconds = String(remainingSeconds).padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
}

async function getSongs(folder) {
    CurrFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    //Show all songs in the playlist
    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Artist Name</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div></li>`;
    }

    //Attach Eventlistener to each song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
        console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${CurrFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0]);
            //Get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();


            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="60" fill="#22C55E" />
                            <polygon points="52,42 52,86 88,64" fill="#000000" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h4>${response.title}</h4>
                    <p>${response.description}</p>
                </div>`
        }
    }
    //Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}

//Add eventlistener to hamburger
const sidebar = document.getElementById('sidebar')
function toggleSidebar() {
    sidebar.classList.toggle('show')
}
const hamburger = document.querySelector(".hamburger");

document.addEventListener("click", (e) => {

    // If the click is NOT inside the sidebar
    // and NOT on the hamburger icon
    if (
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)
    ) {
        sidebar.classList.remove("show");
    }

});

async function main() {

    //Get list of all songs
    await getSongs("songs/Hindi")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbum()


    //Add Eventlistener to play,pause,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })
    //Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //Add eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add eventlistener to close button
    const sidebar = document.getElementById('sidebar')
    function toggleSidebar() {
        sidebar.classList.toggle('show')
    }

    //Add an Eventlistener to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add eventlistener to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Add eventlistener to mute the song
    document.querySelector(".volume").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = "0"
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .2;
            document.querySelector(".range").getElementsByTagName("input")[0].value = "20"
        }

    })

}
main()
