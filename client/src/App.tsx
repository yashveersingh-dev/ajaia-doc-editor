import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './lib/userContext';
import Layout from './components/Layout';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DocumentList view="mine" />} />
            <Route path="/shared" element={<DocumentList view="shared" />} />
            <Route path="/doc/:id" element={<DocumentEditor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
