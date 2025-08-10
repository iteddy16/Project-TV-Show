function setup() {
  const rootElem = document.getElementById("root");
  const countElem = document.getElementById("episodeCount");
  const episodeSelect = document.getElementById("episodeSelect");
  const showSelect = document.getElementById("showSelect");
  const input = document.getElementById("q");

  // Cache variables - so we never fetch same URL twice
  let allShows = null;
  let episodeCache = {};
  let currentEpisodes = [];

  loadAllShows(showSelect, allShows).then(() => {
    showSelect.addEventListener("change", function () {
      const selectedShowId = showSelect.value;

      if (selectedShowId) {
        const episodeUrl =
          "https://api.tvmaze.com/shows/" + selectedShowId + "/episodes";
        console.log("Episode URL:", episodeUrl);
        fetch(episodeUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok.");
            }
            return response.json();
          })
          .then((episodes) => {
            makePageForEpisodes(episodes, countElem, episodeSelect);
          });
      }
    });
  });
}
function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

function makePageForEpisodes(episodesList, countElem, episodeSelect) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  episodeSelect.innerHTML = "";

  countElem.textContent = `Displaying ${episodesList.length} episodes`;
  episodesList.forEach((episode) => {
    const episodeCode = formatEpisodeCode(episode);

    const option = document.createElement("option");
    option.textContent = `${episode.name} - ${episodeCode}`;
    episodeSelect.appendChild(option);

    const section = document.createElement("section");
    section.classList.add("episode-card");
    section.id = `episode-${episode.id}`;

    const title = document.createElement("h2");
    title.classList.add("episode-title");
    title.textContent = `${episode.name} – ${episodeCode}`;
    section.appendChild(title);

    const image = document.createElement("img");
    image.src = episode.image?.medium || "";
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
      console.error("Error loading shows:", error);
    });
}

window.onload = setup;
