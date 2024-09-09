[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) ![NTLM Protocol Impl.](https://img.shields.io/badge/NTLM_Protocol_Impl.-Partial-orange) [![Node.js Package](https://github.com/Shadowfita/ntlm-server/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/Shadowfita/ntlm-server/actions/workflows/npm-publish.yml)

# NTLM Server Library

A TypeScript library that simplifies the integration of NTLM authentication in HTTP server applications.

Inspired by [express-ntlm](https://github.com/einfallstoll/express-ntlm)

---

## Table of Contents

-   [NTLM Server Library](#ntlm-server-library)
-   [Features](#features)
-   [Installation](#installation)
-   [Getting Started](#getting-started)
    -   [Basic Usage](#basic-usage)
    -   [Explanation of the Authentication Flow](#explanation-of-the-authentication-flow)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)
-   [License](#license)
-   [Support](#support)
-   [Examples](#examples)
    -   [Example 1: Express Middleware](#example-1-express-middleware)
    -   [Example 2: Next.js Middleware](#example-2-nextjs-middleware)

---

## Features

-   **NTLM v1 support** with extended session security (NTLM v2 security over NTLM v1).
-   Designed for **ease of integration** in server-side applications.
-   Implements the **server-side NTLM challenge-response flow**.
-   **Full NTLM protocol implementation** planned.

## Installation

To install the library, use `npm` or `yarn`:

```bash
npm install ntlm-server
yarn add ntlm-server
```

## Getting Started

Here’s a basic pseudo-typescript example of how this library could be used with a HTTP server. The server will challenge clients for NTLM authentication.

### Basic Usage

```typescript
const authHeader = request.headers["authorization"];

if (!authHeader) {
    // Step 1: Challenge the client for NTLM authentication
    respond({
        status: 401,
        headers: {
            "WWW-Authenticate": "NTLM",
        },
    });
    return;
}

if (authHeader.startsWith("NTLM ")) {
    // Step 2: Handle NTLM negotiation message
    const clientNegotiation = new NTLMNegotiationMessage(authHeader);

    if (clientNegotiation.messageType == MessageType.NEGOTIATE) {
        // Step 3: Send NTLM challenge message
        const serverChallenge = new NTLMChallengeMessage(clientNegotiation);
        const base64Challenge = serverChallenge.toBuffer().toString("base64");

        respond({
            status: 401,
            headers: {
                "WWW-Authenticate": `NTLM ${base64Challenge}`,
            },
        });
        return;
    } else if (clientNegotiation.messageType == MessageType.AUTHENTICATE) {
        // Step 4: Handle NTLM Authenticate message
        const clientAuthentication = new NTLMAuthenticateMessage(authHeader);

        // LDAP or AD bind and fetch user info here

        respond({
            status: 200,
        });
        return;
    } else {
        console.warn("Invalid NTLM Message received.");
    }
}

respond({
    status: 400,
    body: "Bad NTLM request",
});
```

### Explanation of the Authentication Flow

1. **Challenge the Client**: If the `Authorization` header is missing, the server responds with a `WWW-Authenticate: NTLM` header to challenge the client.
2. **NTLM Negotiation and Authentication**:
    - The client sends an NTLM Type 1 (Negotiate) message in the `Authorization` header.
    - The server replies with an NTLM Type 2 (Challenge) message.
    - The client responds with an NTLM Type 3 (Authenticate) message, which the server uses to authenticate the client.
3. **User Authentication**: Once authenticated, the server can access the user's information, such as their username.

## Roadmap

The current version of this library supports NTLM v1 with extended session security (offering NTLM v2 security over NTLM v1). Future releases will introduce full **NTLM protocol** support.

## Contributing

I welcome contributions! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

This project is licensed under the BSD-3-Clause License. Please see the [LICENSE](https://github.com/Shadowfita/ntlm-server?tab=BSD-3-Clause-1-ov-file) file for more information.

## Support

If you encounter issues or have any questions, feel free to open an issue.

I will continue to implement the remaining parts of the NTLM protocol as time permits, as I work full-time and have other commitments. I have no set timeline for completing this additional work, so contributions from the community are welcome.

If you're interested in helping out or have ideas, feel free to contribute.

## Examples

### Example 1: Express Middleware

An express middleware example that uses [ldapts](https://github.com/ldapts/ldapts) to fetch user information based on the [User Principal Name](https://learn.microsoft.com/en-us/windows/win32/ad/naming-properties#userprincipalname) returned by the [AuthenticateMessage](https://github.com/Shadowfita/ntlm-server/blob/main/src/messages/ntlm_authenticate_message.ts). Caching or cookies should be used to reduce the amount of challenge and LDAP requests.

```typescript
const app = express();
const port = 3001;

app.use(express.json());

const ntlmAuthMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        // Step 1: Challenge the client for NTLM authentication
        res.setHeader("WWW-Authenticate", "NTLM");
        return res.status(401).end();
    }

    if (authHeader.startsWith("NTLM ")) {
        const clientNegotiation = new NTLMNegotiationMessage(authHeader);

        // Step 2: Handle NTLM negotiation message
        if (clientNegotiation.messageType == MessageType.NEGOTIATE) {
            // Step 3: Send NTLM challenge message
            const serverChallenge = new NTLMChallengeMessage(clientNegotiation);
            const base64Challenge = serverChallenge.toBuffer().toString("base64");

            res.setHeader("WWW-Authenticate", `NTLM ${base64Challenge}`);
            return res.status(401).end();
        } else if (clientNegotiation.messageType == MessageType.AUTHENTICATE) {
            // Step 4: Handle NTLM Authenticate message
            const clientAuthentication = new NTLMAuthenticateMessage(authHeader);

            try {
                // LDAP or AD bind and fetch user info
                const client = new Client({
                    url: "ldap://myldapserver",
                    timeout: 0,
                    connectTimeout: 0,
                    strictDN: true,
                });

                // Anonymous bind example
                await client.bind("", "");

                const { searchEntries } = await client.search("DC=yourDC", {
                    filter: `(userPrincipalName=${clientAuthentication.userName}@${clientAuthentication.domainName}*)`,
                });

                // Attach the search result to the request object to access it in the next route handler
                req.user = searchEntries[0];
                return next(); // Pass control to the next middleware or route handler
            } catch (error) {
                console.error("LDAP Authentication error:", error);
                return res.status(500).send("Internal Server Error");
            }
        } else {
            console.warn("Invalid NTLM Message received.");
            return res.status(400).send("Invalid NTLM message");
        }
    }

    return res.status(400).send("Bad NTLM request");
};

// Applying the middleware to a specific route
app.get("/", ntlmAuthMiddleware, (req: Request, res: Response) => {
    // Access user details populated by the middleware
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

### Example 2: Next.js Middleware

A Next.js middleware example that secures routes based on the existence of a userName in the [AuthenticateMessage](https://github.com/Shadowfita/ntlm-server/blob/main/src/messages/ntlm_authenticate_message.ts). Caching or cookies should be used to reduce the amount of challenge requests.

This could be moved to an API endpoint where a library like [ldapts](https://github.com/ldapts/ldapts) could be used to fetch user information from ActiveDirectory.

```typescript
// middleware.ts

export async function middleware(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
        // Step 1: Challenge the client for NTLM authentication
        return NextResponse.json(
            {},
            {
                status: 401,
                headers: {
                    "WWW-Authenticate": "NTLM",
                },
            }
        );
    }

    if (authHeader.startsWith("NTLM ")) {
        const clientNegotiation = new NTLMNegotiationMessage(authHeader);

        // Step 2: Handle NTLM negotiation message
        if (clientNegotiation.messageType === MessageType.NEGOTIATE) {
            // Step 3: Send NTLM challenge message
            const serverChallenge = new NTLMChallengeMessage(clientNegotiation);
            const base64Challenge = serverChallenge.toBuffer().toString("base64");

            return NextResponse.json(
                {},
                {
                    status: 401,
                    headers: {
                        "WWW-Authenticate": `NTLM ${base64Challenge}`,
                    },
                }
            );
        } else if (clientNegotiation.messageType === MessageType.AUTHENTICATE) {
            // Step 4: Handle NTLM Authenticate message
            const clientAuthentication = new NTLMAuthenticateMessage(authHeader);

            try {
                // If authentication is successful, proceed with the request
                // You can store the userName in headers or cookies for further processing
                const response = NextResponse.next();
                response.headers.set("X-User", this.clientAuthentication?.userName ?? "");
                return response;
            } catch (error) {
                console.error("LDAP Authentication error:", error);
                return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
            }
        } else {
            console.warn("Invalid NTLM Message received.");
            return NextResponse.json({ error: "Invalid NTLM message" }, { status: 400 });
        }
    }

    return NextResponse.json({ error: "Bad NTLM request" }, { status: 400 });
}

// Optionally, apply the middleware to specific routes
export const config = {
    matcher: ["/api/:path*", "/protected-route/:path*"],
};
```
