exports.handler = async function(event) {
    try {

        const leagueId = 2326400;

        // Get league standings
        const standingsResponse = await fetch(
            `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
        );

        if (!standingsResponse.ok) {
            throw new Error("Could not load league standings");
        }

        const standingsData = await standingsResponse.json();
        const standings = standingsData.standings.results;


        // Get FPL player and gameweek information
        const bootstrapResponse = await fetch(
            "https://fantasy.premierleague.com/api/bootstrap-static/"
        );

        if (!bootstrapResponse.ok) {
            throw new Error("Could not load FPL player data");
        }

        const bootstrapData = await bootstrapResponse.json();


        // Find the current Gameweek
        const currentGameweek = bootstrapData.events.find(
            event => event.is_current
        );

        if (!currentGameweek) {
            throw new Error("Could not find the current Gameweek");
        }

        const gameweek = currentGameweek.id;


        // Find the Gameweek winner
        const winner = standings.reduce(
            (highest, manager) => {
                return manager.event_total > highest.event_total
                    ? manager
                    : highest;
            },
            standings[0]
        );


        // Get the winner's actual FPL team
        const picksResponse = await fetch(
            `https://fantasy.premierleague.com/api/entry/${winner.entry}/event/${gameweek}/picks/`
        );

        if (!picksResponse.ok) {
            throw new Error(
                `Could not load the winner's FPL team (${picksResponse.status})`
            );
        }

        const picksData = await picksResponse.json();


        // Create quick lookup tables
        const players = {};

        bootstrapData.elements.forEach(player => {
            players[player.id] = player;
        });


        const teams = {};

        bootstrapData.teams.forEach(team => {
            teams[team.id] = team;
        });


        // Position names
        const positions = {
            1: "Goalkeeper",
            2: "Defender",
            3: "Midfielder",
            4: "Forward"
        };


        // Convert the FPL player IDs into useful information
        const team = picksData.picks.map(pick => {

            const player = players[pick.element];

           return {
                id: pick.element,
                name: player.web_name,
                fullName: `${player.first_name} ${player.second_name}`,
                position: positions[player.element_type],
                club: teams[player.team].name,
                points: player.event_points,
                positionNumber: pick.position,
                multiplier: pick.multiplier,
                isCaptain: pick.is_captain,
                isViceCaptain: pick.is_vice_captain
            };

        });


        // Send everything back to the website
        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },

            body: JSON.stringify({
                standings: standingsData,
                gameweek: gameweek,

                winner: {
                    manager: winner.player_name,
                    teamName: winner.entry_name,
                    entryId: winner.entry,
                    score: winner.event_total
                },

                team: team,

                automaticSubs: picksData.automatic_subs || []
            })
        };


    } catch (error) {

        console.error("Error loading FPL data:", error);

        return {
            statusCode: 500,

            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },

            body: JSON.stringify({
                error: error.message
            })
        };

    }
};
