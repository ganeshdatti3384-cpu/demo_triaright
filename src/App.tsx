import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pack365 from './pages/Pack365';
import Pack365Payment from './pages/Pack365Payment';
import PaymentGateway from './components/PaymentGateway';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import CourseLearning from './pages/CourseLearning';
import DynamicRegistrationForm from './components/DynamicRegistrationForm';
import CouponCode from './pages/CouponCode';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import RefundPolicy from '@/pages/RefundPolicy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pack365" element={<Pack365 />} />
            <Route path="/pack365-payment/:courseId" element={<Pack365Payment />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/course-learning/:courseId" element={<CourseLearning />} />
            <Route path="/dynamic-registration" element={<DynamicRegistrationForm />} />
            <Route path="/coupon-code" element={<CouponCode />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
