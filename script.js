const leagueId = 2326400;

async function loadLeague() {
    try {
        const response = await fetch(
            `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
        );

        const data = await response.json();

        console.log(data);

    } catch (error) {
        console.error("Error loading FPL data:", error);
    }
}

loadLeague();
