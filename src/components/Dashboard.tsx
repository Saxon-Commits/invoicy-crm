import React from 'react';
import {
  Document,
  ActivityLog,
  Customer,
  Expense,
  Task,
  CalendarEvent,
} from '../types';
import TopCustomers from './dashboard/TopCustomers';
import RecentDocuments from './dashboard/RecentDocuments';
import RecentExpenses from './dashboard/RecentExpenses';
import UpcomingEvents from './dashboard/UpcomingEvents';
import { useTextDocuments } from '../hooks/useTextDocuments';

interface DashboardProps {
  documents: Document[];
  editDocument: (doc: Document) => void;
  activityLogs: ActivityLog[];
  customers: Customer[];
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => void;
  expenses: Expense[];
  tasks: Task[];
  events: CalendarEvent[];
  onCreateInvoice: () => void;
  onSendEmail: () => void;
  onCreateMeeting: () => void;
  onInviteUser: () => void;
  onAddCustomer: () => void;
  onLogExpense: () => void;
  onAddTask: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  documents,
  customers,
  expenses,
  events,
}) => {
  const { textDocuments } = useTextDocuments();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* CRM Section */}
        <div className="h-full min-h-[300px]">
          <TopCustomers documents={documents} customers={customers} />
        </div>

        {/* Files Section */}
        <div className="h-full min-h-[300px]">
          <RecentDocuments documents={documents} textDocuments={textDocuments} />
        </div>

        {/* Expenses Section */}
        <div className="h-full min-h-[300px]">
          <RecentExpenses expenses={expenses} />
        </div>

        {/* Calendar Section */}
        <div className="h-full min-h-[300px]">
          <UpcomingEvents events={events} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;