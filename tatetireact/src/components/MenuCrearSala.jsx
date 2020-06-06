import React from 'react';
import { withGlobalState } from 'react-globally';
const axios = require('axios');

class MenuCrearSala extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      salaName: '',
      salaPass: '',
    };
  }


  crearSala = async e => {
    e.preventDefault();
    try{
        const salaName = this.state.salaName;
        const pass = this.state.salaPass;
        const response = await axios.post('/lobbies', { lobbyName: salaName, playerId: this.props.globalState.playerId, lobbyPass: pass}, { headers: { 'Authorization': `${this.props.globalState.token}` }})
        console.log(response.data.response.lobbyId);
        this.props.setGlobalState(prevGlobalState => ({ lobbyId: response.data.response.lobbyId, pagina:"esperandoOponente"}))
    } catch(error){
        console.error(error);
    }
  }


  volver = () => {
      this.props.setGlobalState(prevGlobalState => ({ pagina:"listaSalas"}))
  }


  render() {
      return (
        <div>
          <br/><br/>
          <button type="button" onClick={this.volver} style={{fontSize:"100%"}}>Volver a la lista de salas</button>
          <br/><br/>
          <form onSubmit={this.crearSala}>
            <p>
            <strong>Nombre de la sala: </strong>
            <input type="text" value={this.state.salaName} onChange={e => this.setState({ salaName: e.target.value })}/>
            <p>Debe tener entre 4 y 25 carácteres</p>
            <br/><br/>
            <strong>Contraseña (opcional): </strong>
            <input type="text" value={this.state.salaPass} onChange={e => this.setState({ salaPass: e.target.value })}/>
            <p>Debe tener entre 4 y 25 carácteres (letras o números)</p>
            <br/>
            <button type="submit" style={{fontSize:"125%"}}>Crear sala</button>
            </p>
          </form>
          <br/><br/>
        </div>
      );
  }
}

export default withGlobalState (MenuCrearSala);