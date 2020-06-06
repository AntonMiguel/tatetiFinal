import React from 'react';
import { withGlobalState } from 'react-globally';

class Score extends React.Component{
    render(){
      return(
      <div>
        <h2>Puntaje</h2>
        <h3>{this.props.globalState.playerName}: {this.props.victorias}</h3>
        <h3>{this.props.globalState.opponentName}: {this.props.derrotas}</h3>
        <h3>Empates: {this.props.empates}</h3>
      </div>
      )
    }
}

export default withGlobalState (Score);