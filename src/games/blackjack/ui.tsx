import React from 'react';

/**
 * UI component for the blackjack table. At this stage of
 * development it renders a placeholder. Subsequent iterations will
 * include bet placement, dealing animations and interactive player
 * controls.
 */
const BlackjackUI: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#fff'
      }}
    >
      Blackjack table coming soon
    </div>
  );
};

export default BlackjackUI;