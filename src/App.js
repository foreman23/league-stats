import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SummonerSearch from './pages/SummonerSearch';
import SummonerProfile from './pages/SummonerProfile';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SummonerSearch></SummonerSearch>}></Route>
        <Route path='/:selectedRegion/:summonerName/:dataDragonVersion' element={<SummonerProfile></SummonerProfile>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
