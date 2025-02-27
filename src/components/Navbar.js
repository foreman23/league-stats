import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Toolbar, AppBar, TextField, IconButton, Select, MenuItem, Autocomplete, ListItem, List, Menu } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import LightModeIcon from '@mui/icons-material/LightMode';
// import DarkModeIcon from '@mui/icons-material/DarkMode';
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

    // const [theme, setTheme] = useState('light');

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClickFavorites = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseFavorites = () => {
        setAnchorEl(null);
    };

    const [anchorSearch, setAnchorSearch] = useState(null);
    const openSearch = Boolean(anchorSearch);
    const handleClickSearch = (event) => {
        setAnchorSearch(event.currentTarget);
    };
    const handleCloseSearch = () => {
        setAnchorSearch(null);
    };

    // const [openDrawer, setOpenDrawer] = useState(false);
    // Toggle menu drawer for mobile
    // const toggleDrawer = (newOpen) => () => {
    //     setOpenDrawer(newOpen);
    // };

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

            let arr = []
            for (let i = 0; i < recentSearchArr.length; i++) {
                let temp = {
                    summonerName: recentSearchArr[i].summonerName,
                    selectedRegion: recentSearchArr[i].selectedRegion,
                    riotId: recentSearchArr[i].riotId
                }
                arr.push(temp)
            }
            setRecentArr(arr)
        }
    }

    const handleSearchSubmit = async () => {

        // setOpenDrawer(false);
        setAnchorSearch(null)

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

    const [dropdownDefaultValue, setDropdownDefaultValue] = useState('');
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
    }

    // const changeTheme = () => {
    //     if (theme === 'light') {
    //         setTheme('dark')
    //     } else if (theme === 'dark') {
    //         setTheme('light')
    //     }
    // }

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

    // Handle clicking of autocomplete element
    const handleAutoCompleteSelect = (newValue) => {
        if (newValue && typeof newValue === 'object') {
            const newPath = `/profile/${newValue.selectedRegion}/${newValue.summonerName}/${newValue.riotId}`

            setAnchorSearch(null)
            // setOpenDrawer(false);

            navigate(newPath)

        }
    };

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
                    <img alt='Logo' style={{ width: '40px' }} src='/images/sorakaLogo.webp'></img>
                </a>

                {/* Mobile Navbar */}
                <div style={{ display: 'flex', alignItems: 'center' }} className='hideDesktop'>
                    <a href='/' style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <img alt='Logo' style={{ width: '40px', marginRight: '10px' }} src='/images/sorakaLogo.webp'></img>
                        <Typography style={{ fontWeight: 'bold', marginTop: '3px', marginRight: '8px' }}>RR.GG</Typography>
                        {/* <HomeIcon style={{ fontSize: '32px', color: 'white' }} className='hideDesktop'></HomeIcon> */}
                    </a>
                    {/* <MenuIcon onClick={toggleDrawer(true)} style={{ fontSize: '32px', marginLeft: '10px' }} className='hideDesktop'></MenuIcon>
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                        <List>
                            <ListItem>
                                <a href='/' onClick={() => toggleDrawer(false)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                    <img alt='Logo' style={{ width: '40px', marginRight: '5px' }} src='/images/sorakaLogo.webp'></img>
                                    <Typography>RiftReport.gg</Typography>
                                </a>
                            </ListItem>
                            <ListItem style={{ display: 'block' }}>
                                <Typography>Favorites</Typography>
                                {favorites !== null &&
                                    <List>
                                        {favorites.map((item, index) => (
                                            <ListItem style={{ alignItems: 'center' }} key={index}>
                                                <a onClick={() => toggleDrawer(false)} href={`/profile/${item.selectedRegion}/${item.summonerName}/${item.riotId}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginRight: '25px' }}>
                                                    <img alt='Summoner Icon' style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '52px', marginRight: '10px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${item.icon}.png`}></img>
                                                    <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summonerName} #{item.riotId}</span>
                                                </a>
                                                <FavoriteIcon aria-label='Remove a favorite' className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: '10px', marginLeft: 'auto', fontSize: '18px' }}></FavoriteIcon>
                                            </ListItem>
                                        ))}
                                    </List>
                                }
                            </ListItem>
                        </List>
                    </Drawer> */}
                    <div style={{ position: 'absolute', right: '25px', left: 'auto', top: '5px', alignItems: 'center' }}>
                        <IconButton
                            style={{ marginRight: '15px' }}
                            aria-label='Open favorites menu'
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClickFavorites}
                        >
                            <FavoriteIcon style={{ color: 'white', fontSize: '1.75rem' }}></FavoriteIcon>
                        </IconButton>
                        <IconButton
                            aria-label='Open search bar'
                            aria-controls={openSearch ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openSearch ? 'true' : undefined}
                            onClick={handleClickSearch}>
                            <SearchIcon style={{ fontSize: '2rem', color: 'white' }} className='hideDesktop'></SearchIcon>
                        </IconButton>
                    </div>

                    <Menu
                        style={{ maxHeight: '70vh', padding: '0px' }}
                        id="search-menu"
                        anchorEl={anchorSearch}
                        open={openSearch}
                        onClose={handleCloseSearch}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <div style={{ display: 'flex', minWidth: '90vw', height: 'auto' }}>
                            <Select
                                sx={{
                                    backgroundColor: '#519EDD',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    height: 'auto',
                                    border: 'none',
                                    borderTopRightRadius: '0%',
                                    borderBottomRightRadius: '0%',
                                    borderRadius: '0%',
                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                                }}
                                value={dropdownDefaultValue}
                                onChange={(event) => handleRegionChange(event)}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: '50vh'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value={10} aria-label="North America">NA</MenuItem>
                                <MenuItem value={20} aria-label="Europe West">EUW</MenuItem>
                                <MenuItem value={30} aria-label="Brazil">BR</MenuItem>
                                <MenuItem value={40} aria-label="Europe Nordic & East">EUNE</MenuItem>
                                <MenuItem value={50} aria-label="Latin America North">LAN</MenuItem>
                                <MenuItem value={60} aria-label="Latin America South">LAS</MenuItem>
                                <MenuItem value={70} aria-label="Oceania">OCE</MenuItem>
                                <MenuItem value={80} aria-label="Russia">RU</MenuItem>
                                <MenuItem value={90} aria-label="Turkey">TR</MenuItem>
                                <MenuItem value={100} aria-label="Japan">JP</MenuItem>
                                <MenuItem value={110} aria-label="Korea">KR</MenuItem>
                                <MenuItem value={120} aria-label="Philippines">PH</MenuItem>
                                <MenuItem value={130} aria-label="Singapore">SG</MenuItem>
                                <MenuItem value={140} aria-label="Taiwan">TW</MenuItem>
                                <MenuItem value={150} aria-label="Thailand">TH</MenuItem>
                                <MenuItem value={160} aria-label="Vietnam">VN</MenuItem>
                            </Select>
                            <Autocomplete
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 0, // Ensures no border rounding
                                    },
                                }}
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
                                        handleAutoCompleteSelect(newValue)
                                    }
                                }}
                                fullWidth
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        style={{ backgroundColor: 'white' }}
                                        {...params}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                handleSearchSubmit();
                                            }
                                        }}
                                        placeholder="Search by Riot ID (e.g., Teemo#NA1)"
                                    />
                                )}
                            />
                            <IconButton
                                aria-label="Search"
                                onClick={handleSearchSubmit}
                                color="inherit"
                            >
                                <SearchIcon />
                            </IconButton>
                        </div>
                    </Menu>
                </div>

                <span className='navBarSearchBar'>
                    <Select
                        sx={{
                            backgroundColor: '#4d4d4d',
                            color: '#d9d9d9',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            width: '100px',
                            borderTopRightRadius: '0px',
                            borderBottomRightRadius: '0px',
                        }}
                        value={dropdownDefaultValue}
                        onChange={(event) => handleRegionChange(event)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: '50vh'
                                }
                            }
                        }}
                    >
                        <MenuItem value={10} aria-label="North America">NA</MenuItem>
                        <MenuItem value={20} aria-label="Europe West">EUW</MenuItem>
                        <MenuItem value={30} aria-label="Brazil">BR</MenuItem>
                        <MenuItem value={40} aria-label="Europe Nordic & East">EUNE</MenuItem>
                        <MenuItem value={50} aria-label="Latin America North">LAN</MenuItem>
                        <MenuItem value={60} aria-label="Latin America South">LAS</MenuItem>
                        <MenuItem value={70} aria-label="Oceania">OCE</MenuItem>
                        <MenuItem value={80} aria-label="Russia">RU</MenuItem>
                        <MenuItem value={90} aria-label="Turkey">TR</MenuItem>
                        <MenuItem value={100} aria-label="Japan">JP</MenuItem>
                        <MenuItem value={110} aria-label="Korea">KR</MenuItem>
                        <MenuItem value={120} aria-label="Philippines">PH</MenuItem>
                        <MenuItem value={130} aria-label="Singapore">SG</MenuItem>
                        <MenuItem value={140} aria-label="Taiwan">TW</MenuItem>
                        <MenuItem value={150} aria-label="Thailand">TH</MenuItem>
                        <MenuItem value={160} aria-label="Vietnam">VN</MenuItem>
                    </Select>

                    <Autocomplete
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 0, // Ensures no border rounding,
                                height: '54px'
                            },
                        }}
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
                                handleAutoCompleteSelect(newValue)
                            }
                        }}
                        fullWidth
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                sx={{ input: { color: '#e5e5e6' } }}
                                style={{ backgroundColor: '#303030', borderRadius: '5px' }}
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
                    <IconButton aria-label='Search' style={{ marginTop: '2px' }} onClick={handleSearchSubmit} color="inherit">
                        <SearchIcon></SearchIcon>
                    </IconButton>
                    <IconButton
                        aria-label='Open favorites menu'
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClickFavorites}
                    >
                        <FavoriteIcon style={{ color: 'white' }}></FavoriteIcon>
                    </IconButton>
                    <Menu
                        style={{ maxHeight: '70vh' }}
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleCloseFavorites}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <Typography style={{ marginLeft: '20px', fontWeight: 'bold', minWidth: '100px' }}>Favorites</Typography>
                        {favorites !== null &&
                            <List>
                                {favorites.map((item, index) => (
                                    <ListItem style={{ alignItems: 'center' }} key={index}>
                                        <a href={`/profile/${item.selectedRegion}/${item.summonerName}/${item.riotId}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginRight: '25px' }}>
                                            <img alt='Summoner Icon' style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '52px', marginRight: '10px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${item.icon}.png`}></img>
                                            <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summonerName} #{item.riotId}</span>
                                        </a>
                                        <FavoriteIcon aria-label='Remove a favorite' className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: '10px', marginLeft: 'auto', fontSize: '1.125rem' }}></FavoriteIcon>
                                    </ListItem>
                                ))}
                            </List>
                        }
                    </Menu>
                </span>

                {/* Theme selector */}
                {/* <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <FormGroup>
                        <FormControlLabel control={<Switch onClick={() => changeTheme()} />} label={theme === 'light' ? <DarkModeIcon style={{ marginTop: '3px' }}></DarkModeIcon> : <LightModeIcon style={{ marginTop: '3px' }}></LightModeIcon>} />
                    </FormGroup>
                </div> */}

            </Toolbar>
        </AppBar>
    );
}

export default Navbar