# Mini-Productivity-Dashboard

Welcome to the **Mini-Productivity-Dashboard**, a web application designed to help you manage your tasks and goals efficiently. This app features a user-friendly interface to add, edit, delete, and track the completion of tasks and goals, along with an inspirational quote feature. The application is built with a separated frontend (React with Vite) and backend (Node.js with Express), deployed on Render, and uses MongoDB Atlas for data storage.

## Features
- User authentication (register and login).
- Add, edit, delete, and reorder tasks.
- Add, edit, delete, and reorder goals with weekly/monthly categorization.
- Visualize task and goal completion with pie charts.
- Fetch inspirational quotes with a caching mechanism.
- Responsive design for desktop and mobile devices.

## Prerequisites
Before setting up the project locally or deploying it, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or later recommended).
- [npm](https://www.npmjs.com/) (comes with Node.js).
- [Git](https://git-scm.com/) for version control.
- A code editor (e.g., VS Code).
- A MongoDB Atlas account for database hosting (free tier available).
- A Render account for deployment (free tier available).

## Local Setup
Follow these steps to set up and run the project locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Orka-kun/Mini-Productivity-Dashboard.git
   cd Mini-Productivity-Dashboard
   ```

2. **Set Up the Backend**
   - Navigate to the `server` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` directory with the following variables:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
     JWT_SECRET=<your-secret-key>
     ```
     - Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your MongoDB Atlas credentials and database name.
     - Use a strong, unique value for `JWT_SECRET`.

3. **Set Up the Frontend**
   - Navigate to the `client` directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `client` directory with the following variable:
     ```
     VITE_API_URL=http://localhost:5000
     ```
     - This points the frontend to the local backend server.

4. **Run the Application**
   - Start the backend server:
     ```bash
     cd ../server
     npm start
     ```
     - The server will run on `http://localhost:5000`.
   - Start the frontend development server:
     ```bash
     cd ../client
     npm run dev
     ```
     - Open `http://localhost:5173` in your browser to access the app.

5. **Test the Setup**
   - Register a new user with an email and password.
   - Log in and add tasks and goals to verify functionality.



4. **Test the Deployed App**
   - Visit the frontend URL and register/login to use the app.

## Usage
1. **Registration and Login**
   - Navigate to the login page and register with a unique email and password.
   - Log in with the same credentials to access the dashboard.

2. **Managing Tasks**
   - Add tasks by entering a title and clicking "Add Task".
   - Mark tasks as completed, edit, or delete them.
   - Reorder tasks by dragging and dropping.

3. **Managing Goals**
   - Add goals with a title and select "Weekly" or "Monthly" (or leave as "General").
   - Mark goals as completed, edit, or delete them.
   - Reorder goals by dragging and dropping.

4. **Viewing Charts**
   - The dashboard displays pie charts for task and goal completion once data is available.

5. **Inspirational Quotes**
   - A random quote is fetched and displayed, refreshing every hour or on demand with the `?refresh=true` parameter.

## Environment Variables
- **Backend (`server/.env`)**:
  - `MONGODB_URI`: MongoDB Atlas connection string.
  - `JWT_SECRET`: Secret key for JWT token generation.
- **Frontend (`client/.env`)**:
  - `VITE_API_URL`: URL of the backend server (e.g., `http://localhost:5000` for local, or the Render backend URL for deployment).





## Contact
For questions or support, please open an issue on the [GitHub repository](https://github.com/Orka-kun/Mini-Productivity-Dashboard) or contact me at [orkadas@gmail.com].