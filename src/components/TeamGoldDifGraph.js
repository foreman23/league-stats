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
                    }]}
                    yAxis={[{
                        colorMap: {
                            type: 'piecewise',
                            data: props.yAxisGold,
                            thresholds: [0],
                            colors: ['#ff6666', '#66c7ff'],
                        },
                    }]}
                    series={[
                        {
                            data: props.yAxisGold,
                            area: true,
                        },
                    ]}
                />
            </Grid>
        </div>
    )
}

export default TeamGoldDifGraph