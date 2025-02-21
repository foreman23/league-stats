import React from 'react'
import { Typography, Grid } from '@mui/material'
import { LineChart } from '@mui/x-charts'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

const TeamGoldDifGraph = (props) => {
    let width = 1000;
    let height = 300;
    if (props.width) {
        width = props.width;
    }
    if (props.height) {
        height = props.height;
    }

    // console.log(props.xAxisGold, props.yAxisGold)

    // If player team is red flip negative gold to positive
    let yAxisGold = [...props.yAxisGold];
    let colors = ['#FF3F3F', '#568CFF'];
    if (props.teamId === 200) {
        yAxisGold = yAxisGold.map((value) => value * -1);
        colors = ['#568CFF', '#FF3F3F'];
    }

    let xAxisGold = props.xAxisGold;
    if (props.max) {
        xAxisGold = xAxisGold.slice(0, props.max)
        yAxisGold = yAxisGold.slice(0, props.max)
    }

    // Calculate difference value
    let valueChange = null;
    let arrowType = null;
    let arrowColor = null;
    if (props.arrow) {
        let currValue = yAxisGold[yAxisGold.length - 1]
        let prevValue = yAxisGold[yAxisGold.length - 2]
        valueChange = (prevValue - currValue)

        // If gold change less than 200
        if (Math.abs(valueChange) < 50) {
            arrowColor = 'black'
            arrowType = 'nochange'
            if (props.teamId === 200) {
                valueChange = valueChange * -1
            }
        }
        // Otherwise
        else if (currValue > prevValue) {
            arrowColor = colors[1]
            if (Math.abs(valueChange) > 1500) {
                arrowType = 'doubleUp'
            } else {
                arrowType = 'up'
            }
            valueChange = valueChange * -1
        } else {
            arrowColor = colors[0]
            if (Math.abs(valueChange) > 1500) {
                arrowType = 'doubleDown'
            } else {
                arrowType = 'down'
            }
            valueChange = valueChange * -1
        }


    }

    return (
        <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
            {props.arrow &&
                <div style={{ position: 'absolute', left: 'auto', right: '0px', top: '0px', display: 'flex', alignItems: 'center', backgroundColor: arrowColor === 'black' ? '#E9E9E9' : arrowColor === '#568CFF' ? '#ECF2FF' : '#FFF1F3', padding: '5px', borderRadius: '10px' }}>
                    <Typography style={{ textAlign: 'center', color: arrowColor, fontSize: '15px' }}>{`${valueChange > 0 ? '+' : ''}${valueChange.toLocaleString()}g`}</Typography>
                    {arrowType === 'up' &&
                        <KeyboardArrowUpIcon style={{ color: arrowColor, fontSize: '30px' }}></KeyboardArrowUpIcon>
                    }
                    {arrowType === 'doubleUp' &&
                        <KeyboardDoubleArrowUpIcon style={{ color: arrowColor, fontSize: '30px' }}></KeyboardDoubleArrowUpIcon>
                    }
                    {arrowType === 'down' &&
                        <KeyboardArrowDownIcon style={{ color: arrowColor, fontSize: '30px' }}></KeyboardArrowDownIcon>
                    }
                    {arrowType === 'doubleDown' &&
                        <KeyboardDoubleArrowDownIcon style={{ color: arrowColor, fontSize: '30px' }}></KeyboardDoubleArrowDownIcon>
                    }
                    {arrowType === 'nochange' &&
                        <HorizontalRuleIcon style={{ color: arrowColor, fontSize: '30px' }}></HorizontalRuleIcon>
                    }
                </div>
            }
            <Grid item style={{ display: 'flex', flexDirection: props.hideTitle ? 'row' : 'column' }} xs={12}>
                {props.hideTitle ? (
                    <div></div>
                ) : (
                    <Typography className='damageDealtGraphHeader'>GOLD ADVANTAGE</Typography>
                )}
                <div style={{ height: height, width: '100%' }}>
                    <LineChart
                        sx={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.2))' }}
                        xAxis={[{
                            data: xAxisGold,
                            min: 2,
                            max: Math.max(...xAxisGold)
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
                </div>
            </Grid>
        </div>
    )
}

export default TeamGoldDifGraph