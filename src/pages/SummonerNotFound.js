import React from 'react'
import { Divider, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const SummonerNotFound = () => {

  const { riotId, summonerName } = useParams()
  const selectedRegion = localStorage.getItem('searchRegion');

  return (
    <div className='NotFoundContainer'>
      <img className='NotFoundImage' src='/images/Sad_Kitten_Emote.webp'></img>
      <Typography className='NotFoundHeader'>{<><span style={{ color: 'black', fontWeight: 'bold' }}>{summonerName} #{riotId}</span> not found in region: <b>{selectedRegion}</b></>}</Typography>
      <div className='NotFoundSubContainer'>
        <Typography className='NotFoundSubheader'>Possible reasons:</Typography>
        <ul className='NotFoundList'>
          <li><Typography>Summoner recently changed name</Typography></li>
          <li><Typography>Summoner recently changed riot tag (eg. #NA1, #TEEMO, etc.)</Typography></li>
          <li><Typography>Misspelling of summoner name or riot tag</Typography></li>
        </ul>
      </div>
      <Typography className='NotFoundContact'>Please contact: <b>support@gmail.com</b> if you believe this to be an error</Typography>
    </div>
  )
}

export default SummonerNotFound