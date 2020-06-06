import React from 'react';
import { withGlobalState } from 'react-globally';
const axios = require('axios');

class EsperandoOponente extends React.Component {
  cancelar = async e => {
    e.preventDefault();
    try{
        const response = await axios.delete (`/lobbies/${this.props.globalState.lobbyId}`, { headers: { 'Authorization': `${this.props.globalState.token}` }})
        console.log(response.data);
        this.props.setGlobalState(prevGlobalState => ({ lobbyId: 0, pagina:"listaSalas"}))
    } catch(error){
        console.error(error);
    }
  }

  async tick() {
    try{
      const response = await axios.get (`/lobbies/${this.props.globalState.lobbyId}/isFull`, { headers: { 'Authorization': `${this.props.globalState.token}` }})
      if (response.data.status === 'ok' && JSON.parse(response.data.response.isFull) === true){
          console.log(`${response.data.response.player2Name} ingresó a tu sala`);
          this.props.setGlobalState(prevGlobalState => ({pagina:"juego", playerNum: 1, playerSymbol:'X', opponentSymbol:'O', opponentName:response.data.response.player2Name }))
      }
    } catch(error){
        console.error(error);
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
      return (
        <div>
            <br/><br/>
            <h2>Esperando oponente...</h2>
            <br/><br/>
            <button type="button" onClick={this.cancelar} style={{fontSize:"100%"}}> CANCELAR </button>
            <br/><br/>
        </div>
      );
  }
}
export default withGlobalState (EsperandoOponente);