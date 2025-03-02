import React from 'react'
import { Button, Typography, Grid, Tooltip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { useParams, useLocation } from 'react-router-dom';
// import queues from '../jsonData/queues.json'
import OverviewTable from '../components/OverviewTable';

const ArenaDetails = () => {

    const [queues, setQueues] = useState(null);
    const [queueTitle, setQueueTitle] = useState(null);

    // Init navigate
    const navigate = useNavigate();

    // Get props
    const location = useLocation();
    const { summonerName } = useParams();
    const { gameData } = location.state;
    // const { alternateRegion } = location.state;
    const { dataDragonVersion } = location.state;

    // Find player data
    const playerData = gameData.info.participants.find(player => player.riotIdGameName === summonerName)

    // Find teammate player
    const teammateData = gameData.info.participants.find(player => player.placement === playerData.placement && player.summonerId !== playerData.summonerId)

    // Find duration and date of game start
    let gameStartDate = new Date(gameData.info.gameCreation);
    // console.log(gameStartDate)
    let gameDuration = gameData.info.gameDuration;
    if (gameDuration >= 3600) {
        gameDuration = `${(gameDuration / 3600).toFixed(1)} hrs`
        if (gameDuration === '1.0 hrs') {
            gameDuration = '1 hr';
        }
    }
    else {
        gameDuration = `${Math.floor((gameDuration / 60))} mins`
    }

    // Handle section button click
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }

    // Generate placement suffix
    let placementSuffix = null;
    if (playerData.placement === 1) {
        placementSuffix = "st";
    }
    else if (playerData.placement === 2) {
        placementSuffix = "nd";
    }
    else if (playerData.placement === 3) {
        placementSuffix = "rd";
    }
    else {
        placementSuffix = "th";
    }

    const findQueueInfo = useCallback(async () => {
        const queue = queues.find(queue => queue.queueId === gameData.info.queueId);
        return queue;
    }, [queues, gameData])

    // Search JSON for relevant Queue data
    const findQueueTitle = useCallback(async () => {

        let queue = await findQueueInfo();

        let queueTitle = queue.description;
        if (queueTitle === '5v5 Ranked Solo games') {
            setQueueTitle('Ranked Solo');
        }
        if (queueTitle === '5v5 Ranked Flex games') {
            setQueueTitle('Ranked Flex');
        }
        if (queueTitle === '5v5 Draft Pick games') {
            // queueTitle = 'Normal'
            setQueueTitle('Normal');
        }
        else if (queueTitle === '5v5 ARAM games') {
            // queueTitle = 'ARAM';
            setQueueTitle('ARAM')
        }
        else if (queueTitle === 'Arena') {
            setQueueTitle('Arena')
        }
    }, [findQueueInfo])

    const getQueueJSON = async () => {
        try {
            const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
            const data = await response.json();
            setQueues(data);
        } catch (error) {
            console.error('Error fetching queue data:');
        }
    }

    useEffect(() => {
        // Fetch queue data JSON
        getQueueJSON();

    }, [])

    useEffect(() => {
        if (queues) {
            // Call queue title function
            findQueueTitle();
        }

    }, [queues, findQueueTitle])

    return (
        <div>
            <div id={'SummaryAnchor'} style={{ backgroundColor: 'white' }}>

                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                    {/* Section 1 */}
                    <Grid container marginLeft={'2%'} marginRight={'2%'} marginTop={'2%'} maxWidth={'90%'}>
                        <Grid style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
                            {playerData.win ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img alt='Champion 1' style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`}></img>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img alt='Champion 1' style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`}></img>
                                </div>
                            )}
                            <img alt='' style={{ width: '55px' }} src='/images/deal.png'></img>
                            {playerData.win ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img alt='Champion 2' style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${teammateData.championName}.png`}></img>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img alt='Champion 2' style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${teammateData.championName}.png`} ></img>
                                </div>
                            )}
                        </Grid>
                        <Grid justifyContent={'center'} item xs={7}>
                            <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>
                                <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                    <span className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)}>
                                        {` ${playerData.riotIdGameName} (${playerData.championName})`}
                                    </span>
                                </Tooltip>
                                <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${teammateData.riotIdGameName} #${teammateData.riotIdTagline}`}>
                                    <span className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${teammateData.riotIdGameName}/${teammateData.riotIdTagline.toLowerCase()}`)}>
                                        {` and ${teammateData.riotIdGameName} (${teammateData.championName})`}
                                    </span>
                                </Tooltip>
                                {` placed`}
                                <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}> {playerData.placement}{placementSuffix}</span> in an arena match lasting {gameDuration}.
                            </Typography>
                            <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }} fontSize={14}>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                            <span style={{ textAlign: 'start' }}>
                                <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('SummaryAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Summary</Button>
                                {/* <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('GraphsAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Graphs</Button> */}
                                {/* <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Builds</Button> */}
                            </span>
                            {/* <Button onClick={() => determineFeatsFails(gameData, playerData.teamId, timelineData)}>Debug feats and fails</Button> */}
                        </Grid>
                    </Grid>
                </Grid>
            </div>

            {/* Section 2 */}
            <div style={{ backgroundColor: '#f2f2f2', paddingBottom: '80px' }}>
                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '40px', paddingTop: '40px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <OverviewTable placementIndex={1} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={2} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={3} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={4} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={5} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={6} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={7} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                    <OverviewTable placementIndex={8} gameMode={"CHERRY"} dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName}></OverviewTable>
                </Grid>
            </div>
        </div>
    )
}

export default ArenaDetails