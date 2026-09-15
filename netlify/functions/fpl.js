exports.handler = async function(event) {
    try {
        const leagueId = 2326400;

        const response = await fetch(
            `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
        );

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: "FPL API request failed"
                })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
