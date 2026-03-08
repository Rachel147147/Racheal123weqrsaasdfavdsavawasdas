import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import Tooltip from './Tooltip';
import './HelpIcon.css';

interface HelpIconProps {
  content: React.ReactNode;
  title?: string;
  size?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'tooltip' | 'modal';
}

const HelpIcon: React.FC<HelpIconProps> = ({
  content,
  title = '帮助信息',
  size = 16,
  position = 'top',
  variant = 'tooltip'
}) => {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'tooltip') {
    return (
      <Tooltip content={content} position={position}>
        <span className="help-icon-wrapper">
          <HelpCircle 
            size={size} 
            className="help-icon"
          />
        </span>
      </Tooltip>
    );
  }

  return (
    <>
      <button
        className="help-icon-button"
        onClick={() => setShowModal(true)}
        aria-label="显示帮助信息"
      >
        <HelpCircle size={size} className="help-icon" />
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="help-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="help-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="help-modal-header">
                <div className="help-modal-title">
                  <HelpCircle size={20} />
                  <h3>{title}</h3>
                </div>
                <button
                  className="help-modal-close"
                  onClick={() => setShowModal(false)}
                  aria-label="关闭"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="help-modal-content">
                {content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpIcon;
