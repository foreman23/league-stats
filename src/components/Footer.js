import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';

function Footer() {
  return (
    <div className='footerContainer'>
      <Divider variant="middle" width={'50%'} style={{ margin: 'auto', marginBottom: '10px' }} flexItem />
      <Typography className='footer'>
        © 2024-2025 RiftReport.gg is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
      </Typography>
    </div>
  );
}

export default Footer;
