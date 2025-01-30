import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Error from './Pages/Error'
import Home from './Pages/Home'


function App() {
  const router = createBrowserRouter([   
    {
      path: '/',
      element: <Home />,
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
