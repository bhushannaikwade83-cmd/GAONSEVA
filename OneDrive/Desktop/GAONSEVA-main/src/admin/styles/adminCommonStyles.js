// Common styling patterns for admin pages
// This file provides reusable style objects for consistent UI across all admin pages

export const adminPageContainer = {
  p: 4,
  backgroundColor: '#ffffff',
  minHeight: '100vh'
};

export const adminPaper = {
  elevation: 2,
  p: 3,
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: 2
};

export const adminHeading = {
  color: '#1a1a1a',
  fontWeight: 600
};

export const adminButtonPrimary = {
  backgroundColor: '#1976d2',
  '&:hover': { backgroundColor: '#1565c0' }
};

export const adminButtonSecondary = {
  color: '#666',
  '&:hover': {
    borderColor: '#1a1a1a',
    backgroundColor: '#f5f5f5'
  }
};

export const adminTableContainer = {
  border: '1px solid #e0e0e0',
  borderRadius: 2,
  backgroundColor: '#ffffff'
};

export const adminTableHead = {
  backgroundColor: '#f5f5f5'
};

export const adminTableHeadCell = {
  color: '#1a1a1a',
  fontWeight: 600
};

export const adminTableRow = {
  '&:hover': {
    backgroundColor: '#fafafa'
  }
};

export const adminTableCell = {
  color: '#1a1a1a'
};

export const adminTableCellSecondary = {
  color: '#666'
};

export const adminDialog = {
  backgroundColor: '#ffffff',
  borderRadius: 2
};

export const adminDialogTitle = {
  color: '#1a1a1a',
  fontWeight: 600
};

export const adminTextField = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
};

export const adminCard = {
  backgroundColor: '#fafafa',
  border: '1px solid #e0e0e0',
  borderRadius: 2,
  '&:hover': {
    backgroundColor: '#f5f5f5',
    boxShadow: 2
  }
};

export const adminIconButtonEdit = {
  color: '#1976d2'
};

export const adminIconButtonDelete = {
  color: '#d32f2f'
};

