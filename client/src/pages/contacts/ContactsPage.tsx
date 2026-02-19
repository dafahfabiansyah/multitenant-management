import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  Building2,
  Filter
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { useContactStore } from '@/stores/contactStore';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactFormDialog } from './components/ContactFormDialog';
import { DeleteContactDialog } from './components/DeleteContactDialog';
import type { Contact, ContactStatus, ContactSource } from '@/types';

export const ContactsPage = () => {
  const { contacts, fetchContacts, isLoading, pagination } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<ContactSource | 'all'>('all');
  const [openMenuContactId, setOpenMenuContactId] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const filters: any = { page: currentPage, page_size: 20 };
    
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (sourceFilter !== 'all') filters.source = sourceFilter;
    
    fetchContacts(filters);
  }, [fetchContacts, currentPage, searchQuery, statusFilter, sourceFilter]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsEditMode(false);
    setShowFormDialog(true);
    setOpenMenuContactId(null);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditMode(true);
    setShowFormDialog(true);
    setOpenMenuContactId(null);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteDialog(true);
    setOpenMenuContactId(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setOpenMenuContactId(null);
  };

  const getStatusBadgeColor = (status: ContactStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceBadgeColor = (source: ContactSource) => {
    switch (source) {
      case 'website':
        return 'bg-blue-100 text-blue-700';
      case 'referral':
        return 'bg-purple-100 text-purple-700';
      case 'ads':
        return 'bg-orange-100 text-orange-700';
      case 'cold_call':
        return 'bg-cyan-100 text-cyan-700';
      case 'event':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business contacts and leads
            </p>
          </div>
          
          <button
            onClick={handleAddContact}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts by name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* Status and Source Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'all')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as ContactSource | 'all')}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="ads">Ads</option>
                <option value="cold_call">Cold Call</option>
                <option value="event">Event</option>
              </select>

              {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSourceFilter('all');
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground">No contacts found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first contact'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Source
                    </th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="group hover:bg-accent/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {contact.first_name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <div className="flex flex-col gap-1 mt-1">
                              {contact.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {contact.company_name ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{contact.company_name}</p>
                              {contact.position && (
                                <p className="text-xs text-muted-foreground">{contact.position}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4">
                        {contact.source ? (
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getSourceBadgeColor(contact.source)}`}>
                            {contact.source.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setOpenMenuContactId(openMenuContactId === contact.id ? null : contact.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {contacts.length > 0 && pagination.total > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {contacts.length} of {pagination.total} contacts
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm text-foreground">
                  Page {currentPage} of {pagination.total_pages || 1}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= (pagination.total_pages || 1)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Menu - Rendered outside table */}
        {openMenuContactId !== null && (
          <>
            <div 
              className="fixed inset-0 z-100" 
              onClick={() => setOpenMenuContactId(null)}
            />
            <div 
              className="fixed z-101 bg-card rounded-lg border border-border shadow-lg"
              style={{
                top: `${(document.activeElement as HTMLElement)?.getBoundingClientRect().bottom + 8}px`,
                right: '24px',
                minWidth: '192px'
              }}
            >
              <div className="py-1">
                {contacts.find(c => c.id === openMenuContactId) && (
                  <>
                    <button
                      onClick={() => handleEditContact(contacts.find(c => c.id === openMenuContactId)!)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Contact
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contacts.find(c => c.id === openMenuContactId)!)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Contact
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* TODO: ContactFormDialog and DeleteContactDialog */}
        <ContactFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          contact={selectedContact}
          isEditMode={isEditMode}
        />
        <DeleteContactDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          contact={selectedContact}
        />
      </div>
    </AppLayout>
  );
};
