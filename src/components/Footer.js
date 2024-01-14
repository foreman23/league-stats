import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';

function Footer() {
  return (
    <div style={{ position: 'relative', minHeight: '50vh' }}>
      
      <Grid
        container
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '20px', // Add padding if needed
          backgroundColor: '#F5F7FA', // Set a background color if needed
        }}
      >
        <Divider style={{ width: '30%' }} />
        <Typography
          style={{
            width: '50%',
            fontSize: '12px',
            lineHeight: '16px',
            color: '#9AA4AF',
            textAlign: 'center', // Align text to the center
          }}
        >
          [Your Product Name] is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc
        </Typography>
      </Grid>
    </div>
  );
}

export default Footer;
