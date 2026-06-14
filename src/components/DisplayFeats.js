import React from 'react'
import { Grid, Typography } from '@mui/material';
import StyledTooltip from './StyledTooltip';

const DisplayFeats = () => {
    return (
        <div>
            <Grid style={{ width: '65%', marginTop: '2px' }} container spacing={1}>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
                <Grid item>
                    <StyledTooltip disableInteractive TransitionProps={{ timeout: 10 }}
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
                    </StyledTooltip>
                </Grid>
            </Grid>
        </div>
    )
}

export default DisplayFeats