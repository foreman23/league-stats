import React from 'react'
import { Grid, Table, TableHead, TableContainer, TableCell, TableRow, TableBody, Tooltip, Typography, LinearProgress } from '@mui/material'

const DetailsTable = (props) => {

    const {
        playerData,
        gameData,
        champsJSON,
        dataDragonVersion,
        summonerSpellsObj,
        summonerName,
        playersWithScores,
        getKeystoneIconUrl,
        runesObj,
        highestDamageDealt,
        items
    } = props;

    return (
        <Grid className='GameOverViewContainer' width={'65%'} style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '10px', paddingTop: '40px', maxWidth: '100vw' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {/* Blue Team */}
            <Grid order={playerData.teamId === 100 ? 1 : 2} width={'100%'} className={playerData.teamId === 100 ? 'GameOverviewTable1' : 'GameOverviewTable2'} style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }} justifyContent={'center'} backgroundColor='#EDF8FF' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
                <TableContainer>
                    <Table size='small'>
                        <TableHead>
                            <TableRow style={{ alignItems: 'center' }}>
                                <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Typography color={gameData.info.teams[0].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[0].win ? "Victory" : "Defeat"}</Typography>
                                        <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Blue Team)</Typography>
                                    </div>
                                </TableCell>
                                {!props.aram && !props.urf &&
                                    <TableCell align='center' style={{ fontWeight: '600' }}>Role</TableCell>
                                }
                                <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                {!props.aram &&
                                    <TableCell align='center' style={{ fontWeight: '600' }}>Wards</TableCell>
                                }
                                <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gameData.info.participants.filter(player => player.teamId === 100).map((player, index) => (
                                <TableRow key={`blue_row_${index}`}>
                                    <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                <div style={{ position: 'relative', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                                    <Typography style={{
                                                        fontSize: '11px',
                                                        position: 'absolute',
                                                        backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54',
                                                        color: 'white',
                                                        borderRadius: '100%',
                                                        paddingLeft: '4px',
                                                        paddingRight: '4px',
                                                        paddingTop: '1px',
                                                        paddingBottom: '1px',
                                                        textAlign: 'center',
                                                        right: 'auto',
                                                        bottom: 'auto',
                                                        top: '-5px',
                                                        left: '0px',
                                                        justifyContent: 'center'
                                                    }}>{player.champLevel}
                                                    </Typography>
                                                    <img style={{
                                                        width: '38px',
                                                        borderRadius: '100%',
                                                        marginRight: '3px',
                                                        border: player.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid'
                                                    }}
                                                        src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}>
                                                    </img>
                                                </div>
                                            </Tooltip>
                                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                <Tooltip
                                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).description}</span></>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                </Tooltip>
                                                <Tooltip
                                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                </Tooltip>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                <Tooltip
                                                    title={<>{runesObj.find(keystone => keystone.id === player.perks.styles[0].style).key}</>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                </Tooltip>
                                            </div>
                                            <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                <a style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}>
                                                    <Typography className='summonerNameTable' fontWeight={playerData.puuid === player.puuid ? 'bold' : 'normal'} fontSize={'12px'}>{player.riotIdGameName}</Typography>
                                                    <span className={
                                                        (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                            'TableStandingMVP' :
                                                            'TableStanding')
                                                    }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                                                    </span>
                                                    <span className='TableStandingScore'>
                                                        {player.score.toFixed(1)}
                                                    </span>
                                                </a>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    {!props.aram && !props.urf &&
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                                    }
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.kills + player.assists) / player.deaths).toFixed(1)}</Typography>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                                        <Tooltip disableInteractive title={<div>{`AD: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`AP: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
                                            <LinearProgress variant='determinate' value={(player.totalDamageDealtToChampions / highestDamageDealt) * 100} sx={{ margin: 'auto', marginTop: '2px', backgroundColor: '#D9D9D9', '& .MuiLinearProgress-bar': { backgroundColor: '#37B7FF' }, width: '50%', height: '10px' }}></LinearProgress>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.totalMinionsKilled + player.neutralMinionsKilled) / (gameData.info.gameDuration / 60)).toFixed(1)}/m</Typography>
                                    </TableCell>
                                    {!props.aram &&
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                                    }
                                    <TableCell align='center'>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                {player?.item0 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item0]?.name}</span><br />
                                                            <span>{items.data[player.item0]?.plaintext || items.data[player.item0]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                            alt="Item1">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                        alt="Item1">
                                                    </img>
                                                )
                                                }
                                                {player?.item1 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item1]?.name}</span><br />
                                                            <span>{items.data[player.item1]?.plaintext || items.data[player.item1]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                            alt="Item2">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                        alt="Item2">
                                                    </img>
                                                )
                                                }
                                                {player?.item2 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item2]?.name}</span><br />
                                                            <span>{items.data[player.item2]?.plaintext || items.data[player.item2]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                            alt="Item3">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                        alt="Item3">
                                                    </img>
                                                )
                                                }
                                                {player?.item6 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item6]?.name}</span><br />
                                                            <span>{items.data[player.item6]?.plaintext || items.data[player.item6]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                            alt="Ward">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                        alt="Ward">
                                                    </img>
                                                )
                                                }
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                {player?.item3 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item3]?.name}</span><br />
                                                            <span>{items.data[player.item3]?.plaintext || items.data[player.item3]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                            alt="Item4">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                        alt="Item4">
                                                    </img>
                                                )
                                                }
                                                {player?.item4 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item4]?.name}</span><br />
                                                            <span>{items.data[player.item4]?.plaintext || items.data[player.item4]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                            alt="Item5">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                        alt="Item5">
                                                    </img>
                                                )
                                                }
                                                {player?.item5 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item5]?.name}</span><br />
                                                            <span>{items.data[player.item5]?.plaintext || items.data[player.item5]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                            alt="Item6">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                        alt="Item6">
                                                    </img>
                                                )
                                                }
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            {/* Red Team */}
            <Grid order={playerData.teamId === 200 ? 1 : 2} className={playerData.teamId === 200 ? 'GameOverviewTable1' : 'GameOverviewTable2'} style={{ display: 'flex', justifyContent: 'center', margin: 'auto', marginLeft: '0%', marginRight: '0%' }} marginLeft={'10%'} marginRight={'10%'} backgroundColor='#FFF1F3' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
                <TableContainer>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Typography color={gameData.info.teams[1].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[1].win ? "Victory" : "Defeat"}</Typography>
                                        <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Red Team)</Typography>
                                    </div>
                                </TableCell>
                                {!props.aram && !props.urf &&
                                    <TableCell align='center' style={{ fontWeight: '600' }}>Role</TableCell>
                                }
                                <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                {!props.aram &&
                                    <TableCell align='center' style={{ fontWeight: '600' }}>Wards</TableCell>
                                }
                                <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gameData.info.participants.filter(player => player.teamId === 200).map((player, index) => (
                                <TableRow key={`red${index}`}>
                                    <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                <div style={{ position: 'relative', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                                    <Typography style={{
                                                        fontSize: '11px',
                                                        position: 'absolute',
                                                        backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54',
                                                        color: 'white',
                                                        borderRadius: '100%',
                                                        paddingLeft: '4px',
                                                        paddingRight: '4px',
                                                        paddingTop: '1px',
                                                        paddingBottom: '1px',
                                                        textAlign: 'center',
                                                        right: 'auto',
                                                        bottom: 'auto',
                                                        top: '-5px',
                                                        left: '0px',
                                                        justifyContent: 'center'
                                                    }}>{player.champLevel}
                                                    </Typography>
                                                    <img style={{
                                                        width: '38px',
                                                        borderRadius: '100%',
                                                        marginRight: '3px',
                                                        border: player.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid'
                                                    }}
                                                        src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}>
                                                    </img>
                                                </div>
                                            </Tooltip>
                                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                <Tooltip
                                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).description}</span></>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                </Tooltip>
                                                <Tooltip
                                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                </Tooltip>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                <Tooltip
                                                    title={<>{runesObj.find(keystone => keystone.id === player.perks.styles[0].style).key}</>}
                                                    disableInteractive
                                                    placement='top'
                                                    arrow
                                                    slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                </Tooltip>
                                            </div>
                                            <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                <a style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}>
                                                    <Typography className='summonerNameTable' fontWeight={playerData.puuid === player.puuid ? 'bold' : 'normal'} fontSize={'12px'}>{player.riotIdGameName}</Typography>
                                                    <span className={
                                                        (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                            'TableStandingMVP' :
                                                            'TableStanding')
                                                    }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                                                    </span>
                                                    <span className='TableStandingScore'>
                                                        {player.score.toFixed(1)}
                                                    </span>
                                                </a>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    {!props.aram && !props.urf &&
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                                    }
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.kills + player.assists) / player.deaths).toFixed(1)}</Typography>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                                        <Tooltip disableInteractive title={<div>{`AD: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`AP: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
                                            <LinearProgress variant='determinate' value={(player.totalDamageDealtToChampions / highestDamageDealt) * 100} sx={{ margin: 'auto', marginTop: '2px', backgroundColor: '#D9D9D9', '& .MuiLinearProgress-bar': { backgroundColor: '#FF3F3F' }, width: '50%', height: '10px' }}></LinearProgress>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                                    <TableCell align='center'>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography>
                                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.totalMinionsKilled + player.neutralMinionsKilled) / (gameData.info.gameDuration / 60)).toFixed(1)}/m</Typography>
                                    </TableCell>
                                    {!props.aram &&
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                                    }
                                    <TableCell align='center'>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                {player?.item0 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item0]?.name}</span><br />
                                                            <span>{items.data[player.item0]?.plaintext || items.data[player.item0]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                            alt="Item1">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                        alt="Item1">
                                                    </img>
                                                )
                                                }

                                                {player?.item1 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item1]?.name}</span><br />
                                                            <span>{items.data[player.item1]?.plaintext || items.data[player.item1]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                            alt="Item2">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                        alt="Item2">
                                                    </img>
                                                )
                                                }

                                                {player?.item2 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item2]?.name}</span><br />
                                                            <span>{items.data[player.item2]?.plaintext || items.data[player.item2]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                            alt="Item3">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                        alt="Item3">
                                                    </img>
                                                )
                                                }

                                                {player?.item6 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item6]?.name}</span><br />
                                                            <span>{items.data[player.item6]?.plaintext || items.data[player.item6]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                            alt="Ward">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                        alt="Ward">
                                                    </img>
                                                )
                                                }
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                {player?.item3 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item3]?.name}</span><br />
                                                            <span>{items.data[player.item3]?.plaintext || items.data[player.item3]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                            alt="Item4">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                        alt="Item4">
                                                    </img>
                                                )
                                                }

                                                {player?.item4 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item4]?.name}</span><br />
                                                            <span>{items.data[player.item4]?.plaintext || items.data[player.item4]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                            alt="Item5">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                        alt="Item5">
                                                    </img>
                                                )
                                                }

                                                {player?.item5 ? (
                                                    <Tooltip
                                                        arrow
                                                        disableInteractive
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                        placement='top'
                                                        title={<><span style={{ textDecoration: 'underline' }}>
                                                            {items.data[player.item5]?.name}</span><br />
                                                            <span>{items.data[player.item5]?.plaintext || items.data[player.item5]?.tags[0]}</span><br />
                                                        </>}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                            alt="Item6">
                                                        </img>
                                                    </Tooltip>
                                                ) : (
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                        alt="Item6">
                                                    </img>
                                                )
                                                }
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}

export default DetailsTable