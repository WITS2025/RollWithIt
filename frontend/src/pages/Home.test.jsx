// // Home.test.jsx
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import Home from './Home';
// import { vi } from 'vitest';

// const mockLists = [
//   { pk: '1', title: 'Trip to Israel', items: [] },
//   { pk: '2', title: 'Camp Packing', items: [] },
// ];

// beforeEach(() => {
//   global.fetch = vi.fn(() =>
//     Promise.resolve({
//       json: () => Promise.resolve(mockLists),
//     })
//   );
// });

// afterEach(() => {
//   vi.restoreAllMocks();
// });

// test('fetches and displays packing list titles', async () => {
//   render(
//     <MemoryRouter>
//       <Home />
//     </MemoryRouter>
//   );

//   // Wait for the fetch to resolve and DOM to update
//   await waitFor(() => {
//     expect(screen.getByText('Trip to Israel')).toBeInTheDocument();
//     expect(screen.getByText('Camp Packing')).toBeInTheDocument();
//   });
// });

// test('shows input when Add New is clicked', async () => {
//   render(
//     <MemoryRouter>
//       <Home />
//     </MemoryRouter>
//   );

//   const addNewBtn = screen.getByLabelText('Add new list');
//   fireEvent.click(addNewBtn);

//   expect(await screen.findByPlaceholderText('List name')).toBeInTheDocument();
// });