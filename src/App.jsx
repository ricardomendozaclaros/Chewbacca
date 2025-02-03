import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
// import Page1 from './pages/Page1';
// import Page2 from './pages/Page2';
// import Page3 from './pages/Page3';
// import Page4 from './pages/Page4';
// import Page5 from './pages/Page5';
import Layout from './pages/Layout';
import Error from './pages/Error';
import Filtros from './pages/Filters/Filters';

// oficial pages hardcode
import Transactions from './pages/H-Pages/Transactions'
import Users from './pages/H-Pages/Users'
import Process from './pages/H-Pages/Process'
//marketing
import Pag100 from './pages/H-Pages/Pag100'
import Pag101 from './pages/H-Pages/Pag101';
import Pag102 from './pages/H-Pages/Pag102';

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="transactions" element={<Transactions />} />
        <Route path="users" element={<Users />} />
        <Route path="process" element={<Process />} />
        <Route path="pag100" element={<Pag100 />} />
        <Route path="pag101" element={<Pag101 />} />
        <Route path="pag102" element={<Pag102 />} />

        {/* <Route path="page1" element={<Page1 />} />
        <Route path="page2" element={<Page2 />} />
        <Route path="page3" element={<Page3 />} />
        <Route path="page4" element={<Page4 />} />
        <Route path="page5" element={<Page5 />} /> */}
        <Route path="error" element={<Error />} />
        <Route path="filters" element={<Filtros />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;