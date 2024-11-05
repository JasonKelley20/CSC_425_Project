import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//import JobsList from './Components/JobsList';
import Shifts from './Components/Shifts';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Welcome to My React App</h1>
      <Shifts />
    </>
  )
}

export default App
