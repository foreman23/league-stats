import React from 'react'
import Navbar from '../components/Navbar';
import { Typography } from '@mui/material';

const PageNotFound = () => {
  return (
    <div>
        <Typography color={'red'} style={{ fontSize: '64px' }}>{`Page not found - 404`}</Typography>
    </div>
  )
}

export default PageNotFound