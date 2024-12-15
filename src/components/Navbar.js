import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Toolbar, AppBar, TextField, IconButton, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


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

        if (summonerName) {
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
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar style={{ backgroundColor: '#404040', color: 'white' }} position="static">
                <Toolbar>
                    <a href='/' style={{ textDecoration: 'none', color: 'white', flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={'bold'} marginRight='5px' component="div" sx={{ flexGrow: 1 }}>
                            RiftReport.gg
                        </Typography>
                        <img style={{ width: '40px' }} src='/images/sorakaLogo.webp'></img>

                    </a>
                    <span style={{ marginLeft: 'auto', alignItems: 'center', display: 'inline-flex' }}>
                    <Select
                        sx={{
                            backgroundColor: '#4d4d4d',
                            color: '#d9d9d9',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            height: '46px',
                            borderTopRightRadius: '0px',
                            borderBottomRightRadius: '0px',
                        }}
                        defaultValue={10}>
                        <MenuItem value={10}>NA</MenuItem>
                        <MenuItem value={20}>EUW</MenuItem>
                    </Select>
                    <TextField
                        onChange={updateSummonerNameState}
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                handleSearchSubmit();
                            }
                        }}
                        sx={{
                            width: '500px',
                            backgroundColor: '#333333',
                            borderTopRightRadius: '5px',
                            borderBottomRightRadius: '5px',
                            input: {
                                color: 'white',
                                paddingBottom: '20px',
                                height: '5px'
                            },
                            margin: '10px',
                            marginLeft: '0px',
                            marginRight: '5px',
                        }}
                        size='small'
                        variant='filled'
                        placeholder='Search for a Summoner'>
                    </TextField>
                    <IconButton style={{ marginTop: '2px' }} onClick={handleSearchSubmit} color="inherit">
                        <SearchIcon></SearchIcon>
                    </IconButton>
                    </span>
                    <Select
                        size='small'
                        sx={{
                            backgroundColor: '#4d4d4d',
                            color: '#d9d9d9',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginLeft: 'auto',
                        }}
                        defaultValue={10}>
                        <MenuItem value={10}>English</MenuItem>
                        <MenuItem value={20}>한국어</MenuItem>
                    </Select>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Navbar