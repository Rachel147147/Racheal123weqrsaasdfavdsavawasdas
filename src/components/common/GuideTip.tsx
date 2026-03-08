import React from 'react';
import { motion } from 'framer-motion';
import { Info, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import './GuideTip.css';

interface GuideTipProps {
  type?: 'info' | 'tip' | 'warning' | 'success';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const GuideTip: React.FC<GuideTipProps> = ({
  type = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss
}) => {
  const defaultIcons = {
    info: <Info size={18} />,
    tip: <Lightbulb size={18} />,
    warning: <AlertTriangle size={18} />,
    success: <CheckCircle size={18} />
  };

  const displayIcon = icon || defaultIcons[type];

  return (
    <motion.div
      className={`guide-tip guide-tip-${type}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="guide-tip-icon">
        {displayIcon}
      </div>
      <div className="guide-tip-content">
        {title && <div className="guide-tip-title">{title}</div>}
        <div className="guide-tip-text">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button className="guide-tip-dismiss" onClick={onDismiss} aria-label="关闭提示">
          <span>&times;</span>
        </button>
      )}
    </motion.div>
  );
};

export default GuideTip;
