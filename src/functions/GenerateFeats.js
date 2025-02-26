const Feats = [
    {
        Title: "Tower Dominance",
        Description: "Destroyed all outer turrets by the 20-minute mark."
    },
    {
        Title: "Visonary Team",
        Description: "As a team, placed 80 or more wards in strategic locations throughout the match."
    },
    {
        Title: "Flawless Victory",
        Description: "Won the game without losing a single turret."
    },
    {
        Title: "Teamfight Masters",
        Description: "Won 5 or more teamfights in a row."
    },
    {
        Title: "Swift Execution",
        Description: "Destroyed the enemy nexus before the 25-minute mark."
    },
    {
        Title: "Epic Comeback",
        Description: "Win the game after being behind by 10,000 gold or more."
    },
    {
        Title: "Total Control",
        Description: "Controled all neutral objectives (dragons, Rift Herald, Baron Nashor) throughout the entire match."
    },
    {
        Title: "Stomp",
        Description: "Your team ended the game with a gold lead of over 10,000 gold."
    }
]

const Fails = [
    {
        Title: "Threw Game",
        Description: "Lost after having a gold lead of 10,000 gold at one point."
    },
    {
        Title: "Sudden Surrender",
        Description: "Surrendered the game prematurely (before 15mins) despite having the opportunity for a comeback."
    },
    {
        Title: "No Dragons",
        Description: "The team failed to secure a single dragon throughout the entire match."
    },
    {
        Title: "Teamfight Follies",
        Description: "Lost 5 or more teamfights in a row."
    },
    {
        Title: "Weak Defense",
        Description: "Lost all turrets by the 20-minute mark."
    }
]

const determineFeatsFails = (gameData, playerTeamId, timelineData) => {
    const blueTeam = gameData.info.teams[0];
    const redTeam = gameData.info.teams[1];
    const participants = gameData.info.participants;

    // Determine player's team
    let friendlyTeam = null;
    if (playerTeamId === 100) {
        friendlyTeam = blueTeam;
    }
    else {
        friendlyTeam = redTeam;
    }

    // Determine player's teammates
    let teammateIds = [];
    for (let i = 0; i < participants.length; i++) {
        if (participants[i].teamId === playerTeamId) {
            teammateIds.push(participants[i].participantId)
        }
    }

    // Towers stats
    let towersKilled = 0;
    let towersKilledAt20 = 0;
    let outerTowersKilledAt20 = 0;
    let towersLost = 0;
    let towersLostAt20 = 0;
    let outerTowersLostAt20 = 0;

    // Wards stats
    let wardsPlaced = 0;

    // Gold difference at each frame (minute)
    let goldDiffEachMinute = [];

    // Find stats for achievements
    const frames = timelineData.info.frames
    for (let i = 0; i < frames.length; i++) {
        let frame = frames[i];
        // Calculate gold difference at frame
        let blueTeamCurrentGold = 0;
        let redTeamCurrentGold = 0;

        for (let j = 0; j < frames[i].events.length; j++) {
            let event = frames[i].events[j];
            // console.log(i, event)

            // Find amount of wards placed
            if (event.type === "WARD_PLACED" && teammateIds.includes(event.creatorId)) {
                wardsPlaced += 1;
            }

            // Calculate tower KILLS
            if (event.type === "BUILDING_KILL" && event.teamId !== playerTeamId && event.buildingType === "TOWER_BUILDING") {
                towersKilled += 1;
                if (i < 20) {
                    towersKilledAt20 += 1;
                    if (event.towerType === "OUTER_TURRET") {
                        outerTowersKilledAt20 += 1;
                    }
                }
            }
            // Calculate tower LOSSES
            if (event.type === "BUILDING_KILL" && event.teamId === playerTeamId && event.buildingType === "TOWER_BUILDING") {
                towersLost += 1;
                if (i < 20) {
                    towersLostAt20 += 1;
                    if (event.towerType === "OUTER_TURRET") {
                        outerTowersLostAt20 += 1;
                    }
                }
            }
        }
    }
    // console.log(`Team destroyed ${towersKilled} towers`)
    // console.log(`Team destroyed ${towersKilledAt20} towers at 20`)
    // console.log(`Team destroyed ${outerTowersKilledAt20} outer towers at 20`)
    // console.log(`Team lost ${towersLost} towers`)
    // console.log(`Team lost ${towersLostAt20} towers at 20`)
    // console.log(`Team placed ${wardsPlaced} wards`)

}

export default determineFeatsFails