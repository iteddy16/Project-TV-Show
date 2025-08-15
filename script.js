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

function showShowsListing() {
  rootElem.innerHTML = "";
  controls.innerHTML = "";

  // Search input for shows
  const searchInput = document.createElement("input");
  searchInput.id = "show-search";
  searchInput.placeholder = "Filtering for...";
  controls.appendChild(searchInput);

  // Dropdown for quick selection of shows (hidden initially)
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.style.display = "none";
  showSelect.innerHTML = `<option value="" disabled selected>Select a show...</option>`;
  controls.appendChild(showSelect);

  // Show count display
  const countDisplay = document.createElement("p");
  countDisplay.id = "show-count";
  controls.appendChild(countDisplay);

  // Render all shows as cards initially
  renderShowCards(cachedShows);
  updateShowCount(cachedShows.length);

  // Live show search with highlighting and genre/summary matching
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filteredShows = cachedShows.filter(show =>
      show.name.toLowerCase().includes(query) ||
      show.genres.join(" ").toLowerCase().includes(query) ||
      (show.summary?.toLowerCase() || "").includes(query)
    );

    renderShowCards(filteredShows, query);
    updateShowCount(filteredShows.length);

    // Show dropdown only when searching
    if (query) {
      showSelect.style.display = "inline-block";
      populateShowDropdown(filteredShows, query);
      showSelect.selectedIndex = 1; // Auto-select first match
    } else {
      showSelect.style.display = "none";
      clearShowDropdown();
    }
  });

  // Keyboard navigation from search to dropdown
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && showSelect.style.display !== "none") {
      e.preventDefault();
      showSelect.focus();
    }
  });

  // Selecting from dropdown loads episodes
  showSelect.addEventListener("change", () => {
    if (showSelect.value) {
      loadEpisodes(showSelect.value);
    }
  });

function updateShowCount(count) {
    countDisplay.textContent = `Found ${count}/${cachedShows.length} shows`;
  }

  // Highlight search terms
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

function populateShowDropdown(shows, query = "") {
    showSelect.innerHTML = `<option value="" disabled selected>Select a show...</option>` +
      shows.map(show => {
        const highlightedName = highlightText(show.name, query);
        return `<option value="${show.id}">${highlightedName}</option>`;
      }).join("");
  }

function clearShowDropdown() {
    showSelect.innerHTML = `<option value="" disabled selected>Select a show...</option>`;
  }


 // Show card layout with clickable titles
  function renderShowCards(shows, query = "") {
    rootElem.innerHTML = "";
    const fragment = document.createDocumentFragment();
    shows.forEach(show => {
      const card = document.createElement("section");
      card.classList.add("show-card");
      card.innerHTML = `
        <h2 class="show-title" data-id="${show.id}" style="cursor:pointer">
          ${highlightText(show.name, query)}
        </h2>
        <img src="${show.image?.medium || "https://via.placeholder.com/210x295?text=No+Image"}" alt="${show.name}">
        <div>${highlightText(show.summary || "No summary available.", query)}</div>
        <p><strong>Genres:</strong> ${highlightText(show.genres.join(", "), query)}</p>
        <p><strong>Status:</strong> ${show.status}</p>
        <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
        <p><strong>Runtime:</strong> ${show.runtime || "N/A"} mins</p>
      `;
      card.querySelector(".show-title").addEventListener("click", e =>
        loadEpisodes(e.target.dataset.id) // Click title to load episodes
      );
      fragment.appendChild(card);
    });
    rootElem.appendChild(fragment);
  }
}

async function loadEpisodes(showId) {
  try {
    rootElem.innerHTML = "";
    controls.innerHTML = "";

    // Back button to shows listing
    const backBtn = document.createElement("button");
    backBtn.textContent = "← Back to Shows";
    backBtn.addEventListener("click", showShowsListing);
    controls.appendChild(backBtn);

    // Use cached episodes if available
    let episodes;
    if (cachedEpisodes[showId]) {
      episodes = cachedEpisodes[showId];
    } else {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
      if (!res.ok) throw new Error("Network error");
      episodes = await res.json();
      cachedEpisodes[showId] = episodes;
    }

    currentEpisodes = episodes;

    makePageForEpisodes(episodes);
    setupEpisodeControls(episodes);
  } catch (err) {
    rootElem.innerHTML = `<p class="error-message">Oops! Something went wrong loading episodes.</p>`; // Friendly error
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
