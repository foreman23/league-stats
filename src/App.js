import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SummonerSearch from './pages/SummonerSearch';
import SummonerProfile from './pages/SummonerProfile';
import PageNotFound from './pages/PageNotFound';
import SummonerNotFound from './pages/SummonerNotFound';
import GameDetails from './pages/GameDetails';
import ArenaDetails from './pages/ArenaDetails';
import AramDetails from './pages/AramDetails';
import GenericDetails from './pages/GenericDetails';
import Loading from './pages/Loading';
import Footer from './components/Footer';
import axios from 'axios';
import Test from './pages/Test';
import Navbar from './components/Navbar';

function App() {

  const [dataDragonVersion, setDataDragonVersion] = useState(null);


  // Set the current ddragon version
  const getDataDragonVersion = async () => {
    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .then(function (response) {
        // console.log(response.data[0])
        const currentVersion = response.data[0];
        setDataDragonVersion(currentVersion);
      })
      .catch(function (response) {
        console.log('Error: Error fetching datadragon version')
      })
  }

  useEffect(() => {
    getDataDragonVersion()
  }, [])

  return (
    <div className='App'>
      <Router>
        <Navbar dataDragonVersion={dataDragonVersion}></Navbar>
        <Routes>
          <Route path='/' element={<SummonerSearch></SummonerSearch>}></Route>
          <Route path='/profile/:selectedRegion/:summonerName/:riotId' element={<SummonerProfile></SummonerProfile>}></Route>
          <Route path='/match/:matchId/:summonerName/:riotId' element={<GameDetails></GameDetails>}></Route>
          <Route path='/arena/:matchId/:summonerName/:riotId' element={<ArenaDetails></ArenaDetails>}></Route>
          <Route path='/aram/:matchId/:summonerName/:riotId' element={<AramDetails></AramDetails>}></Route>
          <Route path='/altmatch/:matchId/:summonerName/:riotId' element={<GenericDetails></GenericDetails>}></Route>
          <Route path='/nosummoner' element={<SummonerNotFound></SummonerNotFound>}></Route>
          <Route path='/loading' element={<Loading></Loading>}></Route>
          <Route path='/*' element={<PageNotFound></PageNotFound>}></Route>
          <Route path='/Test/:matchId/:summonerName/:riotId' element={<Test></Test>}></Route>
        </Routes>
        <Footer></Footer>
      </Router>
    </div>
  );
}

export default App;
