import React from 'react';
import { withGlobalState } from 'react-globally';
const axios = require('axios');

class SalaRow extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          inputPass: '',
        };
    }

    unirse = async id => {
        try{
            const pass = this.state.inputPass;
            const response = await axios.put(`/lobbies/${id}`, {lobbyPass: pass, playerId:this.props.globalState.playerId}, { headers: { 'Authorization': `${this.props.globalState.token}`}})
            console.log(response.data.status);
            if(response.data.status==='ok'){
                this.props.setGlobalState(prevGlobalState => ({ pagina:"juego", lobbyId:id, playerNum: 2, playerSymbol:'O', opponentSymbol:'X', opponentName:this.props.host}))
            } else {console.log("Error")}
        } catch(error){
            console.error(error);
        }
    }

    render(){
        var iconPass;
        var inputPass;
        if (this.props.contrasenia === true){
            iconPass = <img src={"./candadito.png"} alt=""/>;
            inputPass = <input type="text" value={this.state.inputPass} onChange={e => this.setState({ inputPass: e.target.value })}/>
        } else{
            iconPass = null;
        }
        return(
        <tr>
        <td>{this.props.name}</td>
        <td>{this.props.host}</td>
        <td><left><button type="button" onClick={e => this.unirse(this.props.id)} style={{fontSize:"100%"}}>Unirse</button></left></td>
        <td><left>{iconPass} {inputPass}</left></td>
        </tr>
    )};
}

export default withGlobalState (SalaRow);