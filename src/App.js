import React from 'react'
import './App.css'
import { useBeforeunload } from 'react-beforeunload'

// props: matriz, onClick, onMouseMove
const Lienzo = props => {
  // const matriz = [ [{id: 0}, {id: 1}], [{id: 2}, {id: 3}]]
  return (
    <div className='Impresion' draggable="false">
      <div className='Lienzo' draggable="false">
        {
          props.matriz.map((fila, i) => (
            <ul key={i} draggable="false">
              {
                fila.map((columna, j) => (
                  <li
                    key={j}
                    className="cuadros2"
                    draggable="false"
                    style={{ background: columna.color ? columna.color : '#fff' }}
                    onClick={() => props.pintar(i, j)}
                    onMouseMove={e => props.pintarAlMoverse(e, i, j)}
                  />
                ))
              }
            </ul>
          ))
        }
      </div>
    </div>
  )
}

// props: loading, colores, onClick
const PaletaColores = props => {
  // const colores = [{value: '#000'},{value: '#fff'}]
  if (props.loading) {
    return 'Cargando...'
  }
  return (
    <div className="PaletaColores">
      <button
        className="cuadros"
        style={{ backgroundColor: '#fff' }}
        key='borrador'
        onClick={() => props.seleccionarColor('#fff')}
      />
      {
        props.colores.map((item) => (
          <button
            className="cuadros"
            style={{ backgroundColor: item.value }}
            key={item.value}
            onClick={() => props.seleccionarColor(item.value)}
          />
        ))
      }
    </div>
  )
}

const useForceUpdate = () => {
  const [value, setValue] = React.useState(0)
  return () => setValue(value => ++value)
}

const App = ({ savedChanges }) => {
  // estado para lienzo
  const [matriz, setMatriz] = React.useState([])
  const [colorActivo, setColorActivo] = React.useState('')

  // estado para paleta
  const [loading, setLoading] = React.useState(true)
  const [colores, setColores] = React.useState([])

  // forza el render de App
  const forceUpdate = useForceUpdate();

  const construirMatriz = () => {
    let matriz = []
    for (let i = 0; i < 10; i++) {
      let columnas = []
      for (let j = 0; j < 10; j++) {
        columnas.push({color:""})
      }
      matriz.push(columnas)
    }
    setMatriz(matriz)
    forceUpdate()
  }

  const pedirColores = () => {
    setLoading(true)
    fetch('http://api.noopschallenge.com/hexbot?count=10')
      .then((res)=> res.json())
      .then((data)=> {
        setColores(data.colors)
        setLoading(false)
      }
    )
  }

  // se ejecuta al principio de la aplicacion
  React.useEffect(() => {
    const matrizLocal = localStorage.getItem('matriz')
    if (matrizLocal) {
      // JSON.parse convierte un string a un arreglo o json
      setMatriz(JSON.parse(matrizLocal))
    } else {
      construirMatriz()
    }

    const coloresLocales = localStorage.getItem('colores')
    if (coloresLocales) {
      // JSON.parse convierte un string a un arreglo o json
      setColores(JSON.parse(coloresLocales))
      setLoading(false)
    } else {
      pedirColores()
    }
  }, [])

  // guarda estado en localStorage
  useBeforeunload(() => {
    localStorage.setItem('matriz', JSON.stringify(matriz))
    localStorage.setItem('colores', JSON.stringify(colores))
  })

  // funciones para lienzo
  const pintar = (i, j) => {
    matriz[i][j] = {color:colorActivo}
    setMatriz(matriz)
    forceUpdate()
  }
  const pintarAlMoverse = (e, i, j) => {
    // 'e' es la variable que regresa el evento onMouseMove
    // si e.buttons === 1 significa que es click sostenido
    if (e.buttons === 1) {
      pintar(i, j)
    }
  }
  // funciones para paleta
  const seleccionarColor = color => {
    setColorActivo(color)
  }

  return (
    <div className="App">
      <div className="App-header">
        <Lienzo
          matriz={matriz}
          pintar={pintar}
          pintarAlMoverse={pintarAlMoverse}
        />
        <center>
          <button type="button" className="btn" onClick={construirMatriz}>Resetear</button>
          <button type="button" className="btn" onClick={pedirColores}>Nuevos colores</button>
          <br/>
          <PaletaColores
            loading={loading}
            colores={colores}
            seleccionarColor={seleccionarColor}
          />
        </center>
      </div>
    </div>
  );
}

export default App;
