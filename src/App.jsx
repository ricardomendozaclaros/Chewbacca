import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
// import Page1 from './pages/Page1';
// import Page2 from './pages/Page2';
// import Page3 from './pages/Page3';
// import Page4 from './pages/Page4';
// import Page5 from './pages/Page5';
import Layout from './pages/Layout';
import Filtros from './pages/Filters/Filters';

// oficial pages hardcode
import Transactions from './pages/pagesStatic/Transactions'
import Users from './pages/pagesStatic/Users'
import Process from './pages/pagesStatic/Process'

//manager
import Pag001 from './pages/pagesStatic/Pag001'
import Pag002 from './pages/pagesStatic/Pag002'
import Pag003 from './pages/pagesStatic/Pag003'

//marketing
import Pag100 from './pages/pagesStatic/Pag100'
import Pag101 from './pages/pagesStatic/Pag101';
import Pag102 from './pages/pagesStatic/Pag102';

//
import Pag200 from './pages/pagesStatic/Pag200';
import Pag201 from './pages/pagesStatic/Pag201';
import SheetDataPage from './pages/SheetDataPage';

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Pag101 />} />

        <Route path="transactions" element={<Transactions />} />
        <Route path="users" element={<Users />} />
        <Route path="process" element={<Process />} />

        <Route path="pag001" element={<Pag001 />} />
        <Route path="pag002" element={<Pag002 />} />
        <Route path="pag003" element={<Pag003 />} />

        <Route path="pag100" element={<Pag100 />} />
        <Route path="pag101" element={<Pag101 />} />
        <Route path="pag102" element={<Pag102 />} />
        <Route path="pag200" element={<Pag200 />} />
        <Route path="pag201" element={<Pag201 />} />

        {/* <Route path="page1" element={<Page1 />} />
        <Route path="page2" element={<Page2 />} />
        <Route path="page3" element={<Page3 />} />
        <Route path="page4" element={<Page4 />} />
        <Route path="page5" element={<Page5 />} /> */}
        
        <Route path="filters" element={<Filtros />} />

        <Route path="hojas" element={<SheetDataPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;