import React from 'react';
import { withGlobalState } from 'react-globally'

import Juego from './Juego.jsx';
import ListaSalas from './ListaSalas.jsx';
import NameInput from './NameInput.jsx';
import MenuCrearSala from './MenuCrearSala.jsx';
import EsperandoOponente from './EsperandoOponente.jsx';

const Switcher = ({ globalState }) => {
    switch (globalState.pagina){
        case "ingreso":
            return(
                <div>
                    <h1>Bienvenido a Tateti 0.2</h1>
                    <NameInput/>
                </div>
            )

        case "listaSalas":
            return(
                <div>
                    <ListaSalas/>
                </div>
            )

        case "juego":
            return(
                <div>
                    <Juego/>
                    <br/><br/>
                </div>
            )

        case "menuCrearSala":
            return(
                <div>
                    <MenuCrearSala/>
                    <br/><br/>
                </div>
            )
        case "esperandoOponente":
            return(
                <div>
                    <EsperandoOponente/>
                    <br/><br/>
                </div>
            )
            
        default:
            return(
                <div>
                    <h1>Error</h1>
                    <br/><br/>
                </div>
            )
    }
}

export default withGlobalState(Switcher)