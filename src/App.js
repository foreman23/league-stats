import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SummonerSearch from './pages/SummonerSearch';
import SummonerProfile from './pages/SummonerProfile';
import PageNotFound from './pages/PageNotFound';
import SummonerNotFound from './pages/SummonerNotFound';
import GameDetails from './pages/GameDetails';
import ArenaDetails from './pages/ArenaDetails';
import Loading from './pages/Loading';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SummonerSearch></SummonerSearch>}></Route>
        <Route path='/profile/:selectedRegion/:summonerName/:riotId' element={<SummonerProfile></SummonerProfile>}></Route>
        <Route path='/match/:matchId/:summonerName/:riotId' element={<GameDetails></GameDetails>}></Route>
        <Route path='/arena/:matchId/:summonerName/:riotId' element={<ArenaDetails></ArenaDetails>}></Route>
        <Route path='/nosummoner' element={<SummonerNotFound></SummonerNotFound>}></Route>
        <Route path='/loading' element={<Loading></Loading>}></Route>
        <Route path='/*' element={<PageNotFound></PageNotFound>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
