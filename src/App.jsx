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
import Pag000 from './pages/pagesStatic/Pag000';
import Pag001 from './pages/pagesStatic/Pag001'
import Pag002 from './pages/pagesStatic/Pag002'
import Pag003 from './pages/pagesStatic/Pag003'
import Pag004 from './pages/pagesStatic/Pag004'
import Pag005 from './pages/pagesStatic/Pag005'

//marketing
import Pag100 from './pages/pagesStatic/Pag100'
import Pag101 from './pages/pagesStatic/Pag101';
import Pag102 from './pages/pagesStatic/Pag102';
import Pag103 from './pages/pagesStatic/Pag103';
import Pag104 from './pages/pagesStatic/Pag104';
import Pag105 from './pages/pagesStatic/Pag105';

//200
import Pag200 from './pages/pagesStatic/Pag200';
import Pag201 from './pages/pagesStatic/Pag201';
import Pag202 from './pages/pagesStatic/Pag202';
import Pag203 from './pages/pagesStatic/Pag203';
import Pag204 from './pages/pagesStatic/Pag204';
import Pag205 from './pages/pagesStatic/Pag205';

//300
import Pag300 from './pages/pagesStatic/Pag300';
import Pag301 from './pages/pagesStatic/Pag301';
import Pag302 from './pages/pagesStatic/Pag302';
import Pag303 from './pages/pagesStatic/Pag303';
import Pag304 from './pages/pagesStatic/Pag304';
import Pag305 from './pages/pagesStatic/Pag305';

//400
import Pag400 from './pages/pagesStatic/Pag400';
import Pag401 from './pages/pagesStatic/Pag401';
import Pag402 from './pages/pagesStatic/Pag402';
import Pag403 from './pages/pagesStatic/Pag403';
import Pag404 from './pages/pagesStatic/Pag404';
import Pag405 from './pages/pagesStatic/Pag405';

//500
import Pag500 from './pages/pagesStatic/Pag500';
import Pag501 from './pages/pagesStatic/Pag501';
import Pag502 from './pages/pagesStatic/Pag502';
import Pag503 from './pages/pagesStatic/Pag503';
import Pag504 from './pages/pagesStatic/Pag504';
import Pag505 from './pages/pagesStatic/Pag505';

//600
import Pag600 from './pages/pagesStatic/Pag600';
import Pag601 from './pages/pagesStatic/Pag601';
import Pag602 from './pages/pagesStatic/Pag602';
import Pag603 from './pages/pagesStatic/Pag603';
import Pag604 from './pages/pagesStatic/Pag604';
import Pag605 from './pages/pagesStatic/Pag605';

import SheetDataPage from './pages/SheetDataPage';

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Pag101 />} />

        <Route path="transactions" element={<Transactions />} />
        <Route path="users" element={<Users />} />
        <Route path="process" element={<Process />} />

        <Route path="pag000" element={<Pag000 />} />
        <Route path="pag001" element={<Pag001 />} />
        <Route path="pag002" element={<Pag002 />} />
        <Route path="pag003" element={<Pag003 />} />
        <Route path="pag004" element={<Pag004 />} />
        <Route path="pag005" element={<Pag005 />} />

        <Route path="pag100" element={<Pag100 />} />
        <Route path="pag101" element={<Pag101 />} />
        <Route path="pag102" element={<Pag102 />} />
        <Route path="pag103" element={<Pag103 />} />
        <Route path="pag104" element={<Pag104 />} />
        <Route path="pag105" element={<Pag105 />} />

        <Route path="pag200" element={<Pag200 />} />
        <Route path="pag201" element={<Pag201 />} />
        <Route path="pag202" element={<Pag202 />} />
        <Route path="pag203" element={<Pag203 />} />
        <Route path="pag204" element={<Pag204 />} />
        <Route path="pag205" element={<Pag205 />} />

        <Route path="pag300" element={<Pag300 />} />
        <Route path="pag301" element={<Pag301 />} />
        <Route path="pag302" element={<Pag302 />} />
        <Route path="pag303" element={<Pag303 />} />
        <Route path="pag304" element={<Pag304 />} />
        <Route path="pag305" element={<Pag305 />} />

        <Route path="pag400" element={<Pag400 />} />
        <Route path="pag401" element={<Pag401 />} />
        <Route path="pag402" element={<Pag402 />} />
        <Route path="pag403" element={<Pag403 />} />
        <Route path="pag404" element={<Pag404 />} />
        <Route path="pag405" element={<Pag405 />} />

        <Route path="pag500" element={<Pag500 />} />
        <Route path="pag501" element={<Pag501 />} />
        <Route path="pag502" element={<Pag502 />} />
        <Route path="pag503" element={<Pag503 />} />
        <Route path="pag504" element={<Pag504 />} />
        <Route path="pag505" element={<Pag505 />} />

        <Route path="pag600" element={<Pag600 />} />
        <Route path="pag601" element={<Pag601 />} />
        <Route path="pag602" element={<Pag602 />} />
        <Route path="pag603" element={<Pag603 />} />
        <Route path="pag604" element={<Pag604 />} />
        <Route path="pag605" element={<Pag605 />} />

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