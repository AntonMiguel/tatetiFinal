import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-globally'

const initialGlobalState = {
playerId: 0,
token: "",
pagina: "ingreso",
lobbyId: 0,
playerNum: 1,     //host de la sala es 1, el invitado se pone en 2 al ingresar
hasTurn: false,   //variable usada en frontend para no lanzar peticiones GET ESTADO DEL TABLERO mientras sea tu turno
playerName: "",
playerSymbol: "",
opponentName: "",
opponentSymbol: ""
}

ReactDOM.render( <React.StrictMode>
  <Provider globalState={initialGlobalState}>
    <App />
  </Provider>
</React.StrictMode>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();