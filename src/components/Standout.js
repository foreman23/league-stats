import React, { useState } from 'react';
import { Typography, Box, Grid, Tooltip, Divider } from '@mui/material';

const Standout = (props) => {
    const { gameData, champsJSON, dataDragonVersion } = props;

    const [activeIndex, setActiveIndex] = useState(0);

    // Find standout performances
    const participants = gameData.info.participants;

    const mvp = participants.reduce((max, player) => (player.score > (max?.score || 0) ? player : max), null);

    const secondHighest = participants
        .filter(player => player !== mvp)
        .reduce((max, player) => (player.score > (max?.score || 0) ? player : max), null);

    const int = participants.reduce((min, player) => (player.score < (min?.score ?? Infinity) ? player : min), null);

    // Utility function to get champion name and image
    const getChampionData = (championId) => {
        const champion = Object.values(champsJSON.data).find(champ => champ.key === String(championId));
        return {
            name: champion?.name || "Unknown Champion",
            img: `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${champion?.id}.png`,
        };
    };

    const handleClickPortrait = (index) => {
        setActiveIndex(index);
    };

    const performances = [
        { title: "MVP", player: mvp, activeIndex: 0 },
        { title: "2ND", player: secondHighest, activeIndex: 1 },
        { title: "INT", player: int, activeIndex: 2 },
    ];

    const activePlayer = performances[activeIndex];
    const { name: championName } = getChampionData(activePlayer.player?.championId);

    // Set description string
    let descStr = '';

    // Determine the primary performance descriptor based on title

    if (performances[0].player !== null) {
        switch (activePlayer.title) {
            case 'MVP':
                descStr += `carried the match, ending the game ${activePlayer.player.kills}/${activePlayer.player.deaths}/${activePlayer.player.assists}. `;
                break;
            case '2ND':
                descStr += `displayed a solid performance, finishing ${activePlayer.player.kills}/${activePlayer.player.deaths}/${activePlayer.player.assists}. `;
                break;
            case 'INT':
                descStr += `struggled throughout the match, ending ${activePlayer.player.kills}/${activePlayer.player.deaths}/${activePlayer.player.assists}. `;
                // Excessive deaths
                if (activePlayer.player.deaths > Math.ceil(gameData.info.gameDuration / 60) * 0.3) {
                    descStr += `Their frequent deaths made it difficult for their team to recover momentum. `;
                }
                // Low gold
                const goldThresholdInt = Math.ceil(((gameData.info.gameDuration / 60) * 500) * 0.7); // 500 gold per minute
                if ((activePlayer.player.goldEarned < goldThresholdInt) && activePlayer.player.teamPosition !== "UTILITY") {
                    descStr += `They only earned ${activePlayer.player.goldEarned.toLocaleString()} gold, significantly below the expected amount. `;
                }
                // Low damage
                const damageThresholdInt = Math.ceil(((gameData.info.gameDuration / 60) * 900) * 0.5); // Average 900 damage per minute 
                if ((activePlayer.player.totalDamageDealtToChampions < damageThresholdInt) && activePlayer.player.teamPosition !== "UTILITY") {
                    descStr += `Their contribution to damage was minimal, dealing just ${activePlayer.player.totalDamageDealtToChampions.toLocaleString()} damage. `;
                }
                break;
            default:
                descStr += `played the game, finishing with ${activePlayer.player.kills}/${activePlayer.player.deaths}/${activePlayer.player.assists}. `;
                break;
        }

        // Add additional performance highlights
        const goldEarned = activePlayer.player.goldEarned;
        const goldThreshold = Math.ceil((gameData.info.gameDuration / 60) * 500); // 500 gold per minute
        if (goldEarned > goldThreshold) {
            descStr += `They amassed an impressive ${goldEarned.toLocaleString()} gold. `;
        }

        const totalDamage = activePlayer.player.totalDamageDealtToChampions;
        const damageThreshold = Math.ceil((gameData.info.gameDuration / 60) * 900); // Average 900 damage per minute
        if (totalDamage > damageThreshold) {
            descStr += `With ${totalDamage.toLocaleString()} damage dealt, they were pivotal in helping the ${activePlayer.player.teamId === 100 ? 'blue' : 'red'} team dominate teamfights. `;
        }

        const kills = activePlayer.player.kills;
        const killThreshold = Math.ceil((gameData.info.gameDuration / 60) * 0.5); // 0.5 kills per minute
        if (kills > killThreshold) {
            descStr += `Their ${kills} kills ${activePlayer.player.win ? 'helped to secure a decisive victory' : 'kept their team in contention'} for the ${activePlayer.player.teamId === 100 ? 'blue' : 'red'} team. `;
        }

        // Add jungle objectives to the description
        const dragonsTaken = activePlayer.player?.challenges?.dragonTakedowns || 0;
        const baronsTaken = activePlayer.player?.challenges?.baronTakedowns || 0;

        // Dynamic thresholds based on game duration
        const dragonThreshold = Math.ceil((gameData.info.gameDuration / 60) * 0.1);
        const baronThreshold = Math.ceil((gameData.info.gameDuration / 60) * 0.05);

        if (dragonsTaken > dragonThreshold) {
            descStr += `They dominated the jungle by securing ${dragonsTaken} dragons, giving their team a strong advantage. `;
        }

        if (baronsTaken > baronThreshold) {
            descStr += `Their impact was felt in the late game, where they secured ${baronsTaken} Baron Nashor buffs, shifting momentum in their team's favor. `;
        }

        // Include summary for high-impact jungle objectives
        const totalObjectives = dragonsTaken + baronsTaken;
        if (totalObjectives > (dragonThreshold + baronThreshold)) {
            descStr += `Overall, they contributed significantly by taking ${totalObjectives} major jungle objectives, leading their team to success. `;
        }

        const kda = ((kills + activePlayer.player.assists) / activePlayer.player.deaths).toFixed(1);
        if (kda > 5) {
            descStr += `They maintained an impressive KDA of ${kda}, showcasing their effectiveness. `;
        }

        // // Add tower and inhibitor takedowns to the description
        // const towersTaken = activePlayer.player?.challenges?.turretTakedowns || 0;

        // // Dynamic thresholds based on game duration
        // const towerThreshold = Math.ceil((gameData.info.gameDuration / 60) * 0.2);

        // if (towersTaken > towerThreshold) {
        //     descStr += `They pushed objectives relentlessly, taking down ${towersTaken} towers to secure map control. `;
        // }

        // // Include summary for high-impact structural objectives
        // if (towersTaken > towerThreshold) {
        //     descStr += `Overall, they contributed significantly by taking ${towersTaken} towers, paving the way for their team's victory. `;
        // }

        // Final description string
        descStr = descStr.trim();
    }

    if (performances[0].player !== null) return (
        <Box
            className='GameDetailsBox StandoutBox'
            alignItems={'center'}
        >
            <Grid item xs={12} sm={6} className='StandoutGridHalf1'>
                <div className='StandoutImagesContainer'>
                    <div className='StandoutHeaderContainer'>
                        <Typography style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '6px' }}>Standout Performances</Typography>
                    </div>
                    <div className='StandoutImagesSubContainer'>
                        {performances.map(({ title, player, activeIndex: index }) => {
                            const { name, img } = getChampionData(player?.championId);
                            const teamColor = player?.teamId === 100 ? '#568CFF' : '#FF3F3F';

                            return (

                                <div
                                    key={title}
                                    className='pointer'
                                    onClick={() => handleClickPortrait(index)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginRight: index === 2 ? '0px' : '15px',
                                        backgroundColor: activeIndex === index ? 'rgba(217, 217, 217, 0.8)' : 'white',
                                        padding: '5px',
                                        paddingLeft: '10px',
                                        paddingRight: '10px',
                                        paddingTop: '15px',
                                        paddingBottom: '15px',
                                        borderRadius: '5px'
                                    }}
                                >
                                    <Tooltip
                                        placement='top'
                                        arrow
                                        disableInteractive
                                        title={
                                            player ? (
                                                <>
                                                    {player.riotIdGameName} ({name})<br />
                                                    {player.kills}/{player.deaths}/{player.assists}<br />
                                                    Score: {player.score.toFixed(1)}
                                                </>
                                            ) : (
                                                "No data"
                                            )
                                        }
                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 0] } }] } }}
                                    >
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                borderRadius: '100%',
                                                transform: activeIndex === index ? 'scale(102%)' : 'scale(100%)',
                                                border: `4px solid ${teamColor}`,
                                            }}
                                        >
                                            <img
                                                className='standoutChampImage'
                                                style={{
                                                    filter: activeIndex === index ? 'grayscale(0%)' : 'grayscale(100%)',
                                                }}
                                                src={img}
                                                alt=''
                                            />
                                        </div>
                                    </Tooltip>
                                    <Typography className={activeIndex === index ? 'standoutDescActive' : 'standoutDescInactive'}>{title}</Typography>
                                    {activeIndex === index && <Divider color='#2b2b2b' style={{ width: '40%', margin: 'auto' }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Grid>
            <Grid item xs={12} sm={6} style={{ display: 'flex' }}>
                <div className='StandoutTextContainer'>
                    <Typography className='hideMobile hideTablet' style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '10px' }}>{activePlayer.title}</Typography>
                    <p style={{ color: '#4B4B4B', fontSize: '1rem', maxWidth: '425px' }}>
                        <a style={{ color: activePlayer.player.teamId === 100 ? '#568CFF' : '#FF3F3F', textDecoration: 'underline' }} className='matchSummaryPlayerLink' href={`/profile/${gameData.info.platformId.toLowerCase()}/${activePlayer.player.riotIdGameName}/${activePlayer.player.riotIdTagline.toLowerCase()}`}>'{activePlayer?.player.riotIdGameName || "Unknown Player"}' <span style={{ textDecoration: 'none' }}>({championName})</span></a> {descStr}
                    </p>
                </div>
            </Grid>
        </Box>
    );
};

export default Standout;
