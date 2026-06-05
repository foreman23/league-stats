import './App.css';
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

// Eager: rendered on every page or used as the Suspense fallback
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './pages/Loading';
import SummonerSearch from './pages/SummonerSearch';

// Lazy: split into their own chunks, fetched only when the route is visited.
// This keeps the heavy details pages (+ @mui/x-charts) out of the landing bundle.
const SummonerProfile = lazy(() => import('./pages/SummonerProfile'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const ArenaDetails = lazy(() => import('./pages/ArenaDetails'));
const AramDetails = lazy(() => import('./pages/AramDetails'));
const GenericDetails = lazy(() => import('./pages/GenericDetails'));
const SummonerNotFound = lazy(() => import('./pages/SummonerNotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Contact = lazy(() => import('./pages/Contact'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));

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
        <Suspense fallback={<Loading></Loading>}>
          <Routes>
            <Route path='/' element={<SummonerSearch></SummonerSearch>}></Route>
            <Route path='/profile/:selectedRegion/:summonerName/:riotId' element={<SummonerProfile></SummonerProfile>}></Route>
            <Route path='/match/:matchId/:summonerName/:riotId' element={<GameDetails></GameDetails>}></Route>
            <Route path='/arena/:matchId/:summonerName/:riotId' element={<ArenaDetails></ArenaDetails>}></Route>
            <Route path='/aram/:matchId/:summonerName/:riotId' element={<AramDetails></AramDetails>}></Route>
            <Route path='/altmatch/:matchId/:summonerName/:riotId' element={<GenericDetails></GenericDetails>}></Route>
            <Route path='/nosummoner/:summonerName/:riotId' element={<SummonerNotFound></SummonerNotFound>}></Route>
            <Route path='/loading' element={<Loading></Loading>}></Route>
            <Route path='/privacy' element={<PrivacyPolicy></PrivacyPolicy>}></Route>
            <Route path='/terms' element={<Terms></Terms>}></Route>
            <Route path='/cookies' element={<Cookies></Cookies>}></Route>
            <Route path='/about' element={<About></About>}></Route>
            <Route path='/contact' element={<Contact></Contact>}></Route>
            <Route path='/*' element={<PageNotFound></PageNotFound>}></Route>
          </Routes>
        </Suspense>
        <Footer></Footer>
      </Router>
    </div>
  );
}

export default App;
