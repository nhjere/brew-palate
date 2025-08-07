// mockups/ExpandedLayout.jsx
import { useEffect } from 'react';

const ExpandedLayout = ({ children }) => {
  useEffect(() => {
    // Remove the legacy styling when this layout is mounted
    document.getElementById('root')?.classList.remove('legacy');


    return () => {

      document.getElementById('root')?.classList.add('legacy');
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-orange-50">
      {children}
    </div>
  );
};

export default ExpandedLayout;
