import React from 'react';

class Revancha extends React.Component {
    render() {
        let revancha;
        if (this.props.esperandoRespuesta === true){
            revancha = <div><br/><br/></div>
        } else{
            revancha=<div><br/><button type="button" onClick={this.props.onClick} style={{fontSize:"100%"}}>Pedir revancha</button></div>
        }
        return (revancha);
    }
}

export default Revancha;