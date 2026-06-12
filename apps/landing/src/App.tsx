import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { RouteDetail } from '@/pages/RouteDetail';
import { Booking } from '@/pages/Booking';
import { BookingConfirm } from '@/pages/BookingConfirm';
import { BookingStatus } from '@/pages/BookingStatus';
import { Contact } from '@/pages/Contact';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/roteiro/:slug"
          element={
            <Layout>
              <RouteDetail />
            </Layout>
          }
        />
        <Route
          path="/roteiro/:slug/reservar"
          element={
            <Layout>
              <Booking />
            </Layout>
          }
        />
        <Route
          path="/reserva/:bookingId/confirmacao"
          element={
            <Layout>
              <BookingConfirm />
            </Layout>
          }
        />
        <Route
          path="/reserva/:bookingId"
          element={
            <Layout>
              <BookingStatus />
            </Layout>
          }
        />
        <Route
          path="/contato"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
