import { Typography, Grid, Table, TableContainer, Paper, TableHead, TableBody, TableCell, TableRow } from '@mui/material'
import React from 'react'

const Battles = (props) => {

    const timelineData = props.timelineData;
    const gameData = props.gameData;
    // console.log(timelineData)
    // console.log(gameData)

    // Isolate teamfights from timeline
    const frames = timelineData.info.frames;
    let teamfights = {}
    for (const index in frames) {
        const frame = frames[index]
        for (const event in frame.events) {
            const currEvent = frame.events[event];
            if (currEvent.type === "CHAMPION_KILL") {
                console.log(currEvent)
                teamfights[currEvent.timestamp] = currEvent
            }
        }
    }
    console.log(teamfights)

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
            <Grid container>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 900 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Outcome</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Blue Victory 1 - 0</TableCell>
                                <TableCell>1:17</TableCell>
                                <TableCell>Aptem killed</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </div>
    )
}

export default Battles