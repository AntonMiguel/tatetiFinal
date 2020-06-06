import React from 'react';
import { withGlobalState } from 'react-globally';
const axios = require('axios');

class NameInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerName: '',
      error: 'Debe tener entre 4 y 25 carácteres (letras, números ó _)'
    };
  }

  handleSubmit = async e => {
    e.preventDefault();
    try{
      const nombre = this.state.playerName;
      const response = await axios.post('/players', { playerName: nombre })
      console.log('status'+response.data.status);
      console.log('response'+JSON.stringify(response.data.response));
      if (response.data.status==='ok'){
        this.props.setGlobalState(prevGlobalState => ({playerId:response.data.response.playerId, token: response.data.response.token, pagina:"listaSalas" , playerName:nombre}))
      }
    } catch(error){
      console.error(error);
    }
  }

  render() {
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <p><strong>Nombre: </strong>
            <input type="text" value={this.state.playerName} onChange={e => this.setState({ playerName: e.target.value })}/>
            <button type="submit">Ingresar</button>
            </p>
          </form>
          <p> {this.state.error}</p>
          <br/><br/>
        </div>
      );
  }
}

export default withGlobalState (NameInput);