import React from 'react';
import { ProjectProvider } from './context/ProjectContext';
import StaffView from './components/StaffView';
import CustomerView from './components/CustomerView';

const isCustomerDisplay =
  new URLSearchParams(window.location.search).get('view') === 'customer';

export default function App() {
  return (
    <ProjectProvider>
      {isCustomerDisplay ? <CustomerView /> : <StaffView />}
    </ProjectProvider>
  );
}
