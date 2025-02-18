import React from 'react'
import { Divider, Typography } from '@mui/material';

const SummonerNotFound = () => {

  const selectedRegion = localStorage.getItem('searchRegion');

  return (
    <div className='NotFoundContainer'>
      <img className='NotFoundImage' src='/images/Sad_Kitten_Emote.webp'></img>
      <Typography className='NotFoundHeader'>{`Summoner not found :(`}</Typography>
      <div className='NotFoundSubContainer'>
        <Typography className='NotFoundSubheader'>Possible reasons:</Typography>
        <ul className='NotFoundList'>
          <li><Typography>Summoner recently changed name</Typography></li>
          <li><Typography>Summoner recently changed riot tag (eg. #NA1, #TEEMO, etc.)</Typography></li>
          <li><Typography>{`Summoner doesn't exist in the selected region:`}<span style={{ fontWeight: 'bold' }}> ({selectedRegion})</span></Typography></li>
          <li><Typography>Misspelling of summoner name or riot tag</Typography></li>
        </ul>
      </div>
      <Divider style={{ marginTop: '10px', marginBottom: '5px' }}></Divider>
      <Typography className='NotFoundContact'>Please contact: <b>support@gmail.com</b> if you believe this to be an error</Typography>
    </div>
  )
}

export default SummonerNotFound