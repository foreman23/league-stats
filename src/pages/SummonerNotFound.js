import React from 'react'
import Navbar from '../components/Navbar';
import { Button, Typography } from '@mui/material';

const SummonerNotFound = () => {
  return (
    <div>
        <Navbar></Navbar>
        <Typography color={'red'} style={{ fontSize: '64px' }}>{`Summoner not found :(`}</Typography>
        <Button href='/' variant='contained'>Return</Button>
    </div>
  )
}

export default SummonerNotFound