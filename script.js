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

  loadAllShows(showSelect, allShows);

showSelect.addEventListener("change", function(){
  
}

   //   makePageForEpisodes(episodes);
     // countElem.textContent = `Displaying ${episodes.length} / ${episodes.length} episodes`;

      // Populate dropdown
    //  episodes.forEach((episode) => {
      //  const option = document.createElement("option");
        //option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
        //option.value = episode.id;
        //episodeSelect.appendChild(option);
      //});

      // Smooth scroll to selected episode
      //episodeSelect.addEventListener("change", function () {
        //const selectedId = select.value;
        //if (selectedId) {
          //const target = document.getElementById(`episode-${selectedId}`);
          //if (target) {
           // target.scrollIntoView({ behavior: "smooth" });
          //}
        //}
    //  });

      // Search functionality
     // input.addEventListener("input", function () {
       // const searchTerm = input.value.toLowerCase();
        //const filteredEpisodes = episodes.filter((episode) => {
         // const name = episode.name.toLowerCase();
          //const summary = episode.summary.toLowerCase();
          //return name.includes(searchTerm) || summary.includes(searchTerm);
        //});

       // makePageForEpisodes(filteredEpisodes);
        //countElem.textContent = `Displaying ${filteredEpisodes.length} / ${episodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""}`;
      //});
  
//      rootElem.removeChild(loadingMessage);
  //    const errorMessage = document.createElement("p");
    //  errorMessage.textContent = "Sorry, there was an error loading the episodes. Please try again later.";
      //errorMessage.style.color = "red";
      //rootElem.appendChild(errorMessage);
    

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

async function loadAllShows(showSelect,allShows){
  fetch("https://api.tvmaze.com/shows")
  .then ((response)=> {
    if(!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return response.json();
  })
  .then ((shows)=> {
      shows.sort((a, b) => a.name.localeCompare(b.name));
  showSelect.innerHTML = "";

  shows.forEach((show)=> {
    const option =document.createElement("option");
    option.textContent = show.name;
    option.value= show.id;
    showSelect.appendChild(option);

  });
})
.catch((error)=> {
  console.error("Error loading shows:", error);
});
}

window.onload = setup;