const leagueId = 2326400;

async function loadLeague() {
    try {
        const response = await fetch("/.netlify/functions/fpl");

        if (!response.ok) {
            throw new Error("Could not load FPL data");
        }

        const data = await response.json();
        console.log(data);
        const standings = data.standings.standings.results;

        // -----------------------------
        // LEAGUE STANDINGS
        // -----------------------------

        const standingsBody = document.getElementById("standings-body");

        standingsBody.innerHTML = "";

        standings.forEach(manager => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${manager.rank}</td>
                <td>${manager.player_name}</td>
                <td>${manager.entry_name}</td>
                <td>${manager.event_total}</td>
                <td>${manager.total}</td>
            `;

            standingsBody.appendChild(row);
        });


        // -----------------------------
        // FIND GAMEWEEK WINNER
        // -----------------------------

        const winner = standings.reduce((highest, manager) => {
            return manager.event_total > highest.event_total
                ? manager
                : highest;
        }, standings[0]);


        // -----------------------------
        // GAMEWEEK WINNER
        // -----------------------------

        const winnerBox = document.getElementById("gameweek-winner");

        winnerBox.innerHTML = `
            <div class="winner-box">
                <h3>${winner.player_name}</h3>
                <p>${winner.entry_name}</p>
                <div class="winner-score">${winner.event_total} points</div>
            </div>
        `;

        
        // -----------------------------
        // TEAM OF THE WEEK
        // -----------------------------

        const teamBox =
            document.getElementById("team-of-the-week");

        const startingPlayers =
            data.team.filter(player => player.positionNumber <= 11);

        const benchPlayers =
            data.team.filter(player => player.positionNumber > 11);

        teamBox.innerHTML = `
            <div class="team-of-week">

                <h3>${data.winner.teamName}</h3>

                <p>
                    Managed by <strong>${data.winner.manager}</strong>
                </p>

                <div class="starting-team">

                    ${startingPlayers.map(player => `
                        <div class="player-card">

                            <strong>${player.name}</strong>

                            <span>
                                ${player.position}
                            </span>

                            <small>
                                ${player.club}
                            </small>

                            ${
                                player.isCaptain
                                    ? `<b>© Captain</b>`
                                    : player.isViceCaptain
                                    ? `<b>VC</b>`
                                    : ""
                            }

                        </div>
                    `).join("")}

                </div>

                <h4>Bench</h4>

                <div class="bench-team">

                    ${benchPlayers.map(player => `
                        <div class="player-card">

                            <strong>${player.name}</strong>

                            <span>
                                ${player.position}
                            </span>

                            <small>
                                ${player.club}
                            </small>

                        </div>
                    `).join("")}

                </div>

            </div>
        `;
    

        // -----------------------------
        // GAMEWEEK STATISTICS
        // -----------------------------

        const scores = standings.map(manager => manager.event_total);

        const highestScore = Math.max(...scores);

        const lowestScore = Math.min(...scores);

        const averageScore =
            scores.reduce((total, score) => total + score, 0) / scores.length;


        const highestTotalManager = standings.reduce(
            (highest, manager) => {
                return manager.total > highest.total
                    ? manager
                    : highest;
            },
            standings[0]
        );


        const statisticsBox =
            document.getElementById("gameweek-statistics");

        statisticsBox.innerHTML = `
            <div class="statistics-grid">

                <div class="stat-box">
                    <h3>Highest Score</h3>
                    <p>${highestScore}</p>
                </div>

                <div class="stat-box">
                    <h3>Lowest Score</h3>
                    <p>${lowestScore}</p>
                </div>

                <div class="stat-box">
                    <h3>Average Score</h3>
                    <p>${averageScore.toFixed(1)}</p>
                </div>

                <div class="stat-box">
                    <h3>Highest Total</h3>
                    <p>${highestTotalManager.total}</p>
                    <small>${highestTotalManager.player_name}</small>
                </div>

            </div>
        `;


        // -----------------------------
        // WINNER CERTIFICATE
        // -----------------------------

        const certificate =
            document.getElementById("winner-certificate");

        certificate.innerHTML = `
            <div class="certificate">

                <h2>GAMEWEEK WINNER</h2>

                <p class="certificate-name">
                    ${winner.player_name}
                </p>

                <p>
                    ${winner.entry_name}
                </p>

                <p class="certificate-score">
                    ${winner.event_total} POINTS
                </p>

                <p>
                    Maewon FPL League
                </p>

            </div>
        `;


        // -----------------------------
        // SEASON RECORDS
        // -----------------------------

        const records =
            document.getElementById("season-records");

        records.innerHTML = `
            <div class="records-grid">

                <div class="record-box">
                    <h3>Current Leader</h3>
                    <p>${highestTotalManager.player_name}</p>
                    <strong>${highestTotalManager.total} points</strong>
                </div>

                <div class="record-box">
                    <h3>Gameweek Record</h3>
                    <p>${winner.player_name}</p>
                    <strong>${winner.event_total} points</strong>
                </div>

            </div>
        `;

    } catch (error) {

        console.error("Error loading FPL data:", error);

        document.getElementById("standings-body").innerHTML = `
            <tr>
                <td colspan="5">
                    Sorry, we couldn't load the FPL data.
                </td>
            </tr>
        `;
    }
}

loadLeague();
