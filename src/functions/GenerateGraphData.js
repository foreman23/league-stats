const generateGraphData = async (gameData, timelineData) => {
    const participants = gameData.info.participants;
    // Damage dealt labels
    const yAxisRiotIdDealt = participants.map(participant => ({
        name: `${participant.riotIdGameName} (${participant.championName})`
    }));
    const xAxisDealt = participants.map(participant => participant.totalDamageDealtToChampions);
    const barColors = participants.map((participant) => {
        if (participant.teamId === 100) {
            return '#66c7ff';
        }
        else {
            return '#ff6666';
        }
    })

    // Damage taken labels
    const yAxisRiotIdTaken = participants.map(participant => participant.riotIdGameName);
    const xAxisTaken = participants.map(participant => participant.totalDamageTaken);

    // Calculate total gold each minute
    const frames = timelineData.info.frames;
    console.log(frames)
    const xAxisGold = frames.map((_, index) => index).slice(2, frames.length);

    let yAxisGold = frames.map((frame) => {
        let team1Gold = 0;
        let team2Gold = 0;

        Object.keys(frame.participantFrames).forEach((participantId) => {
            const participantFrame = frame.participantFrames[participantId];
            const teamId = participants.find(p => p.participantId === parseInt(participantId)).teamId;

            if (teamId === 100) {
                team1Gold += participantFrame.totalGold;
            } else {
                team2Gold += participantFrame.totalGold;
            }
        });
        return team1Gold - team2Gold;
    });
    yAxisGold = yAxisGold.slice(2, frames.length);

    const payload = {
        yAxisRiotIdDealt: yAxisRiotIdDealt,
        xAxisDealt: xAxisDealt,
        yAxisRiotIdTaken: yAxisRiotIdTaken,
        xAxisTaken: xAxisTaken,
        xAxisGold: xAxisGold,
        yAxisGold: yAxisGold,
        barColors: barColors,
    }
    return payload;
}

export default generateGraphData;