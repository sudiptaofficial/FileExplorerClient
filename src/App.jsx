import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Error from './Pages/Error'
import Home from './Pages/Home'
import Login from './Pages/Login'


function App() {
  const router = createBrowserRouter([   
    {
      path: '/',
      element: <Home />,
      errorElement: <Error />
    },
    {
      path: '/Login',
      element: <Login />,
      errorElement: <Error />
    }
  ])

  return (
    <>
     <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
