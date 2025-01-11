import React from 'react'
import { Typography, Grid } from '@mui/material'
import { LineChart } from '@mui/x-charts'

const TeamGoldDifGraph = (props) => {
    let width = 1000;
    let height = 300;
    if (props.width) {
        width = props.width;
    }
    if (props.height) {
        height = props.height;
    }

    // If player team is red flip negative gold to positive
    let yAxisGold = [...props.yAxisGold];
    let colors = ['#FF3F3F', '#568CFF'];
    if (props.teamId === 200) {
        yAxisGold = yAxisGold.map((value) => value * -1);  
        colors = ['#568CFF', '#FF3F3F'];    
    }

    return (
        <div style={{ overflow: 'hidden' }}>
            <Grid style={{ display: 'flex', flexDirection: props.hideTitle ? 'row' : 'column' }} xs={12}>
                {props.hideTitle ? (
                    <div></div>
                ) : (
                    <Typography className='damageDealtGraphHeader'>GOLD ADVANTAGE</Typography>
                )}
                <LineChart
                    width={width}
                    height={height}
                    xAxis={[{
                        data: props.xAxisGold,
                        min: 2,
                        max: Math.max(...props.xAxisGold)
                    }]}
                    yAxis={[{
                        colorMap: {
                            type: 'piecewise',
                            data: yAxisGold,
                            thresholds: [0],
                            colors: colors,
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
        </div>
    )
}

export default TeamGoldDifGraph