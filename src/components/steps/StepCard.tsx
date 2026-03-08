import { motion } from 'framer-motion';
import './StepCard.css';

interface StepCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function StepCard({ title, description, icon, children }: StepCardProps) {
  return (
    <motion.div
      className="step-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="step-header">
        <div className="step-icon">
          {icon}
        </div>
        <div className="step-info">
          <h2 className="step-title">{title}</h2>
          <p className="step-description">{description}</p>
        </div>
      </div>
      <div className="step-body">
        {children}
      </div>
    </motion.div>
  );
}
