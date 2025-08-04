function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  const countElem = document.getElementById("episodeCount");
  countElem.textContent = `Displaying ${allEpisodes.length} / ${allEpisodes.length} episodes`;

  const select = document.getElementById("episodeSelect");
  allEpisodes.forEach(function (episode) {
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

  const input = document.getElementById("q");
  input.addEventListener("input", function () {
    const searchTerm = input.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      const name = episode.name.toLowerCase();
      const summary = episode.summary.toLowerCase();

      return name.includes(searchTerm) || summary.includes(searchTerm);
    });

    makePageForEpisodes(filteredEpisodes);
    countElem.textContent = `Displaying ${filteredEpisodes.length} / ${
      allEpisodes.length
    } episode${filteredEpisodes.length !== 1 ? "s" : ""}`;
  });

  function makePageForEpisodes(episodesList) {
    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";

    episodesList.forEach((episode) => {
      const section = document.createElement("section");
      section.classList.add("episode-card");

      // unique ID for scroll targeting
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
}

window.onload = setup;
