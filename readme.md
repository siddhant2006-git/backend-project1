# Krish Backend Project

A scalable Node.js + Express.js backend boilerplate following a clean folder structure and best practices.

---

# 📁 Project Structure

```text
project/
├── .env.sample          # Sample environment variables
├── .env                 # Environment variables (ignored by Git)
├── .gitignore
├── package.json
├── public/              # Static assets
└── src/
    ├── app.js           # Express app configuration
    ├── constants.js     # Global constants (e.g., DB_NAME)
    ├── index.js         # Server entry point
    ├── db/
    │   └── db.js        # MongoDB connection
    ├── controllers/     # Business logic
    ├── middlewares/     # Custom Express middlewares
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    └── utils/
        ├── ApiError.js
        ├── ApiResponse.js
        └── asyncHandler.js
```

---

# 🛠 Tech Stack

- Node.js
- Express.js (v5)
- MongoDB
- Mongoose
- dotenv
- cookie-parser
- cors
- Nodemon

---

# 🚀 Installation

Clone the repository.

```bash
git clone <repository-url>
```

Move into the project.

```bash
cd project
```

Install dependencies.

```bash
npm install
```

---

# ⚙ Environment Variables

Create a `.env` file from `.env.sample`.

```env
PORT=8000

MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

DB_NAME=project

CORS_ORIGIN=http://localhost:5173
```

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 📂 Folder Explanation

| Folder | Purpose |
|---------|----------|
| db | Database connection |
| controllers | Request handling logic |
| middlewares | Authentication, validation, etc. |
| models | Mongoose schemas |
| routes | API endpoints |
| utils | Reusable helper classes/functions |
| public | Static assets |

---

# 📦 Utilities

## asyncHandler

Eliminates repetitive try/catch blocks for async Express controllers.

## ApiError

Creates standardized error responses.

Example:

```javascript
throw new ApiError(404, "User not found");
```

## ApiResponse

Creates standardized success responses.

Example:

```javascript
return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
);
```

---

# Example API Response

Success

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success"
}
```

Error

```json
{
  "statusCode": 404,
  "message": "User not found",
  "errors": []
}
```

---

# Available Scripts

```bash
npm run dev      # Start development server
npm start        # Start production server
```

---

# Best Practices

- Use ES Modules (`"type": "module"`).
- Store secrets in `.env`.
- Never commit `.env`.
- Keep controllers lightweight.
- Handle async errors using `asyncHandler`.
- Return consistent API responses.

---

# Author

Krish Naik Backend Practice