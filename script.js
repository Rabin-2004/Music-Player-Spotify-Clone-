console.log("JS start!!!");
let currentSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    const roundedSeconds = Math.floor(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img src="music.svg" alt="music" class="invert">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Artist</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img src="play.svg" alt="play" class="invert">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".songlist ul").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  let anchors = div.getElementsByTagName("a");
  div.innerHTML = response;
};

async function main() {
    await getSongs(`songs/ncs`);
    playMusic(songs[0], true);

    //display all the albums on the page


    //attach an event listener to play/pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 <= songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

main();
