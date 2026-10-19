import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { ShieldCheck, Sparkles, CreditCard, Calendar, UserCheck, Users, CheckCircle2 } from 'lucide-react';

const SubscriptionPanel = () => {
  const [currentSub, setCurrentSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123'
  });
  const [paying, setPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getPlans()
      ]);
      setCurrentSub(subRes);
      setPlans(plansRes.results || plansRes);
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckoutInit = (plan) => {
    setSelectedPlan(plan);
    setSuccessMessage('');
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      const updated = await subscriptionService.checkoutSubscription(selectedPlan.id);
      setCurrentSub(updated);
      setSuccessMessage(`Subscription upgraded to ${selectedPlan.name} successfully!`);
      setTimeout(() => {
        setCheckoutModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Payment checkout failed:", err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-2 font-semibold text-xs uppercase tracking-wider font-['Inter']">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
        <span>Loading subscriptions registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Inter'] text-slate-900">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
        <span>SaaS License Manager</span>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 tracking-tight">SaaS Subscriptions & Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage school subscription plans, license limits, and payment methods.</p>
      </div>

      {/* Current Active Plan Overview */}
      {currentSub ? (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider font-['Outfit']">
                {currentSub.plan?.name || 'Starter Plan'}
              </div>
              <Badge variant="success" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400">
                {currentSub.status || 'Active'}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-['Outfit']">Current Subscription Workspace</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" /> Start: {currentSub.start_date} • Due Expiry: {currentSub.end_date}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Max Students: {currentSub.plan?.max_students || 100}
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" /> Max Teachers: {currentSub.plan?.max_teachers || 10}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          No active subscription license found for this tenant school.
        </div>
      )}

      {/* Package Plans Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-['Outfit'] font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-indigo-600" /> Available SaaS Package Upgrades
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentSub?.plan?.id === p.id;
            return (
              <div 
                key={p.id} 
                className={`bg-white p-6 rounded-xl border flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow ${
                  isCurrent ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-['Outfit'] text-slate-900">{p.name}</h4>
                    {isCurrent && <Badge variant="primary">Active Plan</Badge>}
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-slate-900">₹{parseFloat(p.price || 0).toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 text-xs font-medium">/ {p.billing_cycle === 'YEARLY' ? 'year' : 'month'}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Up to {p.max_students} Students
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Up to {p.max_teachers} Teachers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Isolated Subdomain
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    variant={isCurrent ? 'outline' : 'primary'} 
                    className="w-full text-xs shadow-xs" 
                    onClick={() => handleCheckoutInit(p)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : `Upgrade to ${p.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Simulated Modal */}
      <Modal isOpen={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="Checkout Subscription Package">
        {selectedPlan && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 font-['Inter']">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-900">
              <span>Selected Plan: {selectedPlan.name}</span>
              <span className="text-emerald-600 font-mono text-sm font-bold">₹{parseFloat(selectedPlan.price || 0).toLocaleString('en-IN')} / {selectedPlan.billing_cycle === 'YEARLY' ? 'year' : 'month'}</span>
            </div>

            {successMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <Input 
                  label="Card Number" 
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  icon={CreditCard}
                  required 
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Expiry Date" 
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    placeholder="MM/YY"
                    required 
                  />
                  <Input 
                    label="CVV" 
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    placeholder="•••"
                    required 
                  />
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-start gap-2 font-medium">
                  <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-sky-600" />
                  <span>
                    Simulated Sandbox Checkout. No real charges are made. Your school subscription status will update instantly upon checkout.
                  </span>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2 shadow-xs" loading={paying}>
                  Complete simulated payment
                </Button>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionPanel;
