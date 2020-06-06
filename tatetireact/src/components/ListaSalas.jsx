import React from 'react';
import { withGlobalState } from 'react-globally'
import SalaRow from './SalaRow.jsx';
const axios = require('axios');

class ListaSalas extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          lobbies:'sinSalas',
        };
      }

    render(){
        let encabezados;
        if (this.state.lobbies==='sinSalas') {
            encabezados=<h1>No hay salas abiertas</h1>;
        } else{
            encabezados= 
                <div><h1>Salas abiertas</h1>
                <table className="listaSalas" align="center" width="52%">
                <th th width="38%">Sala</th>
                <th th width="28%">Host</th>
                <th th width="6%"> </th>
                <th th width="28%">Contraseña</th>
                {this.state.lobbies}
                </table>
                </div>;
        }
        return(
        <div>
            {encabezados}
            <br/>
            <input type="button" onClick={this.refrescar} value="Actualizar lista de salas"></input>
            <input type="button" onClick={this.menuCrearSala} value="Crear una sala"></input>
            <br/><br/>
        </div>
        ); 
    }

    componentDidMount(){
        this.refrescar();
    }

    refrescar = async e => {
        try{
            const response = await axios.get('/lobbies')
            var salasDisponibles = [];
            if(response.data.status==='ok'){
                response.data.response.lobbies.forEach(element => {
                    const unaSala = <SalaRow id={element.lobbyId} name={element.lobbyName} host={element.hostName} contrasenia={JSON.parse(element.lobbyBoolPass)}/>
                    salasDisponibles.push(unaSala);
                });
                this.setState({ lobbies: salasDisponibles });
            } else{
                if(response.data.status==='noLobbies'){
                    this.setState({ lobbies:'sinSalas'});
                } 
            }
        } catch(error){
            console.error(error);
        }
    }

    menuCrearSala = e => {
        e.preventDefault();
        try{
            this.props.setGlobalState(prevGlobalState => ({ pagina:"menuCrearSala" }))
        } catch(error){
        console.error(error);
        }
    }
}

export default withGlobalState (ListaSalas);