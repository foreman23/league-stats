const getBuildInfo = async (gameData, timelineData) => {

    let participants = gameData.info.participants;
    participants.sort((a, b) => a.participantId - b.participantId)
    console.log(participants)
    const frames = timelineData.info.frames;    

    // Init timeline array
    let itemTimeline = [];
    let champInfo = [];
    for (let i = 0; i < participants.length; i++) {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/15.1.1/data/en_US/champion/${participants[i].championName}.json`);
        const data = await response.json();
        console.log(data)
        itemTimeline.push([])
        champInfo.push(data)
    }

    // Find items and skill ups
    frames.map((frame, index) => {
        let events = frame.events
        for (let i = 0; i < events.length; i++) {
            if (events[i].type === 'ITEM_PURCHASED' || events[i].type === 'ITEM_DESTROYED') {
                let itemObj = {
                    itemId: events[i].itemId,
                    participantId: events[i].participantId,
                    timestamp: events[i].timestamp,
                    type: events[i].type
                }
                itemTimeline[events[i].participantId - 1].push(itemObj)
            }
            if (events[i].type === 'SKILL_LEVEL_UP') {
                let skillObj = {
                    participantId: events[i].participantId,
                    timestamp: events[i].timestamp,
                    skillSlot: events[i].skillSlot,
                    type: events[i].type
                }
                itemTimeline[events[i].participantId - 1].push(skillObj)
            }
        }
    })

    let payload = {
        itemTimeline: itemTimeline,
        champInfo: champInfo
    }

    return payload
}

export default getBuildInfo;

