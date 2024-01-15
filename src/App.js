import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SummonerSearch from './pages/SummonerSearch';
import SummonerProfile from './pages/SummonerProfile';
import PageNotFound from './pages/PageNotFound';
import SummonerNotFound from './pages/SummonerNotFound';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SummonerSearch></SummonerSearch>}></Route>
        <Route path='/:selectedRegion/:summonerName/:riotId' element={<SummonerProfile></SummonerProfile>}></Route>
        <Route path='/nosummoner' element={<SummonerNotFound></SummonerNotFound>}></Route>
        <Route path='/*' element={<PageNotFound></PageNotFound>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
