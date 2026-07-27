import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import LoginEmpresa from './pages/LoginEmpresa.jsx'
import RegisterEmpresa from './pages/RegisterEmpresa.jsx'
import LoginAdmin from './pages/LoginAdmin.jsx'
import Wallet from './pages/Wallet.jsx'
import EmpresaLayout from './layouts/EmpresaLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import EmpresaDashboard from './pages/empresa/Dashboard.jsx'
import Disenos from './pages/empresa/Disenos.jsx'
import Clientes from './pages/empresa/Clientes.jsx'
import Tarjetas from './pages/empresa/Tarjetas.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import Templates from './pages/admin/Templates.jsx'
import Empresas from './pages/admin/Empresas.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wallet/:codigoQr" element={<Wallet />} />

      <Route path="/empresa/login" element={<LoginEmpresa />} />
      <Route path="/empresa/registro" element={<RegisterEmpresa />} />
      <Route
        path="/empresa"
        element={
          <ProtectedRoute role="Empresa">
            <EmpresaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmpresaDashboard />} />
        <Route path="disenos" element={<Disenos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="tarjetas" element={<Tarjetas />} />
      </Route>

      <Route path="/admin/login" element={<LoginAdmin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="templates" element={<Templates />} />
        <Route path="empresas" element={<Empresas />} />
      </Route>
    </Routes>
  )
}

export default App
