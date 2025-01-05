import { Card } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface PaymentCardProps {
  annualPaymentStatus?: 'completed' | 'pending';
  emergencyCollectionStatus?: 'completed' | 'pending';
  emergencyCollectionAmount?: number;
}

const PaymentCard = ({ 
  annualPaymentStatus = 'pending',
  emergencyCollectionStatus = 'pending',
  emergencyCollectionAmount = 0
}: PaymentCardProps) => {
  return (
    <Card className="dashboard-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annual Payment Section */}
        <div className="p-6 glass-card rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Annual Payment</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-white">£40</p>
              <p className="text-sm text-dashboard-muted">Due: Jan 1st, 2025</p>
            </div>
            <div className="w-16 h-16">
              <CircularProgressbar
                value={annualPaymentStatus === 'completed' ? 100 : 0}
                text={annualPaymentStatus === 'completed' ? '✓' : '!'}
                styles={buildStyles({
                  textSize: '2rem',
                  pathColor: annualPaymentStatus === 'completed' ? '#4CAF50' : '#FFA726',
                  textColor: annualPaymentStatus === 'completed' ? '#4CAF50' : '#FFA726',
                  trailColor: 'rgba(255,255,255,0.1)',
                })}
              />
            </div>
          </div>
          <div className="text-sm text-dashboard-text">
            {annualPaymentStatus === 'completed' 
              ? 'Payment completed' 
              : 'Payment pending'}
          </div>
        </div>

        {/* Emergency Collection Section */}
        <div className="p-6 glass-card rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Emergency Collection</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-white">
                £{emergencyCollectionAmount}
              </p>
              <p className="text-sm text-dashboard-muted">One-time payment</p>
            </div>
            <div className="w-16 h-16">
              <CircularProgressbar
                value={emergencyCollectionStatus === 'completed' ? 100 : 0}
                text={emergencyCollectionStatus === 'completed' ? '✓' : '!'}
                styles={buildStyles({
                  textSize: '2rem',
                  pathColor: emergencyCollectionStatus === 'completed' ? '#4CAF50' : '#FFA726',
                  textColor: emergencyCollectionStatus === 'completed' ? '#4CAF50' : '#FFA726',
                  trailColor: 'rgba(255,255,255,0.1)',
                })}
              />
            </div>
          </div>
          <div className="text-sm text-dashboard-text">
            {emergencyCollectionStatus === 'completed' 
              ? 'Payment completed' 
              : 'Payment pending'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentCard;