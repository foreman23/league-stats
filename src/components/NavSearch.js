import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, IconButton, Select, MenuItem, Autocomplete, ListItem, List, Menu, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { profileIconImg } from '../api/ddragon';
import { regionValues } from '../utils/regions';

// The navbar's search / region / favorites cluster, extracted so the sticky
// match context bar can render the exact same actions — a seamless handoff
// when the navbar scrolls away. `compact` renders the tighter variant used in
// the context bar.

const REGIONS = [
  [10, 'NA', 'North America'], [20, 'EUW', 'Europe West'], [30, 'BR', 'Brazil'],
  [40, 'EUNE', 'Europe Nordic & East'], [50, 'LAN', 'Latin America North'],
  [60, 'LAS', 'Latin America South'], [70, 'OCE', 'Oceania'], [80, 'RU', 'Russia'],
  [90, 'TR', 'Turkey'], [100, 'JP', 'Japan'], [110, 'KR', 'Korea'],
  [120, 'PH', 'Philippines'], [130, 'SG', 'Singapore'], [140, 'TW', 'Taiwan'],
  [150, 'TH', 'Thailand'], [160, 'VN', 'Vietnam'],
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '13.5px',
    background: '#F6F7FA',
    '& fieldset': { borderColor: '#E2E4E9' },
    '&:hover fieldset': { borderColor: '#C7CBD2' },
  },
};

export default function NavSearch({ dataDragonVersion, compact }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [summonerName, setSummonerName] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('na1');
  const [favorites, setFavorites] = useState(null);
  const [recentArr, setRecentArr] = useState(null);
  const [dropdownDefaultValue, setDropdownDefaultValue] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // favorites + recent searches + last region from localStorage
    const favoritesStr = localStorage.getItem('favorites');
    if (favoritesStr !== null) setFavorites(JSON.parse(favoritesStr));

    const recentSearchStr = localStorage.getItem('recentSearches');
    if (recentSearchStr !== null) {
      const arr = JSON.parse(recentSearchStr).reverse().map((r) => ({
        summonerName: r.summonerName, selectedRegion: r.selectedRegion, riotId: r.riotId,
      }));
      setRecentArr(arr);
    }

    const prevRegion = localStorage.getItem('searchRegion');
    if (prevRegion !== null) {
      setSelectedRegion(prevRegion);
      setDropdownDefaultValue(parseInt(Object.keys(regionValues).find((k) => regionValues[k] === prevRegion)) || 10);
    } else {
      setSelectedRegion('na1');
      setDropdownDefaultValue(10);
    }
  }, []);

  const handleRegionChange = (event) => {
    const value = event.target.value;
    localStorage.setItem('searchRegion', regionValues[value]);
    setSelectedRegion(regionValues[value]);
    setDropdownDefaultValue(value);
  };

  const handleSearchSubmit = () => {
    if (!summonerName) return;
    let name = null;
    let tag = null;
    if (summonerName[summonerName.length - 1] === '#') {
      name = summonerName.split('#')[0];
      tag = selectedRegion === 'oc1' ? 'oce' : selectedRegion;
    } else if (summonerName.includes('#')) {
      name = summonerName.split('#')[0];
      tag = summonerName.split('#')[1];
    } else {
      name = summonerName;
      tag = selectedRegion === 'oc1' ? 'oce' : selectedRegion;
    }
    if (name[name.length - 1] === ' ') name = name.slice(0, name.length - 1);

    const newPath = `/profile/${selectedRegion}/${name}/${tag}`;
    if (location.pathname.startsWith('/profile')) {
      navigate('/loading', { replace: true });
      setTimeout(() => navigate(newPath, { replace: true }), 0);
    } else {
      navigate(newPath);
    }
  };

  const handleAutoCompleteSelect = (newValue) => {
    if (newValue && typeof newValue === 'object') {
      navigate(`/profile/${newValue.selectedRegion}/${newValue.summonerName}/${newValue.riotId}`);
    }
  };

  const handleRemoveFavorite = (summonerObj) => {
    const favoritesStr = localStorage.getItem('favorites');
    if (favoritesStr === null) return;
    let favsArr = JSON.parse(favoritesStr).filter((obj) =>
      !(obj.selectedRegion === summonerObj.selectedRegion &&
        obj.summonerName === summonerObj.summonerName &&
        obj.riotId === summonerObj.riotId));
    localStorage.setItem('favorites', JSON.stringify(favsArr));
    setFavorites(favsArr);
  };

  return (
    <div className={'ns' + (compact ? ' ns-compact' : '')}>
      <Select
        className="ns-region"
        size="small"
        sx={{
          borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, color: '#3C4150',
          background: '#F6F7FA',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E4E9' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7CBD2' },
        }}
        value={dropdownDefaultValue}
        onChange={handleRegionChange}
        MenuProps={{ PaperProps: { style: { maxHeight: '50vh' } } }}
      >
        {REGIONS.map(([value, label, aria]) => (
          <MenuItem key={value} value={value} aria-label={aria}>{label}</MenuItem>
        ))}
      </Select>

      <Autocomplete
        className="ns-input"
        size="small"
        sx={inputSx}
        options={recentArr || []}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : `${option.summonerName} #${option.riotId}`
        }
        value={summonerName || ''}
        onInputChange={(event, newInputValue) => setSummonerName(newInputValue)}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setSummonerName(newValue);
          } else if (newValue && typeof newValue === 'object') {
            setSummonerName(newValue.summonerName + ' #' + newValue.riotId);
            handleAutoCompleteSelect(newValue);
          }
        }}
        fullWidth
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearchSubmit();
              }
            }}
            placeholder={compact ? 'Search Riot ID' : 'Search by Riot ID (e.g., Teemo#NA1)'}
          />
        )}
      />

      <IconButton className="ns-btn" aria-label="Search" onClick={handleSearchSubmit}>
        <SearchIcon style={{ fontSize: '20px' }} />
      </IconButton>
      <IconButton
        className="ns-btn"
        aria-label="Open favorites menu"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <FavoriteIcon style={{ fontSize: '19px' }} />
      </IconButton>

      <Menu
        style={{ maxHeight: '70vh' }}
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <Typography style={{ marginLeft: '20px', fontWeight: 'bold', minWidth: '100px' }}>Favorites</Typography>
        {favorites !== null &&
          <List>
            {favorites.map((item, index) => (
              <ListItem style={{ alignItems: 'center' }} key={index}>
                <a href={`/profile/${item.selectedRegion}/${item.summonerName}/${item.riotId}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', marginRight: '25px' }}>
                  <img alt='Summoner Icon' style={{ borderRadius: '100%', border: '2px solid #E2E4E9', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)', width: '44px', marginRight: '10px' }} src={profileIconImg(dataDragonVersion, item.icon)}></img>
                  <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summonerName} #{item.riotId}</span>
                </a>
                <FavoriteIcon aria-label='Remove a favorite' className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: '10px', marginLeft: 'auto', fontSize: '1.125rem', cursor: 'pointer' }}></FavoriteIcon>
              </ListItem>
            ))}
          </List>
        }
      </Menu>
    </div>
  );
}
