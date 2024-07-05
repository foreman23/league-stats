import React from 'react'
import { BarChart, LineChart } from '@mui/x-charts'
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

    // const yAxisGold1 = yAxisGold.map(item => item[0]);
    // const yAxisGold2 = yAxisGold.map(item => item[1]);
    // console.log(xAxisGold)
    // console.log(yAxisGold1)
    // console.log(yAxisGold2)


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
                    <LineChart
                        width={1100}
                        height={300}
                        xAxis={[{ 
                            data: xAxisGold,
                        }]}
                        yAxis={[{
                            colorMap: {
                                type: 'piecewise',
                                data: yAxisGold,
                                thresholds: [0],
                                colors: ['#ff6666', '#66c7ff'],
                              },
                        }]}
                        series={[
                            {
                                data: yAxisGold,
                                area: true,
                            },
                        ]}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default Graphs