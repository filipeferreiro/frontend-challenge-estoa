import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Container from 'react-bootstrap/esm/Container';
import Spinner from 'react-bootstrap/Spinner';
import Header from './components/Header';
import People from './components/People';
import Home from './components/Home';
import Films from './components/Films';
import axios from 'axios';
import './App.css';
import './Home.css';

function App() {

  /* CREATING CONSTS TO RETURN API DATA */
  const [people, setPeople] = useState([]);
  const [films, setFilms] = useState([]);
  const [load, setLoad] = useState(true);
  let [page, setPage] = useState(1);

  /* HANDLES THE CLICK ON PAGE CHANGE */
  const handlePageClick = async (data) => {
    let currentPage =data.selected + 1;
    console.log(currentPage);
    setPage(currentPage);
  }

  useEffect(() => {
    /* FETCH CHARACTERS FROM API INTO CONSTS */
    const loadAllPeople = async () =>{
      setLoad(true);
      let url = `https://swapi.dev/api/people/?page=${page}`;
        await axios.get(url)
          .then((response)=>{
            var peopleCopy = response.data.results;
            let promises = [];
            for(let person of peopleCopy){
              promises.push(
                //GETS HOMEWORLD NAME
                axios.get(person.homeworld)
                  .then((response)=>{
                    person.homeworld = response.data.name;
                  }),
                person.films.map((i,index)=>{
                  axios.get(i)
                    .then((response)=>{
                      //GETS FILMS BY NAME
                      person.films[index] = response.data.title;
                      setLoad(false);
                    })
                }),
                //GETS SPECIES NAME
                person.species.length > 0 ?
                  axios.get(person.species[0])
                    .then((response)=>{
                      person.species = response.data.name;
                    })
                : person.species = 'Human'
              )
            }
            //WAITS THE REQUEST LOADING
            Promise.all(promises).then(() => {
              setPeople(peopleCopy); 
              setLoad(false);
            });
          })
          .catch((error)=>{
            //CATCHES ERRORS
            alert('error loading data')
          })
    }

    /* FETCH FILMS FROM API INTO CONSTS */
    async function fetchFilms() {
      /* MUCH SIMPLER REQUISITION FOR ONE PAGE OF CONTENT */ 
      let res = await fetch('https://swapi.dev/api/films/?format=json');
      let data = await res.json();
      setFilms(data.results);
      setLoad(false);
    }
    
    /* CALLS THE ASYNC FUNCTIONS */
    fetchFilms();
    loadAllPeople();
  }, [page]);

  useEffect(() => { document.body.style.backgroundColor = '#000' }, []);

  return (
    <>
      <Router>
        <Header />
        <Container className='site-wrapper'>
          {/* WAITS UNTIL API RETURN IS COMPLETELY LOADED */}
          {load ? (
            <Container>
              <div className='loading'>
                <Spinner animation="border" role="status" className='spinner'>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
              <div class="bg-animation">
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
                <div id="stars4"></div>
              </div>
            </Container>
          ) : (
            <Routes>
              <Route exact path='/' element={<Home/>}></Route>
              <Route exact path='/people/' element={<People data={people} pagina={page} page={handlePageClick}/>}></Route>
              <Route exact path='/films' element={<Films data={films}/>}></Route>
            </Routes>
          )}
        </Container>
      </Router>
    </>
  );
}
export default App;