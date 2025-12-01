import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SetPassword from './pages/SetPassword';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
