import React from 'react'
import { Grid, Tooltip, Typography } from '@mui/material';

const DisplayFeats = () => {
    return (
        <div>
            <Grid style={{ width: '65%', marginTop: '2px' }} container spacing={1}>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FeatBadge'>Tower Dominance</Typography>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FeatBadge'>Flawless Victory</Typography>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FeatBadge'>Survivor</Typography>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FeatBadge'>Swift Execution</Typography>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FailBadge'>Teamfight Follies</Typography>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip disableInteractive TransitionProps={{ timeout: 10 }}
                        slotProps={{
                            popper: {
                                modifiers: [{ name: 'offset', options: { offset: [10, -60] } }]
                            },
                            tooltip: {
                                sx: {
                                    fontSize: '14px'
                                }
                            }
                        }}
                        title='Ler only died 2 time(s) during the match.'
                    >
                        <Typography className='FailBadge'>No Dragons</Typography>
                    </Tooltip>
                </Grid>
            </Grid>
        </div>
    )
}

export default DisplayFeats