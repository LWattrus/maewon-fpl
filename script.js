
const leagueId = 2326400;


/* =========================
   LOAD LEAGUE DATA
========================= */

async function loadLeague() {

    try {

        const response = await fetch("/api/fpl");

        if (!response.ok) {
            throw new Error("Could not load FPL data");
        }

        const data = await response.json();

        const standings = data.standings.standings.results;


        /* =========================
           LEAGUE STANDINGS
        ========================= */

        const standingsBody =
            document.getElementById("standings-body");

        standingsBody.innerHTML = "";

        standings.forEach(manager => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${manager.rank}</td>
                <td>${manager.player_name}</td>
                <td style="color: #222222 !important; font-weight: 600;">
                    ${manager.entry_name}
                </td>
                <td>${manager.event_total}</td>
                <td>${manager.total}</td>
            `;

            standingsBody.appendChild(row);

        });


        /* =========================
           GAMEWEEK WINNER
        ========================= */

        const winner = standings.reduce((highest, manager) => {

            return manager.event_total > highest.event_total
                ? manager
                : highest;

        }, standings[0]);


        const winnerBox =
            document.getElementById("gameweek-winner");

        winnerBox.innerHTML = `
            <div class="winner-box">
                <h3>${winner.player_name}</h3>
                <p>${winner.entry_name}</p>
                <div class="winner-score">
                    ${winner.event_total} points
                </div>
            </div>
        `;


        /* =========================
           TEAM OF THE WEEK
        ========================= */

        buildTeamOfWeek(data);


        /* =========================
           GAMEWEEK STATISTICS
        ========================= */

        const scores = standings.map(manager =>
            manager.event_total
        );

        const highestScore = Math.max(...scores);

        const lowestScore = Math.min(...scores);

        const averageScore =
            scores.reduce((total, score) => total + score, 0)
            / scores.length;


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


        /* =========================
           CERTIFICATE
        ========================= */

        const certificate =
            document.getElementById("winner-certificate");

        certificate.innerHTML = `
            <div class="certificate">
                <h2>GAMEWEEK WINNER</h2>
                <p class="certificate-name">
                    ${winner.player_name}
                </p>
                <p>${winner.entry_name}</p>
                <p class="certificate-score">
                    ${winner.event_total} POINTS
                </p>
                <p>Maewon FPL League</p>
            </div>
        `;


        /* =========================
           SEASON RECORDS
        ========================= */

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


/* =========================
   TEAM OF THE WEEK
========================= */

function buildTeamOfWeek(data) {

    const teamBox =
        document.getElementById("team-of-the-week");

    const startingPlayers = data.team.filter(
        player => player.positionNumber <= 11
    );

    const benchPlayers = data.team.filter(
        player => player.positionNumber > 11
    );


    const goalkeepers = startingPlayers.filter(
        player => player.position === "Goalkeeper"
    );

    const defenders = startingPlayers.filter(
        player => player.position === "Defender"
    );

    const midfielders = startingPlayers.filter(
        player => player.position === "Midfielder"
    );

    const forwards = startingPlayers.filter(
        player => player.position === "Forward"
    );


    const formation =
        `${defenders.length}-${midfielders.length}-${forwards.length}`;


    function createPlayerCard(player) {

        let captainBadge = "";

        if (player.isCaptain) {
            captainBadge = `<span class="captain-badge">C</span>`;
        }

        if (player.isViceCaptain) {
            captainBadge = `<span class="captain-badge">VC</span>`;
        }


        return `
            <div class="pitch-player">

                <div class="shirt">
                    <div class="shirt-collar"></div>
                    <div class="shirt-number">
                        ${player.points}
                    </div>
                </div>

                <div class="player-name">
                    ${player.name} ${captainBadge}
                </div>

                <div class="player-club">
                    ${player.club}
                </div>

            </div>
        `;

    }


    function createPlayerRow(players) {

        return `
            <div class="pitch-row">
                ${players.map(player =>
                    createPlayerCard(player)
                ).join("")}
            </div>
        `;

    }


    teamBox.innerHTML = `

        <div class="team-poster">

            <div class="team-poster-header">

                <div class="team-poster-label">
                    GAMEWEEK ${data.gameweek}
                </div>

                <h1>TEAM OF THE WEEK</h1>

                <h2>${data.winner.teamName}</h2>

                <p>
                    MANAGER:
                    <strong>${data.winner.manager}</strong>
                </p>

                <div class="formation-label">
                    Formation: ${formation}
                </div>

            </div>


            <div class="football-pitch">

                <div class="pitch-lines"></div>

                ${createPlayerRow(forwards)}

                ${createPlayerRow(midfielders)}

                ${createPlayerRow(defenders)}

                ${createPlayerRow(goalkeepers)}

            </div>


            <div class="bench-section">

                <h3>SUBSTITUTES</h3>

                <div class="bench-players">

                    ${benchPlayers.map(player => `

                        <div class="bench-player">

                            <strong>${player.name}</strong>

                            <span>${player.position}</span>

                            <b>${player.points} pts</b>

                        </div>

                    `).join("")}

                </div>

            </div>


            <div class="team-poster-footer">
                MAEWON FANTASY • GAMEWEEK ${data.gameweek}
            </div>

        </div>

    `;

}


/* =========================
   PRINT STANDINGS
========================= */

function printStandings() {

    document.body.classList.add("print-standings");

    window.print();

    setTimeout(() => {

        document.body.classList.remove("print-standings");

    }, 1000);

}


/* =========================
   PRINT TEAM OF THE WEEK
========================= */

function printTeamOfWeek() {

    document.body.classList.add("print-team");

    window.print();

    setTimeout(() => {

        document.body.classList.remove("print-team");

    }, 1000);

}


/* =========================
   START
========================= */

loadLeague();
