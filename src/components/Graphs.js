import React from 'react'
import { BarChart, LineChart } from '@mui/x-charts'
import { Grid, Typography } from '@mui/material';
import TeamGoldDifGraph from './TeamGoldDifGraph';

const Graphs = (props) => {
    console.log(props)
    const graphData = props.graphData;

    return (
        <div>
            <Grid container>
                <Grid xs={6}>
                    <Typography fontWeight={'bold'} className='GraphHeader'>Damage Dealt</Typography>
                    <BarChart
                        width={550}
                        height={300}
                        layout='horizontal'
                        yAxis={[{
                            data: graphData.yAxisRiotIdDealt.map(item => item.name),
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                values: graphData.yAxisRiotIdDealt.map(item => item.name),
                                colors: graphData.barColors
                            }
                        }]}
                        series={[
                            {
                                data: graphData.xAxisDealt,
                                id: 'damageDealt',
                            },
                        ]}
                        margin={{ left: 200 }}
                    />
                </Grid>
                <Grid xs={6}>
                    <Typography fontWeight={'bold'} className='GraphHeader'>Damage Taken</Typography>
                    <BarChart
                        width={550}
                        height={300}
                        layout='horizontal'
                        yAxis={[{
                            data: graphData.yAxisRiotIdDealt.map(item => item.name),
                            scaleType: 'band',
                            colorMap: {
                                type: 'ordinal',
                                values: graphData.yAxisRiotIdDealt.map(item => item.name),
                                colors: graphData.barColors,
                            }
                        }]}
                        series={[
                            {
                                data: graphData.xAxisTaken,
                                id: 'damageTaken'
                            },
                        ]}
                        margin={{ left: 200 }}
                    />
                </Grid>
                <TeamGoldDifGraph teamId={props.teamId} yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
            </Grid>
        </div>
    )
}

export default Graphs