import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { DestinationPage } from './pages/DestinationPage';
import { PlannerPage } from './pages/PlannerPage';
import { PlanResultsPage } from './pages/PlanResultsPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { TripDetailPage, TripsPage } from './pages/TripsPages';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="destinations/:slug" element={<DestinationPage />} />
        <Route path="plan" element={<PlannerPage />} />
        <Route path="plan/results" element={<PlanResultsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
