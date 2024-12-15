import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home'
import About from './pages/About'
import Layout from './pages/Layout'
import Error from './pages/Error'
function App() {

  return (
    <>
       <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="error" element={<Error />} />
          <Route path="matches" element={<Error />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
