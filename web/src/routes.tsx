import { Route, BrowserRouter } from 'react-router-dom'
import React from 'react'

import Home from './pages/Home'
import CreatePoint from './pages/CreatePoint'

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreatePoint} path="/create-point" />
    </BrowserRouter>
  )
}

export default Routes
