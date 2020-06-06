import React from 'react';

class Board extends React.Component{
    renderCelda(num) {
      return (<Celda valor={this.props.celdas[num]} onClick={() => this.props.onClick(num)}/>);
    }
    
    render(){
      return(
        <div>
        <table className="tableTateti">
          <tr>
            {this.renderCelda(0)}
            {this.renderCelda(1)}
            {this.renderCelda(2)}
          </tr>
          <tr>
            {this.renderCelda(3)}
            {this.renderCelda(4)}
            {this.renderCelda(5)}
          </tr>
          <tr>
            {this.renderCelda(6)}
            {this.renderCelda(7)}
            {this.renderCelda(8)}
          </tr>
        </table>
        </div>
      )
    }
  }
  
  class Celda extends React.Component{
    render(){
      return <td onClick={this.props.onClick}>{this.props.valor}</td>
    }
  }

  export default Board;