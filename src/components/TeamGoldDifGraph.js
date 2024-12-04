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

    console.log(props.yAxisGold)
    console.log(props.xAxisGold)


    // If player team is red flip negative gold to positive
    let yAxisGold = [...props.yAxisGold];
    let colors = ['#ff6666', '#66c7ff'];
    if (props.teamId === 200) {
        yAxisGold = yAxisGold.map((value) => value * -1);  
        colors = ['#66c7ff', '#ff6666'];    
    }

    return (
        <div>
            <Grid style={{ display: 'flex' }} xs={12}>
                {props.hideTitle ? (
                    <div></div>
                ) : (
                    <Typography fontWeight={'bold'} className='GraphHeader'>Team Gold Advantage</Typography>
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