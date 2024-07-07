import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Toolbar, AppBar, TextField } from '@mui/material';


function Navbar() {


    // Init navigate
    const navigate = useNavigate();
    const location = useLocation();

    const [summonerName, setSummonerName] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('na1');

    const updateSummonerNameState = async (event) => {
        const inputValue = event.target.value;
        setSummonerName(inputValue.toLowerCase());
        console.log(inputValue)
    }

    const handleSearchSubmit = async () => {
        // Extract riot tag from summoner name
        let summonerNamePayload = null;
        let riotTagPayload = null;

        // If last character is #
        if (summonerName[summonerName.length - 1] === "#") {
            summonerNamePayload = summonerName.split("#")[0];
            riotTagPayload = selectedRegion;
            // Change tag to #OCE for oc1
            if (riotTagPayload === 'oc1') {
                riotTagPayload = 'oce';
            }
        }

        // Else if contains # but not last character (contains riot tag)
        else if (summonerName.includes("#")) {
            summonerNamePayload = summonerName.split("#")[0];
            riotTagPayload = summonerName.split("#")[1];
            console.log(summonerNamePayload, riotTagPayload)
            if (riotTagPayload === undefined || riotTagPayload === null) {
            }
        }

        // If no # riot tag is provided
        else {
            summonerNamePayload = summonerName;
            riotTagPayload = selectedRegion;
            // Change tag to #OCE for oc1
            if (riotTagPayload === 'oc1') {
                riotTagPayload = 'oce';
            }
        }
        console.log(selectedRegion, summonerNamePayload, riotTagPayload)

        const newPath = `/profile/${selectedRegion}/${summonerNamePayload}/${riotTagPayload}`;

        if (location.pathname.startsWith('/profile')) {
            navigate('/loading', { replace: true });
            setTimeout(() => {
                navigate(newPath, { replace: true });
            }, 0);
        } else {
            navigate(newPath);
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <a href='/' style={{ textDecoration: 'none' }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            RiftReport
                        </Typography>
                    </a>
                    <TextField
                        onChange={updateSummonerNameState}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                handleSearchSubmit();
                            }
                        }}
                        placeholder='Search for a Summoner'>
                    </TextField>
                    <Button onClick={handleSearchSubmit} color="inherit">Search</Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Navbar