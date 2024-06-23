import React from 'react'
import { BarChart } from '@mui/x-charts'
import { Grid } from '@mui/material';

const Graphs = (props) => {
    const gameData = props.gameData;
    console.log(gameData)
    const participants = props.gameData.info.participants;

    // Damage dealt labels
    const yAxisRiotIdDealt = participants.map(participant => participant.riotIdGameName);
    const xAxisDealt = participants.map(participant => participant.totalDamageDealtToChampions);

    // Damage taken labels
    const yAxisRiotIdTaken = participants.map(participant => participant.riotIdGameName);
    const xAxisTaken = participants.map(participant => participant.totalDamageTaken);

    return (
        <div>
            <Grid container>
                <Grid xs={6}>
                    <BarChart
                        width={600}
                        height={300}
                        layout='horizontal'
                        yAxis={[{ data: yAxisRiotIdDealt, scaleType: 'band' }]}
                        series={[
                            {
                                data: xAxisDealt,
                                label: 'Damage to Champions',
                                id: 'damageDealt'
                            },
                        ]}
                        margin={{ left: 150 }}
                    />
                </Grid>
                <Grid xs={6}>
                    <BarChart
                        width={600}
                        height={300}
                        layout='horizontal'
                        yAxis={[{ data: yAxisRiotIdTaken, scaleType: 'band' }]}
                        series={[
                            {
                                data: xAxisTaken,
                                label: 'Damage Taken',
                                id: 'damageTaken'
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