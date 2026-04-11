# Smart Business Dashboard Architecture

This document visualizes the system design and architecture of the Smart Business Dashboard, optimized for portfolio presentation and technical reports.

---

## 1. Full System Architecture
A high-level overview of the layered architecture, showing the flow from stakeholders to the core data infrastructure.

```mermaid
graph TD
    subgraph ClientLayer [Client / User Layer]
        Admin["👤 Admin User"]
        Manager["👤 Manager User"]
        Staff["👤 Staff User"]
    end

    subgraph PresentationLayer [Presentation / Frontend Layer]
        Frontend["⚛️ React.js / Next.js"]
        UI["Dashboard UI / Charts / Reports"]
    end

    subgraph APILayer [API / Application Layer]
        Backend["🟢 Node.js + Express"]
        Controllers["Auth / Sales / Inventory / Analytics"]
    end

    subgraph LogicLayer [Business Logic & Security]
        Logic["🧮 Business Logic<br/>(Revenue, Profit, Trends)"]
        Security["🔒 Security Layer<br/>(JWT, RBAC, Rate Limiting)"]
    end

    subgraph DataLayer [Data Access & Storage]
        ORM["🛠️ Prisma / Mongoose"]
        PrimaryDB[("🗄️ PostgreSQL / MongoDB")]
        Cache[("⚡ Redis Cache")]
        Storage["☁️ S3 / Cloudinary"]
    end

    subgraph ExternalServices [External Integrations]
        Email["📧 NodeMailer / SendGrid"]
        Analytics["📊 Third-party Analytics"]
    end

    %% Interactions
    Admin & Manager & Staff -->|Browser/Mobile| Frontend
    Frontend -->|"HTTPS / REST API"| Backend
    Backend --> Logic
    Backend --> Security
    Backend --> ORM
    ORM --> PrimaryDB
    Backend --> Cache
    Backend --> Storage
    Backend --> ExternalServices
```

---

## 2. Database Schema (ERD)
The recommended relational structure for a professional business dashboard, using PostgreSQL.

```mermaid
erDiagram
    Users ||--|| Roles : "has"
    Users ||--o{ Reports : "creates"
    Products ||--o{ Sales : "appears in"
    Products ||--|| Inventory : "has"
    Customers ||--o{ Sales : "makes"
    Users ||--o{ AuditLogs : "triggers"

    Users {
        string id PK
        string username
        string password_hash
        int role_id FK
        datetime created_at
    }

    Roles {
        int id PK
        string name "Admin, Manager, Staff"
        string permissions
    }

    Products {
        string id PK
        string name
        string category
        decimal price
    }

    Inventory {
        string id PK
        string product_id FK
        int quantity
        int reorder_level
    }

    Sales {
        string id PK
        string product_id FK
        string customer_id FK
        int quantity
        decimal total_price
        datetime sale_date
    }

    Customers {
        string id PK
        string name
        string email
        string segment "VIP, Regular, New"
    }

    Expenses {
        string id PK
        string category
        decimal amount
        datetime date
    }

    AuditLogs {
        string id PK
        string user_id FK
        string action
        datetime timestamp
    }
```

---

## 3. DevOps & Deployment Workflow
Automated CI/CD pipeline ensuring code quality and seamless delivery.

```mermaid
graph LR
    Dev["💻 Developer"]
    GitHub["🐙 GitHub Repo"]
    Actions["⚙️ GitHub Actions"]
    Vercel["▲ Vercel (Frontend)"]
    Render["💎 Render (Backend)"]
    DB[("🐘 Neon PostgreSQL")]

    Dev -->|Push Code| GitHub
    GitHub -->|Trigger| Actions
    
    subgraph CICD [CI/CD Pipeline]
        Actions -->|"Build & Lint"| Actions
        Actions -->|"Run Tests"| Actions
    end

    Actions -->|Deploy| Vercel
    Actions -->|Deploy| Render
    Render --- DB
    Vercel --- Render
```

---

## 4. Key Strategic Advantages
- **Scalability**: Decoupled frontend/backend allows for independent scaling.
- **Security**: Implemented JWT with Role-Based Access Control (RBAC).
- **Automation**: CI/CD pipeline handles testing and deployment automatically.
- **Data Integrity**: Relational PostgreSQL schema ensures clean business data.
