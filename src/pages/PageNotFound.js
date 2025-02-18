import React from 'react'
import Navbar from '../components/Navbar';
import { Typography } from '@mui/material';

const PageNotFound = () => {
  return (
    <div className='NotFoundContainer'>
      <Typography className='PageNotFoundHeader'>{`404: Page not found`}</Typography>
      <div className='PageNotFoundDiv'>
        <Typography className='PageNotFoundDivContent'>Please contact: <b>support@gmail.com</b> if you believe this to be an error</Typography>
      </div>
      <img className='NotFoundImage' src='/images/Does_Not_Compute_Emote.webp'></img>
    </div>
  )
}

export default PageNotFound