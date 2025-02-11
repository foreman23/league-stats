import { React, useState } from 'react'
import { Grid, Box, Typography, Tooltip } from '@mui/material'
import ForwardIcon from '@mui/icons-material/Forward';

const Builds = (props) => {

    const {
        playerData,
        gameData,
        dataDragonVersion,
        champsJSON,
        items,
        buildData
    } = props;

    const [currBuildChamp, setCurrBuildChamp] = useState(playerData);
    const handleBuildClick = (champ) => {
        if (champ !== currBuildChamp) {
            setCurrBuildChamp(champ)
        }
    }

    return (
        <Grid className='GameDetailsContainer' width={'65%'} container justifyContent={'center'} margin={'auto'} marginTop={'20px'} marginBottom={'10px'}>
            <Box className='BuildsBox'>
                <Typography style={{ fontWeight: 'bold', fontSize: '20px' }}>Builds</Typography>
                <Typography style={{ fontSize: '20px', marginBottom: '20px', color: '#4B4B4B' }}>Player Items & Level Ups</Typography>
            </Box>
            <Box className='BuildsBox2'>
                <div className='BuildsChampPicsContainer'>
                    <Grid order={{ xs: playerData.teamId === 100 ? 1 : 3 }} style={{}}>
                        {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                            <div className='pointer' onClick={() => handleBuildClick(item)} style={{ border: '4px solid #568CFF', borderRadius: '5px', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', margin: '5px', transform: item.championId === currBuildChamp.championId ? 'scale(115%)' : 'scale(100%)' }}>
                                <Typography style={{
                                    fontSize: '12px',
                                    position: 'absolute',
                                    backgroundColor: item.teamId === 100 ? '#568CFF' : '#FF3A54',
                                    color: 'white',
                                    borderRadius: '0px',
                                    borderBottomRightRadius: '5px',
                                    paddingLeft: '0px',
                                    paddingRight: '4px',
                                    paddingTop: '1px',
                                    paddingBottom: '1px',
                                    textAlign: 'center',
                                    right: 'auto',
                                    bottom: 'auto',
                                    top: '0px',
                                    left: '0px',
                                    justifyContent: 'center',
                                    zIndex: 1
                                }}>{item.champLevel}
                                </Typography>
                                <img className='BuildsChampPic' style={{ filter: item.championId !== currBuildChamp.championId ? 'grayscale(100%)' : 'grayscale(0%)', borderRadius: '0%' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </div>
                        ))}
                    </Grid>
                    <Grid className='hideMobile hideSmallTablet' style={{ alignSelf: 'center' }} order={{ xs: 2 }}>
                        <Box marginBottom={'3px'} marginLeft={'20px'} marginRight={'20px'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#C3C3C3'}></Box>
                    </Grid>
                    <Grid order={{ xs: playerData.teamId === 200 ? 1 : 3 }}>
                        {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                            <div className='pointer' onClick={() => handleBuildClick(item)} style={{ border: '4px solid #FF3F3F', borderRadius: '5px', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', margin: '5px', transform: item.championId === currBuildChamp.championId ? 'scale(115%)' : 'scale(100%)' }}>
                                <Typography style={{
                                    fontSize: '12px',
                                    position: 'absolute',
                                    backgroundColor: item.teamId === 100 ? '#568CFF' : '#FF3A54',
                                    color: 'white',
                                    borderRadius: '0px',
                                    borderBottomRightRadius: '5px',
                                    paddingLeft: '0px',
                                    paddingRight: '4px',
                                    paddingTop: '1px',
                                    paddingBottom: '1px',
                                    textAlign: 'center',
                                    right: 'auto',
                                    bottom: 'auto',
                                    top: '0px',
                                    left: '0px',
                                    justifyContent: 'center',
                                    zIndex: 1
                                }}>{item.champLevel}
                                </Typography>
                                <img className='BuildsChampPic' style={{ filter: item.championId !== currBuildChamp.championId ? 'grayscale(100%)' : 'grayscale(0%)', borderRadius: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </div>
                        ))}
                    </Grid>
                </div>
                {/* Skill Order */}
                <div style={{ display: 'flex', marginLeft: '0px', marginTop: '15px', flexDirection: 'column' }}>
                    <a style={{ color: currBuildChamp?.teamId === 100 ? '#568CFF' : '#FF3F3F' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${currBuildChamp?.riotIdGameName}/${currBuildChamp?.riotIdTagline.toLowerCase()}`}>
                        <Typography fontSize={'20px'} marginBottom={'15px'} fontWeight={'bold'}>
                            {`${currBuildChamp?.championName} (${currBuildChamp?.riotIdGameName} #${currBuildChamp?.riotIdTagline})`}
                        </Typography>
                    </a>
                    <Typography fontSize={'20px'} color={'#4B4B4B'} marginTop={'10px'}>Skill Order</Typography>
                    <div style={{ display: 'flex', overflowX: 'auto', backgroundColor: '#E6E6E6', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', justifyContent: 'start', padding: '10px', paddingTop: '20px', paddingBottom: '10px', borderRadius: '10px', marginTop: '20px' }}>
                        {Array.from({ length: 18 }).map((_, index) => {
                            const skillEvent = buildData.skillTimeline[currBuildChamp.participantId - 1].filter(event => event.type === 'SKILL_LEVEL_UP')[index];

                            return (
                                <div key={index}>
                                    <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))' }}>
                                        <Typography
                                            className='BuildSectionSkillLetter'
                                            style={{
                                                backgroundColor: skillEvent ? (skillEvent.skillSlot !== 4 ? '#FFFFFF' : '#6E6E6E') : '#f2f2f2',
                                                color: skillEvent
                                                    ? skillEvent.skillSlot === 1
                                                        ? '#2a1e96'
                                                        : skillEvent.skillSlot === 2
                                                            ? '#3c756a'
                                                            : skillEvent.skillSlot === 3
                                                                ? '#a3a53f'
                                                                : skillEvent.skillSlot === 4
                                                                    ? 'white'
                                                                    : 'black'
                                                    : 'black',
                                            }}
                                        >
                                            {skillEvent ? (skillEvent.skillSlot === 1 ? 'Q' : skillEvent.skillSlot === 2 ? 'W' : skillEvent.skillSlot === 3 ? 'E' : 'R') : ' '}
                                        </Typography>

                                        <img
                                            className='BuildSectionSkillIcon'
                                            src={
                                                skillEvent
                                                    ? `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${buildData.champInfo[currBuildChamp.participantId - 1].data[
                                                        Object.values(champsJSON.data).find(
                                                            champ =>
                                                                champ.key ===
                                                                String(
                                                                    gameData.info.participants
                                                                        .slice() // Create a shallow copy of the array
                                                                        .sort((a, b) => a.participantId - b.participantId)[
                                                                        currBuildChamp.participantId - 1
                                                                    ].championId
                                                                )
                                                        )?.id
                                                    ]?.spells[skillEvent.skillSlot - 1].image.full
                                                    }`
                                                    : '/images/blankItem.webp'
                                            }
                                            alt={skillEvent ? `${skillEvent.skillSlot} Skill` : 'Empty'}
                                        />
                                    </div>

                                    <Typography style={{ textAlign: 'center', color: '#4B4B4B', fontSize: '16px' }}>
                                        {skillEvent ? index + 1 : ''}
                                    </Typography>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Item build */}
                <div style={{ display: 'flex', marginLeft: '0px', marginTop: '20px', flexDirection: 'column' }}>
                    <Typography fontSize={'20px'} color={'#4B4B4B'} marginTop={'10px'}>Item Build</Typography>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', paddingLeft: '3px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', marginTop: '0px', flexWrap: 'wrap' }}>
                        {buildData.itemTimeline[currBuildChamp.participantId - 1].itemHistory.map((itemGroup, itemGroupIndex) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                <div style={{ display: 'flex', filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25))', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px', margin: '15px', marginRight: '0px', marginLeft: '0px', backgroundColor: '#E6E6E6', padding: '10px', paddingBottom: '5px', borderRadius: '5px', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex' }}>
                                        {itemGroup.map((item, itemIndex) => (
                                            <Tooltip placement='top' arrow title={<><u>{items.data[item.itemId]?.name}</u><br></br>{items.data[item.itemId]?.plaintext || items.data[item.itemId]?.tags[0]}</>}>
                                                <img key={itemIndex} className='BuildSectionItemImg' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${item.itemId}.png`}></img>
                                            </Tooltip>
                                        ))}
                                    </div>
                                    <div>
                                        <Typography style={{ textAlign: 'center', color: '#747474', fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>
                                            {`${String(Math.floor(itemGroup[0].timestamp / 60000)).padStart(2, '0')}:${String(Math.floor((itemGroup[0].timestamp % 60000) / 1000)).padStart(2, '0')}`}
                                        </Typography>
                                    </div>
                                </div>
                                {itemGroupIndex !== buildData.itemTimeline[currBuildChamp.participantId - 1].itemHistory.length - 1 && (
                                    <div>
                                        <ForwardIcon style={{ fontSize: '42px', color: '#A4A4A4', marginLeft: '10px', marginRight: '10px' }}></ForwardIcon>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                </div>
            </Box>
        </Grid>
    )
}

export default Builds