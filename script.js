//You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodesList) {
  const rootElem = document.getElementById("root");
//const episodeCountElem = document.getElementById("episodeCount");

rootElem.innerHTML = "";
//episodeCountElem.textContent = `Got ${episodesList.length} episode(s)`;


  episodesList.forEach((episode) => {
    const section = document.createElement("ListOfEpisodes");
    section.classList.add("episode-card");

    // make episode code
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    // join title with code
    const title = document.createElement("h2");
    title.classList.add("episode-title");
    title.textContent = `${episode.name} – ${episodeCode}`;
    section.appendChild(title);

    // For the medium Image
    const image = document.createElement("img");
    image.src = episode.image?.medium || "";
    image.alt = episode.name;
    section.appendChild(image);

    // For the summary
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary || "No summary available.";
    section.appendChild(summary);
    
    // Link to TVMaze for each episodes
    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = "View on TVMaze";
    section.appendChild(link);  

    // Append section to root
    rootElem.appendChild(section);
  });
}

window.onload = setup;