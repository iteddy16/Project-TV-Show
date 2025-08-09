function setup() {
  const rootElem = document.getElementById("root");
  const countElem = document.getElementById("episodeCount");
  const select = document.getElementById("episodeSelect");
  const input = document.getElementById("episodeSearch");

  // Show loading message
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading episodes, please wait...";
  rootElem.appendChild(loadingMessage);

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.json();
    })
    .then((episodes) => {
      rootElem.removeChild(loadingMessage);

      makePageForEpisodes(episodes);
      countElem.textContent = `Displaying ${episodes.length} / ${episodes.length} episodes`;

      // Populate dropdown
      episodes.forEach((episode) => {
        const option = document.createElement("option");
        option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
        option.value = episode.id;
        select.appendChild(option);
      });

      // Smooth scroll to selected episode
      select.addEventListener("change", function () {
        const selectedId = select.value;
        if (selectedId) {
          const target = document.getElementById(`episode-${selectedId}`);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      });

      // Search functionality
      input.addEventListener("input", function () {
        const searchTerm = input.value.toLowerCase();
        const filteredEpisodes = episodes.filter((episode) => {
          const name = episode.name.toLowerCase();
          const summary = episode.summary.toLowerCase();
          return name.includes(searchTerm) || summary.includes(searchTerm);
        });

        makePageForEpisodes(filteredEpisodes);
        countElem.textContent = `Displaying ${filteredEpisodes.length} / ${episodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""}`;
      });
    })
    .catch((error) => {
      rootElem.removeChild(loadingMessage);
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Sorry, there was an error loading the episodes. Please try again later.";
      errorMessage.style.color = "red";
      rootElem.appendChild(errorMessage);
    });
}

function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

function makePageForEpisodes(episodesList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodesList.forEach((episode) => {
    const section = document.createElement("section");
    section.classList.add("episode-card");
    section.id = `episode-${episode.id}`;

    const episodeCode = formatEpisodeCode(episode);

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

window.onload = setup;

