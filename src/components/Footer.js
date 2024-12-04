import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';

function Footer() {
  return (
    <div style={{ justifyContent: 'center', marginTop: 'auto', display: 'flex', paddingBottom: '15px'}}>
      <Typography
        style={{
          width: '50%',
          fontSize: '12px',
          lineHeight: '16px',
          color: '#9AA4AF',
          textAlign: 'center'
        }}
      >
        RiftReport is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
      </Typography>
    </div>
  );
}

export default Footer;
