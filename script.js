const leagueId = 2326400;

async function loadLeague() {
    try {
        const response = await fetch("/.netlify/functions/fpl");

        if (!response.ok) {
            throw new Error("Could not load FPL data");
        }

        const data = await response.json();

        const main = document.querySelector("main");

        if (!main) {
            throw new Error("Could not find the main page area");
        }

        const standings = data.standings.results;

        let html = `
            <section class="card">
                <h2>Maewon FPL League Standings</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Manager</th>
                            <th>Team</th>
                            <th>Gameweek</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        standings.forEach(manager => {
            html += `
                <tr>
                    <td>${manager.rank}</td>
                    <td>${manager.player_name}</td>
                    <td>${manager.entry_name}</td>
                    <td>${manager.event_total}</td>
                    <td>${manager.total}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </section>
        `;

        main.innerHTML = html;

    } catch (error) {
        console.error("Error loading FPL data:", error);

        const main = document.querySelector("main");

        if (main) {
            main.innerHTML = `
                <section class="card">
                    <h2>FPL League</h2>
                    <p>Sorry, we couldn't load the league data.</p>
                </section>
            `;
        }
    }
}

loadLeague();
