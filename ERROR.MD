Code Name Meaning Example
200 OK Request succeeded Data fetched successfully
201 Created New data created successfully User registered
204 No Content Success, but no response body Delete successful
400 Bad Request Request/data is invalid Required field missing
401 Unauthorized Login/token required or invalid JWT expired/missing
402 Payment Required Payment is required Paid API/service
403 Forbidden You are authenticated but don't have permission Normal user accessing admin API
404 Not Found Resource/URL doesn't exist Wrong API endpoint
405 Method Not Allowed HTTP method is wrong Using GET instead of POST
409 Conflict Request conflicts with existing data/state Duplicate email/user
422 Unprocessable Entity Validation failed Invalid email/field format
429 Too Many Requests Too many requests/rate limit API spam/rate limit
500 Internal Server Error Backend crashed/has an unexpected error Exception in Node/FastAPI
502 Bad Gateway Gateway/proxy got bad response from backend Nginx → backend problem
503 Service Unavailable Server/service currently unavailable Backend is down
504 Gateway Timeout Backend took too long to respond
