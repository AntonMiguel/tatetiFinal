import React from 'react';
import { withGlobalState } from 'react-globally'
import Score from './Score.jsx';
import Revancha from './Revancha.jsx';
import Board from './Board.jsx';
const axios = require('axios');

class Juego extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        celdas: "         ",
        titulo: `Iniciando...`,
        victorias: 0,
        derrotas: 0,
        empates: 0,
        partidaEnCurso: true,
        esperandoRespuesta:true,
      };
    }
  
    celdaClick = async num => {
      if (this.state.partidaEnCurso===true){    //chequeo en frontend sólo para mejorar rendimiento... pero los chequeos verdaderos están en el backend
        try{
            const response = await axios.put(`/lobbies/${this.props.globalState.lobbyId}/move`, {cell: num}, { headers: { 'Authorization': `${this.props.globalState.token}`}})
            if(response.data.status==='ok'){
              this.setState({celdas: response.data.response.board});
              switch (response.data.response.gameResult) {
                case 'stillPlaying': this.setState({titulo:`Turno de ${this.props.globalState.opponentName} (${this.props.globalState.opponentSymbol})`});
                  break;
                case 'victory': 
                  if (this.props.globalState.playerNum===1){
                    this.setState({titulo:`Has ganado`, victorias: response.data.response.player1Victories, partidaEnCurso: false, esperandoRespuesta:false});
                  }else{
                    this.setState({titulo:`Has ganado`, victorias: response.data.response.player2Victories, partidaEnCurso: false, esperandoRespuesta:false});
                  }
                  break;
                case 'draw': this.setState({titulo:`Empate`, empates:response.data.response.draws, partidaEnCurso: false, esperandoRespuesta:false});
                  break;
                default: console.log("Error");
                  break;
              }
                console.log(`${response.data.response.board[num]} en la celda ${num}`);
                this.props.setGlobalState(prevGlobalState => ({ hasTurn:false, }));
            } else {
              switch (response.data.response.error){
                case 'notYourTurn': console.log("No es tu turno");
                  break;
                case 'occupiedCell': console.log("Celda ocupada");
                  break;
                default: console.log("Error")
                  break;
              }
            }
        } catch(error){
            console.error(error);
        }
      }
    }



    async tick() {
      if (this.state.esperandoRespuesta===true){
          if (this.props.globalState.hasTurn===false){
            try{
              const response = await axios.get (`/lobbies/${this.props.globalState.lobbyId}`, { headers: { 'Authorization': `${this.props.globalState.token}` }})
              if (response.data.status === 'ok'){
                switch (response.data.response.gameResult){

                  case 'waitingOpponentMove': this.setState({celdas:response.data.response.board, titulo:`Turno de ${this.props.globalState.opponentName} (${this.props.globalState.opponentSymbol})`});
                    this.props.setGlobalState(prevGlobalState => ({hasTurn:false}));////¿¿
                    break;

                  case 'waitingOpponentRematch': this.setState({celdas:response.data.response.board});
                    this.props.setGlobalState(prevGlobalState => ({hasTurn:false}));////¿¿
                    break;

                  case 'yourTurnToPlay': console.log("Es tu turno");
                    this.setState({celdas:response.data.response.board, titulo:`Es tu turno (${this.props.globalState.playerSymbol})`, partidaEnCurso:true});
                    this.props.setGlobalState(prevGlobalState => ({hasTurn:true}));
                    break;

                  case 'defeat': 
                    if (this.props.globalState.playerNum===1){
                      this.setState({celdas:response.data.response.board, titulo:`Has perdido`, derrotas:response.data.response.player2Victories, partidaEnCurso: false, esperandoRespuesta:false});
                    }else{
                      this.setState({celdas:response.data.response.board, titulo:`Has perdido`, derrotas:response.data.response.player1Victories, partidaEnCurso: false, esperandoRespuesta:false});
                    }
                    break;

                  case 'draw': this.setState({celdas:response.data.response.board, titulo:`Empate`, empates:response.data.response.draws, partidaEnCurso: false, esperandoRespuesta:false});
                    break;
                    default: console.log("Error");
                }
              }
            } catch(error){
                console.error(error);
            }
          }
      }
    }
  
    componentDidMount() {
      this.interval = setInterval(() => this.tick(), 1000);
    }
  
    componentWillUnmount() {
      clearInterval(this.interval);
    }

    revancha = async ()=> {
      try{
          const response = await axios.put(`/lobbies/${this.props.globalState.lobbyId}/rematch`, {}, { headers: { 'Authorization': `${this.props.globalState.token}`}})
          if(response.data.status==='ok'){
            this.setState({esperandoRespuesta:true, hasTurn:false});
          }
      } catch(error){
          console.error(error);
      }
  }

    render() {
        return(
            <div className="Juego">
            <h1>{this.state.titulo}</h1>
            <Board celdas={this.state.celdas} onClick= {(num) => this.celdaClick(num)}/>
            <Revancha esperandoRespuesta={this.state.esperandoRespuesta} onClick= {() => this.revancha()}/>
            <Score victorias={this.state.victorias} derrotas= {this.state.derrotas} empates={this.state.empates}/>
          </div>
        );
    }
}
export default withGlobalState (Juego);