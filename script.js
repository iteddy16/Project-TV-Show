let currentEpisodes = [];
let cachedShows = [];
let cachedEpisodes = {};

  const rootElem = document.getElementById("root");
  const controls = document.getElementById("controls");

  document.addEventListener("DOMContentLoaded", setup);

async function setup() {
  try {
    if (cachedShows.length === 0) {
      const res = await fetch("https://api.tvmaze.com/shows");
      if (!res.ok) throw new Error("Network error");
      cachedShows = await res.json();
      cachedShows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    }
    showShowsListing();
  } catch (err) {
    rootElem.innerHTML = `<p class="error-message">Oops! Something went wrong loading shows.</p>`;
    console.error(err);
  }
}








function formatEpisodeCode(episode) {
  return (
    "S" +
    String(episode.season).padStart(2, "0") +
    "E" +
    String(episode.number).padStart(2, "0")
  );
}

function makePageForEpisodes(episodesList, countElem, episodeSelect) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  episodeSelect.innerHTML = "";

  countElem.textContent = "Displaying " + episodesList.length + " episodes";

  episodesList.forEach((episode) => {
    const episodeCode = formatEpisodeCode(episode);

    const option = document.createElement("option");
    option.textContent = episode.name + " - " + episodeCode;
    option.value = episode.id; // Needed for scrolling
    episodeSelect.appendChild(option);

    const section = document.createElement("section");
    section.classList.add("episode-card");
    section.id = "episode-" + episode.id;

    const title = document.createElement("h2");
    title.classList.add("episode-title");
    title.textContent = episode.name + " – " + episodeCode;
    section.appendChild(title);

    const image = document.createElement("img");
    let imgUrl =
      episode.image && episode.image.medium
        ? episode.image.medium
        : "https://via.placeholder.com/210x295?text=No+Image";
    imgUrl = imgUrl.replace(/^http:/, "https:"); // force HTTPS
    image.src = imgUrl;
    image.alt = episode.name;
    section.appendChild(image);

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary || "No summary available.";
    section.appendChild(summary);

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = "View on TVMaze";
    section.appendChild(link);

    rootElem.appendChild(section);
  });
}

async function loadAllShows(showSelect, allShows) {
  return fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.json();
    })
    .then((shows) => {
      shows.sort((a, b) => a.name.localeCompare(b.name));
      showSelect.innerHTML = "";

      shows.forEach((show) => {
        const option = document.createElement("option");
        option.textContent = show.name;
        option.value = show.id;
        showSelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

window.onload = setup;
