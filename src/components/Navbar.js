import * as React from 'react';
import { Box, Button, Typography, Toolbar, AppBar, TextField } from '@mui/material';


function Navbar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <a href='/' style={{ textDecoration: 'none' }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            League Stats Site
                        </Typography>
                    </a>
                    <TextField placeholder='Search for a Summoner'></TextField>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Navbar