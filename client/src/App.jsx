import React, { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again or reload the page.</h1>;
    }
    return this.props.children;
  }
}

// Header Component
const Header = ({ username, onLogout, toggleTheme, theme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  return (
    <header className="p-4 bg-[#1A1A1D] text-white flex justify-between items-center">
      <h1 className="text-xl">Productivity Dashboard</h1>
      {username && (
        <div className="flex items-center space-x-4">
          <span>Logged in: {username}</span>
          <button
            onClick={toggleTheme}
            className=" text-white p-2 rounded focus:outline-none hover:opacity-50 cursor-pointer"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="py-2.5 px-6 text-sm rounded-full border border-solid border-red-200 text-red-600 cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-red-600 hover:text-white">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

// AppContent Component to handle routing logic
const AppContent = () => {
  const [theme, setTheme] = useState('light');
  const [username, setUsername] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;

    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(response => {
        setUsername(response.data.username);
        if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
          navigate('/dashboard');
        }
      }).catch(error => {
        console.error('Token verification error:', error.response ? error.response.data : error.message);
        localStorage.removeItem('token');
        setUsername('');
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
        }
      });
    } else {
      if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/') {
        navigate('/login');
      }
    }
  }, [location, navigate]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-gray-900 text-white'}`}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home toggleTheme={toggleTheme} theme={theme} />} />
          <Route path="/login" element={<Auth setUsername={setUsername} />} />
          <Route path="/register" element={<Auth setUsername={setUsername} isLogin={false} />} />
          <Route
            path="/dashboard"
            element={
              <>
                <Header
                  username={username}
                  onLogout={() => setUsername('')}
                  toggleTheme={toggleTheme}
                  theme={theme}
                />
                <div className="">
                  <Dashboard username={username} theme={theme} />
                </div>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <AppContent />
      </Router>
    </DndProvider>
  );
}

export default App;
// import React, { useState, useEffect, Component } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// import Auth from './components/Auth';
// import Dashboard from './components/Dashboard';
// import Home from './components/Home';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import axios from 'axios';

// // Error Boundary Component
// class ErrorBoundary extends Component {
//   state = { hasError: false };

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   render() {
//     if (this.state.hasError) {
//       return <h1>Something went wrong. Please try again or reload the page.</h1>;
//     }
//     return this.props.children;
//   }
// }

// // Header Component
// const Header = ({ username, onLogout, toggleTheme, theme }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     onLogout();
//     navigate('/login');
//   };

//   return (
//     <header className="p-4 bg-blue-500 text-white flex justify-between items-center">
//       <h1 className="text-xl">Productivity Dashboard</h1>
//       {username && (
//         <div className="flex items-center space-x-4">
//           <span>Logged in: {username}</span>
//           <button
//             onClick={toggleTheme}
//             className="bg-gray-500 text-white p-2 rounded"
//           >
//             Toggle {theme === 'light' ? 'Dark' : 'Light'} Theme
//           </button>
//           <button onClick={handleLogout} className="bg-red-500 p-2 rounded">
//             Logout
//           </button>
//         </div>
//       )}
//     </header>
//   );
// };

// // AppContent Component to handle routing logic
// const AppContent = () => {
//   const [theme, setTheme] = useState('light');
//   const [username, setUsername] = useState('');
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     setTheme(savedTheme);
//     document.documentElement.className = savedTheme;

//     const token = localStorage.getItem('token');
//     if (token) {
//       axios.get('http://localhost:5000/api/auth/verify', {
//         headers: { Authorization: `Bearer ${token}` },
//       }).then(response => {
//         setUsername(response.data.username);
//         if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
//           navigate('/dashboard');
//         }
//       }).catch(error => {
//         console.error('Token verification error:', error.response ? error.response.data : error.message);
//         localStorage.removeItem('token');
//         setUsername('');
//         if (location.pathname !== '/login' && location.pathname !== '/register') {
//           navigate('/login');
//         }
//       });
//     } else {
//       if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/') {
//         navigate('/login');
//       }
//     }
//   }, [location, navigate]);

//   const toggleTheme = () => {
//     const newTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.className = newTheme;
//   };

//   return (
//     <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-gray-900 text-white'}`}>
//       <ErrorBoundary>
//         <Routes>
//           <Route path="/" element={<Home toggleTheme={toggleTheme} theme={theme} />} />
//           <Route path="/login" element={<Auth setUsername={setUsername} />} />
//           <Route path="/register" element={<Auth setUsername={setUsername} isLogin={false} />} />
//           <Route
//             path="/dashboard"
//             element={
//               <>
//                 <Header
//                   username={username}
//                   onLogout={() => setUsername('')}
//                   toggleTheme={toggleTheme}
//                   theme={theme}
//                 />
//                 <div className="">
//                   <Dashboard username={username} theme={theme} />
//                 </div>
//               </>
//             }
//           />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </ErrorBoundary>
//     </div>
//   );
// };

// // Main App Component
// function App() {
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <Router>
//         <AppContent />
//       </Router>
//     </DndProvider>
//   );
// }

// export default App;