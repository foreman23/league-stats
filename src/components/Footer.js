import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';

function Footer() {
  return (
    <div className='footerContainer'>

      <Grid container>
        <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto' }}>
          <div>
            <ul className='footerList'>
              <a href='/privacy'><li><Typography>Privacy Policy</Typography></li></a>
              <a href='/terms'><li><Typography>Terms & Conditions</Typography></li></a>
              <a href='/cookies'><li><Typography>Cookie Usage</Typography></li></a>
              <a href='/about'><li><Typography>About</Typography></li></a>
              <a href='/contact'><li><Typography>Contact</Typography></li></a>
            </ul>
          </div>
        </div>
      </Grid>


      <Divider variant="middle" width={'50%'} style={{ margin: 'auto', marginBottom: '10px' }} flexItem />
      <Typography className='footer'>
        © 2025 RiftReport.gg is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
      </Typography>
    </div>
  );
}

export default Footer;
