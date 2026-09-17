export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/fpl") {
            try {
                const leagueId = 2326400;

                const standingsResponse = await fetch(
                    `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
                );

                if (!standingsResponse.ok) {
                    throw new Error("Could not load league standings");
                }

                const standingsData = await standingsResponse.json();
                const standings = standingsData.standings.results;

                const bootstrapResponse = await fetch(
                    "https://fantasy.premierleague.com/api/bootstrap-static/"
                );

                if (!bootstrapResponse.ok) {
                    throw new Error("Could not load FPL player data");
                }

                const bootstrapData = await bootstrapResponse.json();

                const currentGameweek = bootstrapData.events.find(
                    event => event.is_current
                );

                if (!currentGameweek) {
                    throw new Error("Could not find current Gameweek");
                }

                const gameweek = currentGameweek.id;

                const winner = standings.reduce((highest, manager) => {
                    return manager.event_total > highest.event_total
                        ? manager
                        : highest;
                }, standings[0]);

                const picksResponse = await fetch(
                    `https://fantasy.premierleague.com/api/entry/${winner.entry}/event/${gameweek}/picks/`
                );

                if (!picksResponse.ok) {
                    throw new Error("Could not load winner's team");
                }

                const picksData = await picksResponse.json();

                const players = {};
                bootstrapData.elements.forEach(player => {
                    players[player.id] = player;
                });

                const teams = {};
                bootstrapData.teams.forEach(team => {
                    teams[team.id] = team;
                });

                const positions = {
                    1: "Goalkeeper",
                    2: "Defender",
                    3: "Midfielder",
                    4: "Forward"
                };

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

                return new Response(
                    JSON.stringify({
                        standings: standingsData,
                        gameweek,
                        winner: {
                            manager: winner.player_name,
                            teamName: winner.entry_name,
                            entryId: winner.entry,
                            score: winner.event_total
                        },
                        team,
                        automaticSubs: picksData.automatic_subs || []
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    }
                );

            } catch (error) {
                return new Response(
                    JSON.stringify({
                        error: error.message
                    }),
                    {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
            }
        }

        return env.ASSETS.fetch(request);
    }
};
