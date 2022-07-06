import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import HomePage from './HomePage';
import StockInfo from './StockInfo';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage/>}></Route>
        <Route path="/:stockName" element={<StockInfo/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
