const leagueId = 2326400;

async function loadLeague() {
    try {
        const response = await fetch("/.netlify/functions/fpl");

        if (!response.ok) {
            throw new Error("Could not load FPL data");
        }

        const data = await response.json();

        console.log("FPL data loaded:", data);

    } catch (error) {
        console.error("Error loading FPL data:", error);
    }
}

loadLeague();
