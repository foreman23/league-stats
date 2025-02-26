import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Grid, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress, Tooltip } from '@mui/material';

const OverviewTable = (props) => {

    // Init navigate
    const navigate = useNavigate();

    const { dataDragonVersion, gameData, summonerName, placementIndex, gameMode } = props;

    // Find highest damage dealt
    let highestDamageDealt = 0;
    gameData.info.participants.forEach((player) => {
        if (player.totalDamageDealtToChampions > highestDamageDealt) {
            highestDamageDealt = player.totalDamageDealtToChampions;
        }
    });

    // Generate placement suffix
    let placementSuffix = null;
    if (placementIndex === 1) {
        placementSuffix = "st";
    }
    else if (placementIndex === 2) {
        placementSuffix = "nd";
    }
    else if (placementIndex === 3) {
        placementSuffix = "rd";
    }
    else {
        placementSuffix = "th";
    }

    return (
        <Grid className={gameMode === "CHERRY" ? 'GameOverViewTableArena' : 'GameOverviewTable'} style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }} justifyContent={'center'} backgroundColor={(gameData.info.participants.find(player => player.placement === placementIndex)).win ? '#EDF8FF' : '#FFF1F3'} boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
            <TableContainer justifyContent='center'>
                <Table size='small'>
                    <TableHead>
                        <TableRow style={{ alignItems: 'center' }}>
                            <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    {gameMode === "CHERRY" ? (
                                        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                                            <Typography color={(gameData.info.participants.find(player => player.placement === placementIndex)).win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{(gameData.info.participants.find(player => player.placement === placementIndex)).win ? "Victory" : "Defeat"}</Typography>
                                            <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>{placementIndex}{placementSuffix}</Typography>
                                        </div>
                                    ) : (
                                        <Typography color={gameData.info.teams[0].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[0].win ? "Victory" : "Defeat"}</Typography>
                                    )}
                                </div>
                            </TableCell>
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center' style={{ fontWeight: '600' }}>Role</TableCell>
                            ) : (
                                <div></div>
                            )}
                            <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                            <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                            <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                            ) : (
                                <div></div>
                            )}
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center' style={{ fontWeight: '600' }}>Wards</TableCell>
                            ) : (
                                <div></div>
                            )}
                            <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                        </TableRow>
                    </TableHead>
                    {gameData.info.participants.filter(player => player.placement === placementIndex).map((player, index) => (
                        <TableRow key={index}>
                            <TableCell style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <img alt='Champion' style={{ width: '38px', borderRadius: '100%', marginRight: '3px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}></img>
                                    <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><Typography className='summonerNameTable' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`)} fontSize={'12px'}>{player.riotIdGameName}</Typography>
                                        </Typography>
                                    </Tooltip>
                                </div>
                            </TableCell>
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                            ) : (
                                <div></div>
                            )}
                            <TableCell align='center'>
                                <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                                <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{(player.kills / player.deaths).toFixed(1)}</Typography>
                            </TableCell>
                            <TableCell align='center'>
                                <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                                <Tooltip disableInteractive title={<div>{`Physical: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`Magical: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
                                    <LinearProgress variant='determinate' value={(player.totalDamageDealtToChampions / highestDamageDealt) * 100} sx={{ margin: 'auto', marginTop: '2px', backgroundColor: '#D9D9D9', '& .MuiLinearProgress-bar': { backgroundColor: '#37B7FF' }, width: '50%', height: '10px' }}></LinearProgress>
                                </Tooltip>
                            </TableCell>
                            <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center'>
                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography>
                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.totalMinionsKilled + player.neutralMinionsKilled) / (gameData.info.gameDuration / 60)).toFixed(1)}/m</Typography>
                                </TableCell>
                            ) : (
                                <div></div>
                            )}
                            {gameMode !== "CHERRY" ? (
                                <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>
                                    {player.wardsPlaced}</Typography>
                                </TableCell>
                            ) : (
                                <div></div>
                            )}
                            <TableCell align='center'>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <Tooltip arrow title={`${player.item0}`}>
                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                alt="Item1">
                                            </img>
                                        </Tooltip>
                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                            src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                            alt="Item2"></img>
                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                            src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                            alt="Item3"></img>
                                        <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                            src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                            alt="Item4"></img>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                            src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                            alt="Item5"></img>
                                        <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                            src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                            alt="Item6"></img>
                                        <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                            src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                            alt="Item7"></img>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default OverviewTable