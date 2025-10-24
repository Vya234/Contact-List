Project : Advanced Contact List 

This is a solution for the Tria frontend development assignment. The goal was to build a simple contact list, but I took the opportunity to demonstrate strong UX/UI design skills and product sense by building a full-featured, polished web application.

Deployed Application Link: [YOUR_DEPLOYMENT_LINK_HERE]

Project Setup

To run this project locally, follow these steps:

Clone the repository:

git clone [YOUR_REPO_LINK]


Navigate into the project directory:

cd [PROJECT_FOLDER_NAME]


Install the required dependencies:

npm install


Run the application in development mode:

npm run dev


The application will be available at http://localhost:5173.

Notable Features

This application goes well beyond the minimum requirements. It includes a wide range of modern, user-centric features designed to create a "best-in-class" experience.

Full CRUD Functionality: Users can Add, Edit (Update), and Delete contacts.

Light/Dark Mode: A theme toggle in the header allows users to switch between light and dark modes. The app respects the user's preference and saves it.

Local Storage Persistence: All contacts (fetched and user-created) are saved in the browser's local storage. Your data persists across page refreshes.

Toast Notifications: Non-intrusive "toast" pop-ups (using react-hot-toast) provide real-time feedback for actions like "Contact Added!" or "Email copied!".

Debounced Search: The search bar waits until the user has stopped typing (300ms) before filtering, preventing jarring re-renders on every keystroke.

Alphabetical Grouping: The contact list is automatically grouped by the first letter of the name, making the list scannable.

Advanced Form Validation: The "Add/Edit" form validates required fields (Name, Email, Phone) before allowing a save.

Multiple Modals: The app uses clean, animated modals for:

Viewing Contact Details

Confirming Deletions

Displaying this "App Features" list

Click-to-Copy: Users can click the email or phone number in the table to instantly copy it to their clipboard.

Click-to-Action: From the "View Details" modal, users can one-click to Call, Message, or Email a contact.

Country Code Selector: The phone number field includes a dropdown for all major country codes, making international numbers easy to add and parse.

Skeleton Loader: A smooth, animated skeleton screen is shown while the initial contacts are being fetched.

Fully Responsive Design: The entire application, from the header to the table and modals, is designed to work perfectly on both desktop and mobile devices.

Assumptions & Design Choices

The assignment brief intentionally left many details open to interpretation. Here are the key "product and engineering judgments" I made:

API vs. Local Storage: I assumed the user would want their changes (adds, edits, deletes) to be persistent. Therefore, the app fetches from the API only on the first load if no local data exists. After that, localStorage becomes the "source of truth." This provides a much better and more realistic user experience.

User Feedback: I decided that for a modern UI, disruptive alert() boxes are poor UX. I chose to use react-hot-toast for all feedback, as it's non-blocking and more professional.

Handling Ambiguity: I interpreted "demonstrate UX design Skills" as a prompt to build the best possible version of a contact list, not the minimum. This led me to add features like Dark Mode, Click-to-Copy, and Alphabetical Grouping, which are all standard patterns in high-quality apps.

Error Handling: Errors (like a failed API fetch) are also handled via toasts, preventing a single failed request from crashing the entire application.

Libraries Used

React: The core framework for building the application (required).

axios: Used to fetch the initial contact data from the jsonplaceholder API.

framer-motion: Used for all UI animations, including modal pop-ups, form expansion, list-item filtering, and the theme toggle icon. This was crucial for adding a layer of polish and professional "feel" to the app.

react-hot-toast: Used to provide clean, non-blocking toast notifications for user feedback and error handling.