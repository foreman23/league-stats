import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Toolbar, AppBar, TextField, IconButton, Select, MenuItem, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


function Navbar() {


    // Init navigate
    const navigate = useNavigate();
    const location = useLocation();

    const [summonerName, setSummonerName] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('na1');

    const [recentArr, setRecentArr] = useState(null);
    const [recentSearches, setRecentSearches] = useState(null);

    const updateSummonerNameState = async (event) => {
        const inputValue = event.target.value;
        setSummonerName(inputValue.toLowerCase());
        console.log(inputValue)
    }

    // Retrieve recent summoners from local storage
    const getRecentSearches = () => {
        let recentSearchStr = localStorage.getItem('recentSearches')
        if (recentSearchStr !== null) {
            let recentSearchArr = JSON.parse(recentSearchStr)
            recentSearchArr.reverse()
            setRecentSearches(recentSearchArr)

            let arr = []
            for (let i = 0; i < recentSearchArr.length; i++) {
                let temp = {
                    summonerName: recentSearchArr[i].summonerName,
                    selectedRegion: recentSearchArr[i].selectedRegion,
                    riotId: recentSearchArr[i].riotId
                }
                arr.push(temp)
            }
            console.log(arr)
            setRecentArr(arr)
        }
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

            // Remove trailing white space if necessary
            if (summonerNamePayload[summonerNamePayload.length - 1] === ' ') {
                summonerNamePayload = summonerNamePayload.slice(0, summonerNamePayload.length - 1)
            }

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

    // On component render
    useEffect(() => {
        getRecentSearches();
    }, [])

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
                    <span style={{ marginLeft: 'auto', alignItems: 'center', display: 'inline-flex', width: '25%' }}>
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
                        <Autocomplete
                            options={recentArr || []}
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : `${option.summonerName} #${option.riotId}`
                            }
                            value={summonerName || ''}
                            onInputChange={(event, newInputValue) => {
                                setSummonerName(newInputValue)
                            }}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setSummonerName(newValue);
                                } else if (newValue && typeof newValue === 'object') {
                                    setSummonerName(newValue.summonerName + ' #' + newValue.riotId)
                                }
                            }}
                            fullWidth
                            freeSolo
                            renderInput={(params) => (
                                <TextField
                                    style={{ backgroundColor: 'white', borderRadius: '5px' }}
                                    {...params}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder="Search by Riot ID (e.g., Teemo#NA1)"
                                />
                            )}
                        />
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