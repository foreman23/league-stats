import React from 'react'
import { BarChart } from '@mui/x-charts'
import { Grid, Typography } from '@mui/material';

const Graphs = (props) => {
    const gameData = props.gameData;
    const timelineData = props.timelineData
    console.log(gameData)
    console.log(timelineData)
    const participants = props.gameData.info.participants;

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
    const xAxisData = frames.map((_, index) => index);

    const participantTeamIds = participants.map((participant) => participant.teamId)
    console.log(participantTeamIds)

    const yAxisData = frames.map((frame) => {
        const team1Gold = frame.participantFrames[1].totalGold
        return team1Gold;
    });    
    console.log(xAxisData)
    console.log(yAxisData)

    return (
        <div>
            <Grid container>
                <Grid xs={6}>
                    <Typography fontWeight={'bold'} className='GraphHeader'>Damage Dealt</Typography>
                    <BarChart
                        width={600}
                        height={300}
                        layout='horizontal'
                        yAxis={[{
                            data: yAxisRiotIdDealt.map(item => item.name),
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                values: yAxisRiotIdDealt.map(item => item.name),
                                colors: barColors
                            }
                        }]}
                        series={[
                            {
                                data: xAxisDealt,
                                id: 'damageDealt',
                            },
                        ]}
                        margin={{ left: 200 }}
                    />
                </Grid>
                <Grid xs={6}>
                    <Typography fontWeight={'bold'} className='GraphHeader'>Damage Taken</Typography>
                    <BarChart
                        width={600}
                        height={300}
                        layout='horizontal'
                        yAxis={[{
                            data: yAxisRiotIdDealt.map(item => item.name),
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                values: yAxisRiotIdDealt.map(item => item.name),
                                colors: barColors,
                            }
                        }]}
                        series={[
                            {
                                data: xAxisTaken,
                                id: 'damageTaken'
                            },
                        ]}
                        margin={{ left: 200 }}
                    />
                </Grid>
                <Grid xs={12}>
                    <Typography fontWeight={'bold'} className='GraphHeader'>Team Gold Advantage</Typography>
                    <BarChart
                        width={1150}
                        height={300}
                        layout='horizontal'
                        yAxis={[{
                            data: yAxisRiotIdDealt,
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                values: yAxisRiotIdDealt,
                                colors: barColors
                            }
                        }]}
                        series={[
                            {
                                data: xAxisDealt,
                                id: 'damageDealt',
                            },
                        ]}
                        margin={{ left: 150 }}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default Graphs