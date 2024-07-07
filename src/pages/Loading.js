import React from 'react'
import { Box, LinearProgress } from '@mui/material'
import Navbar from '../components/Navbar'

const Loading = () => {
    return (
        <div>
            <Box>
                <Navbar></Navbar>
                <LinearProgress></LinearProgress>
            </Box>
        </div>
    )
}

export default Loading