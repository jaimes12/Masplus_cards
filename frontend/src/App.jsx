import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import LoginEmpresa from './pages/LoginEmpresa.jsx'
import RegisterEmpresa from './pages/RegisterEmpresa.jsx'
import LoginAdmin from './pages/LoginAdmin.jsx'
import Wallet from './pages/Wallet.jsx'
import Registro from './pages/Registro.jsx'
import EmpresaLayout from './layouts/EmpresaLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import EmpresaDashboard from './pages/empresa/Dashboard.jsx'
import Disenos from './pages/empresa/Disenos.jsx'
import Clientes from './pages/empresa/Clientes.jsx'
import Tarjetas from './pages/empresa/Tarjetas.jsx'
import Escanear from './pages/empresa/Escanear.jsx'
import Perfil from './pages/empresa/Perfil.jsx'
import Plan from './pages/empresa/Plan.jsx'
import PosterEditor from './pages/empresa/PosterEditor.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import Templates from './pages/admin/Templates.jsx'
import Empresas from './pages/admin/Empresas.jsx'
import DiscountCodes from './pages/admin/DiscountCodes.jsx'
import Planes from './pages/admin/Planes.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wallet/:codigoQr" element={<Wallet />} />
      <Route path="/registro/:codigo" element={<Registro />} />

      <Route path="/empresa/login" element={<LoginEmpresa />} />
      <Route path="/empresa/registro" element={<RegisterEmpresa />} />
      <Route
        path="/empresa/disenos/:id/poster"
        element={
          <ProtectedRoute role="Empresa">
            <PosterEditor />
          </ProtectedRoute>
        }
      />
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
        <Route path="escanear" element={<Escanear />} />
        <Route path="plan" element={<Plan />} />
        <Route path="perfil" element={<Perfil />} />
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
        <Route path="planes" element={<Planes />} />
        <Route path="codigos-descuento" element={<DiscountCodes />} />
      </Route>
    </Routes>
  )
}

export default App
