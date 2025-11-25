# useBoolean Hook - Usage Guide

## Overview

The `useBoolean` hook provides a clean API for managing boolean state (modals, dialogs, popups, etc.) without repetitive `setState(true)` and `setState(false)` calls.

## Basic Usage

### Before (Without Hook)

```jsx
const [showModal, setShowModal] = useState(false);
const [showDialog, setShowDialog] = useState(false);

// Later in code:
<Button onClick={() => setShowModal(true)}>Open</Button>
<Modal isOpen={showModal} onClose={() => setShowModal(false)} />
```

### After (With Hook)

```jsx
import useBoolean from '../hooks/useBoolean';

const [showModal, { open: openModal, close: closeModal }] = useBoolean();
const [showDialog, dialogActions] = useBoolean();

// Later in code:
<Button onClick={openModal}>Open</Button>
<Modal isOpen={showModal} onClose={closeModal} />

// Or with actions object:
<Button onClick={dialogActions.open}>Open Dialog</Button>
<Dialog isOpen={showDialog} onClose={dialogActions.close} />
```

## API Reference

### Return Value

```typescript
[value, actions];
```

- **value**: `boolean` - Current state value
- **actions**: Object with the following methods:
  - `on()` - Set to true
  - `off()` - Set to false
  - `toggle()` - Toggle between true/false
  - `set(newValue)` - Set to specific value
  - **Aliases**:
    - `open` → `on`
    - `close` → `off`
    - `show` → `on`
    - `hide` → `off`

## Examples

### Example 1: Modal Management

```jsx
const [showModal, { open, close }] = useBoolean();

return (
  <>
    <Button onClick={open}>Add Student</Button>
    <Modal isOpen={showModal} onClose={close}>
      <StudentForm />
    </Modal>
  </>
);
```

### Example 2: Multiple Modals

```jsx
const [showAddModal, addModalActions] = useBoolean();
const [showEditModal, editModalActions] = useBoolean();
const [showDeleteDialog, deleteDialogActions] = useBoolean();

// Clean and semantic
<Button onClick={addModalActions.open}>Add</Button>
<Button onClick={editModalActions.open}>Edit</Button>
<Button onClick={deleteDialogActions.open}>Delete</Button>
```

### Example 3: Toggle Functionality

```jsx
const [isExpanded, { toggle }] = useBoolean(false);

return (
  <Accordion>
    <AccordionButton onClick={toggle}>
      {isExpanded ? "Collapse" : "Expand"}
    </AccordionButton>
  </Accordion>
);
```

### Example 4: Conditional Actions

```jsx
const [isVisible, { show, hide }] = useBoolean(true);

useEffect(() => {
  if (selectedStudents.length > 0) {
    show();
  } else {
    hide();
  }
}, [selectedStudents, show, hide]);
```

## Benefits

1. **Less Boilerplate**: No more `setState(true)` and `setState(false)`
2. **Better Readability**: `open()` and `close()` are more semantic
3. **Consistent API**: All boolean states work the same way
4. **Performance**: Functions are memoized with `useCallback`
5. **Flexible**: Multiple aliases for different use cases

## Real-World Example (Students.jsx)

```jsx
// Before: 7 separate useState declarations
const [showModal, setShowModal] = useState(false);
const [showViewModal, setShowViewModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showBulkImportModal, setShowBulkImportModal] = useState(false);
const [showSemesterUpgradeModal, setShowSemesterUpgradeModal] = useState(false);
const [showBulkActionPopup, setShowBulkActionPopup] = useState(false);
const [showConfirmDialog, setShowConfirmDialog] = useState(false);

// After: Clean and organized
const [showModal, { open: openModal, close: closeModal }] = useBoolean();
const [showViewModal, { open: openViewModal, close: closeViewModal }] = useBoolean();
const [showEditModal, { open: openEditModal, close: closeEditModal }] = useBoolean();
const [showBulkImportModal, { open: openBulkImportModal, close: closeBulkImportModal }] = useBoolean();
const [showSemesterUpgradeModal, { open: openSemesterUpgradeModal, close: closeSemesterUpgradeModal }] = useBoolean();
const [showBulkActionPopup, bulkActionPopupActions] = useBoolean();
const [showConfirmDialog, { open: openConfirmDialog, close: closeConfirmDialog }] = useBoolean();

// Usage becomes cleaner:
<Button onClick={openModal}>Add Student</Button>
<Modal isOpen={showModal} onClose={closeModal} />
```

## Tips

1. **Destructure what you need**: Only destructure the methods you'll actually use
2. **Use aliases**: Choose the alias that makes most sense for your use case (open/close for modals, show/hide for elements, on/off for toggles)
3. **Actions object**: Use the actions object when you need to pass multiple methods around
4. **Memoization**: The hook already memoizes functions, so you can safely use them in dependency arrays
