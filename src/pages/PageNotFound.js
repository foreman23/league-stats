import React from 'react'
import { Typography } from '@mui/material';

const PageNotFound = () => {
  return (
    <div className='NotFoundContainer'>
      <Typography className='PageNotFoundHeader'>{`404: Page not found`}</Typography>
      <div className='PageNotFoundDiv'>
        <Typography className='PageNotFoundDivContent'>Please contact: <a href='mailto:riftreportgg@gmail.com'><b>riftreportgg@gmail.com</b></a> if you believe this to be an error</Typography>
      </div>
      <img alt='Page not found' className='NotFoundImage' src='/images/Does_Not_Compute_Emote.webp'></img>
    </div>
  )
}

export default PageNotFound