import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Toolbar, AppBar, TextField, IconButton, Select, MenuItem, Autocomplete, Switch, FormControlLabel, FormGroup, Drawer, ListItem, List } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';


function Navbar(props) {

    const dataDragonVersion = props.dataDragonVersion

    // Init navigate
    const navigate = useNavigate();
    const location = useLocation();

    const [summonerName, setSummonerName] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('na1');
    const [favorites, setFavorites] = useState(null);

    const [recentArr, setRecentArr] = useState(null);
    const [recentSearches, setRecentSearches] = useState(null);

    const [theme, setTheme] = useState('light');

    const updateSummonerNameState = async (event) => {
        const inputValue = event.target.value;
        setSummonerName(inputValue.toLowerCase());
        console.log(inputValue)
    }

    const [openDrawer, setOpenDrawer] = useState(false);
    // Toggle menu drawer for mobile
    const toggleDrawer = (newOpen) => () => {
        setOpenDrawer(newOpen);
    };

    // Retrieve favorite summoners from local storage
    const getFavorites = () => {
        let favoritesStr = localStorage.getItem('favorites')
        if (favoritesStr !== null) {
            let favoritesArr = JSON.parse(favoritesStr)
            setFavorites(favoritesArr)
        }
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

            setOpenDrawer(false)

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

    // Retrieve previous region from local storage
    const getPrevRegion = () => {

        const regionValues = {
            10: 'na1',
            20: 'euw1',
            30: 'br1',
            40: 'eun1',
            50: 'la1',
            60: 'la2',
            70: 'oc1',
            80: 'ru',
            90: 'tr1',
            100: 'jp1',
            110: 'kr',
            120: 'ph2',
            130: 'sg2',
            140: 'tw2',
            150: 'th2',
            160: 'vn2'
        }

        let prevRegion = localStorage.getItem('searchRegion')
        if (prevRegion !== null) {
            setSelectedRegion(prevRegion)
            let defaultValue = parseInt(Object.keys(regionValues).find(
                (key) => regionValues[key] === prevRegion
            )) || 10;
            setDropdownDefaultValue(defaultValue);
        } else {
            setSelectedRegion('na1')
            setDropdownDefaultValue(10);
        }
    }

    const [dropdownDefaultValue, setDropdownDefaultValue] = useState(null);
    const handleRegionChange = async (event) => {
        const value = event.target.value;
        const regionValues = {
            10: 'na1',
            20: 'euw1',
            30: 'br1',
            40: 'eun1',
            50: 'la1',
            60: 'la2',
            70: 'oc1',
            80: 'ru',
            90: 'tr1',
            100: 'jp1',
            110: 'kr',
            120: 'ph2',
            130: 'sg2',
            140: 'tw2',
            150: 'th2',
            160: 'vn2'
        }

        localStorage.setItem('searchRegion', regionValues[value])
        setSelectedRegion(regionValues[value]);
        setDropdownDefaultValue(value);
        //console.log(value)
    }

    const changeTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else if (theme === 'dark') {
            setTheme('light')
        }
    }

    // Remove summoner from favorites
    const handleRemoveFavorite = (summonerObj) => {
        let favoritesStr = localStorage.getItem('favorites')
        if (favoritesStr !== null) {
            let favsArr = JSON.parse(favoritesStr)
            favsArr = favsArr.filter(obj =>
                !(obj.selectedRegion === summonerObj.selectedRegion &&
                    obj.summonerName === summonerObj.summonerName &&
                    obj.riotId === summonerObj.riotId))
            favoritesStr = JSON.stringify(favsArr)
            localStorage.setItem('favorites', favoritesStr)
            setFavorites(favsArr)
        }
    }

    // On component render
    useEffect(() => {
        getRecentSearches();
        getFavorites();
        getPrevRegion();
    }, [])

    return (
        <AppBar style={{ backgroundColor: '#404040', color: 'white' }} position="static">
            <Toolbar>
                {/* Desktop Navbar */}
                <a href='/' className='hideMobile' style={{ textDecoration: 'none', color: 'white', flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                    <Typography className='navBarHeaderText' variant="h6" fontWeight={'bold'} marginRight='5px' component="div" sx={{ flexGrow: 1 }}>
                        RiftReport.gg
                    </Typography>
                    <img style={{ width: '40px' }} src='/images/sorakaLogo.webp'></img>
                </a>

                {/* Mobile Navbar */}
                <div className='hideDesktop'>
                    <MenuIcon onClick={toggleDrawer(true)} style={{ fontSize: '32px', marginLeft: '10px' }} className='hideDesktop'></MenuIcon>
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                        <List>
                            <ListItem>
                                <a href='/' onClick={() => toggleDrawer(false)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                    <img style={{ width: '40px', marginRight: '5px' }} src='/images/sorakaLogo.webp'></img>
                                    <Typography>RiftReport.gg</Typography>
                                </a>
                            </ListItem>
                            <ListItem>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className='navBarSearchBarMobile'>
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
                                        sx={{
                                            backgroundColor: '#519EDD',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            width: '80px',
                                            height: 'auto',
                                            border: 'none',
                                            filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                                        }}
                                        value={dropdownDefaultValue}
                                        onChange={(event) => handleRegionChange(event)}
                                    >
                                        <MenuItem value={10}>NA</MenuItem>
                                        <MenuItem value={20}>EUW</MenuItem>
                                        <MenuItem value={30}>BR</MenuItem>
                                        <MenuItem value={40}>EUNE</MenuItem>
                                        <MenuItem value={50}>LAN</MenuItem>
                                        <MenuItem value={60}>LAS</MenuItem>
                                        <MenuItem value={70}>OCE</MenuItem>
                                        <MenuItem value={80}>RU</MenuItem>
                                        <MenuItem value={90}>TR</MenuItem>
                                        <MenuItem value={100}>JP</MenuItem>
                                        <MenuItem value={110}>KR</MenuItem>
                                        <MenuItem value={120}>PH</MenuItem>
                                        <MenuItem value={130}>SG</MenuItem>
                                        <MenuItem value={140}>TW</MenuItem>
                                        <MenuItem value={150}>TH</MenuItem>
                                        <MenuItem value={160}>VN</MenuItem>
                                    </Select>
                                </div>
                            </ListItem>
                            <ListItem style={{ display: 'block' }}>
                                <Typography>Favorites</Typography>
                                {favorites !== null &&
                                    <List>
                                        {favorites.map((item, index) => (
                                            <ListItem style={{ alignItems: 'center' }} key={index}>
                                                <a onClick={() => toggleDrawer(false)} href={`/profile/${item.selectedRegion}/${item.summonerName}/${item.riotId}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginRight: '25px' }}>
                                                    <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '52px', marginRight: '10px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${item.icon}.png`}></img>
                                                    {item.summonerName} #{item.riotId}
                                                </a>
                                                <FavoriteIcon className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: '10px', marginLeft: 'auto', fontSize: '18px' }}></FavoriteIcon>
                                            </ListItem>
                                        ))}
                                    </List>
                                }
                            </ListItem>
                        </List>
                    </Drawer>
                </div>
                <span className='navBarSearchBar'>
                    <Select
                        sx={{
                            backgroundColor: '#4d4d4d',
                            color: '#d9d9d9',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderTopRightRadius: '0px',
                            borderBottomRightRadius: '0px',
                        }}
                        value={dropdownDefaultValue}
                        onChange={(event) => handleRegionChange(event)}
                    >
                        <MenuItem value={10}>NA</MenuItem>
                        <MenuItem value={20}>EUW</MenuItem>
                        <MenuItem value={30}>BR</MenuItem>
                        <MenuItem value={40}>EUNE</MenuItem>
                        <MenuItem value={50}>LAN</MenuItem>
                        <MenuItem value={60}>LAS</MenuItem>
                        <MenuItem value={70}>OCE</MenuItem>
                        <MenuItem value={80}>RU</MenuItem>
                        <MenuItem value={90}>TR</MenuItem>
                        <MenuItem value={100}>JP</MenuItem>
                        <MenuItem value={110}>KR</MenuItem>
                        <MenuItem value={120}>PH</MenuItem>
                        <MenuItem value={130}>SG</MenuItem>
                        <MenuItem value={140}>TW</MenuItem>
                        <MenuItem value={150}>TH</MenuItem>
                        <MenuItem value={160}>VN</MenuItem>
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

                <div style={{ marginLeft: 'auto' }}>
                    <FormGroup onClick={() => changeTheme()}>
                        <FormControlLabel control={<Switch />} label={theme === 'light' ? <DarkModeIcon style={{ marginTop: '3px' }}></DarkModeIcon> : <LightModeIcon style={{ marginTop: '3px' }}></LightModeIcon>} />
                    </FormGroup>
                </div>

            </Toolbar>
        </AppBar>
    );
}

export default Navbar