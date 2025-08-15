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
    rootElem.innerHTML = `<p class="error-message">Check your code! Something went wrong loading episodes.</p>`; // Friendly error message
    console.error(err);
  }
}

function makePageForEpisodes(episodesList) {
  rootElem.innerHTML = "";
  const fragment = document.createDocumentFragment();

  episodesList.forEach(episode => {
    const section = document.createElement("section");
    section.classList.add("episode-card");
    section.dataset.name = episode.name.toLowerCase();       // Store lowercase name for search
    section.dataset.summary = episode.summary?.toLowerCase() || ""; // Store lowercase summary for search
    section.id = formatEpisodeCode(episode);

    section.innerHTML = `
      <h2>${episode.name} – ${section.id}</h2>
      <img src="${episode.image?.medium || "https://via.placeholder.com/210x295?text=No+Image"}" alt="${episode.name}">
      <div>${episode.summary || "No summary available."}</div>
      <a href="${episode.url}" target="_blank">View on TVMaze</a>
    `;
    fragment.appendChild(section);
  });

  rootElem.appendChild(fragment);
}


function setupEpisodeControls(episodes) {
  // Dropdown to jump to episodes
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.innerHTML = `<option value="" disabled selected>Jump to episode...</option>` +
    episodes.map(ep => {
      const code = formatEpisodeCode(ep);
      return `<option value="${code}">${code} - ${ep.name}</option>`;
    }).join("");

  // Search box for filtering episodes
  const searchInput = document.createElement("input");
  searchInput.id = "episode-search";
  searchInput.placeholder = "Search episodes...";

  // Display count of visible episodes
  const countDisplay = document.createElement("p");
  countDisplay.id = "episode-count";
  countDisplay.textContent = `Displaying ${episodes.length}/${episodes.length} episodes`;

  controls.append(episodeSelect, searchInput, countDisplay);

  episodeSelect.addEventListener("change", e => {
    const target = document.getElementById(e.target.value);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });

  // Real-time filtering for episodes
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let matches = 0;
    document.querySelectorAll(".episode-card").forEach(card => {
      const match = card.dataset.name.includes(query) || card.dataset.summary.includes(query);
      card.style.display = match ? "block" : "none";
      if (match) matches++;
    });
    countDisplay.textContent = `Displaying ${matches}/${episodes.length} episodes`;
  });
}