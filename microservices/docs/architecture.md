# Microservices architecture

## Runtime topology

```mermaid
flowchart LR
    actor(["Student / assessor"]) --> browser["Browser"]
    browser -->|"Public HTTP :3000"| gateway

    subgraph docker["Docker Engine"]
        subgraph bridge["examapp-final-microservices-network · bridge"]
            gateway["examapp-gateway\nNative Node.js · non-root · :3000"]
            scoring["scoring-service\nFlask + Gunicorn · non-root · :5002"]
            analytics["analytics-service\n.NET 9 · non-root · :5001"]
            gateway -->|"Docker DNS\nPOST /api/score"| scoring
            gateway -->|"Docker DNS\nGET /api/analytics/overview"| analytics
        end
    end
```

Ports 5001 and 5002 are also published for transparent classroom inspection. Normal browser traffic enters through the gateway.

## Aggregate request

```mermaid
sequenceDiagram
    autonumber
    actor Assessor
    participant Gateway as Node gateway :3000
    participant Scoring as Flask scoring :5002
    participant Analytics as .NET analytics :5001

    Assessor->>Gateway: GET /api/demo
    par Score sample exam
        Gateway->>Scoring: POST /api/score {4, 5, 60}
        Scoring-->>Gateway: 80%, grade B, passed
    and Load performance overview
        Gateway->>Analytics: GET /api/analytics/overview
        Analytics-->>Gateway: total, average, pass rate, range
    end
    Gateway-->>Assessor: One structured aggregate response
```

## Responsibility boundaries

| Component | Owns | Does not own |
|---|---|---|
| Gateway | Public routes, query validation, service discovery, timeouts, aggregation, dashboard | Scoring rules or analytics math |
| Scoring | Correct count, percentage, grade band, pass/fail | User accounts, persistence, analytics history |
| Analytics | Average, pass rate, highest/lowest score, attempt overview | Authentication, routing, answer correctness |

## Delivery path

```mermaid
flowchart LR
    branch["Feature branch"] --> pr["Pull request"]
    pr --> ci["Microservices CI\nunit tests + .NET build + Compose smoke"]
    ci --> main["main"]
    main --> buildx["Docker Buildx publish"]
    buildx --> hub["Three Docker Hub images"]
    hub --> prod["docker-compose.prod.yml"]
```
