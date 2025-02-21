const getBuildInfo = async (gameData, timelineData, champsJSON, dataDragonVersion) => {

    let participants = [...gameData.info.participants];
    participants.sort((a, b) => a.participantId - b.participantId)
    const frames = timelineData.info.frames;

    // Init timeline array
    let itemTimeline = [];
    let skillTimeline = [];
    let champInfo = [];

    for (let i = 0; i < participants.length; i++) {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants[i].championId)).id}.json`);
        const data = await response.json();
        let itemChampObj = {
            name: participants[i].championName,
            participantId: participants[i].participantId,
            itemHistory: []
        };
        itemTimeline.push(itemChampObj);
        skillTimeline.push([]);
        champInfo.push(data);
    }

    // Process frames to group items and skills
    frames.forEach((frame) => {
        const events = frame.events;

        events.forEach((event) => {
            if (event.type === 'ITEM_PURCHASED' || event.type === 'ITEM_UNDO') {
                const participantIndex = event.participantId - 1;
                const itemObj = {
                    itemId: event.itemId,
                    participantId: event.participantId,
                    timestamp: event.timestamp,
                    type: event.type
                };

                const itemHistory = itemTimeline[participantIndex].itemHistory;

                if (event.type === 'ITEM_UNDO') {
                    itemHistory.pop()
                }

                else {
                    if (itemHistory.length === 0 || event.timestamp - itemHistory[itemHistory.length - 1][itemHistory[itemHistory.length - 1].length - 1].timestamp > 15000) {
                        // Start a new group if no group exists or time gap exceeds 10 seconds
                        itemHistory.push([itemObj]);
                    } else {
                        // Add to the last group
                        itemHistory[itemHistory.length - 1].push(itemObj);
                    }
                }

            }

            if (event.type === 'SKILL_LEVEL_UP') {
                const skillObj = {
                    participantId: event.participantId,
                    timestamp: event.timestamp,
                    skillSlot: event.skillSlot,
                    type: event.type
                };
                skillTimeline[event.participantId - 1].push(skillObj);
            }
        });
    });

    let payload = {
        itemTimeline: itemTimeline,
        skillTimeline: skillTimeline,
        champInfo: champInfo
    }

    return payload
}

export default getBuildInfo;

