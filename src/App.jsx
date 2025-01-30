import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './Pages/Home'
import Error from './Pages/Error'


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
