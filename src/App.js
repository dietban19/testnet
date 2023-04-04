import {Route, Routes} from 'react-router-dom';
import Empty from './components/Empty'
import Layout from './components/Layout';
function App() {
  return(
    
      <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<Empty />} />
          <Route path="/notes" element={<Empty />} />
          <Route path="*" element={<Empty />} />
        </Route>
      </Routes>
  )

}

export default App;