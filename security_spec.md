# Security Specifications & Invariants

## Data Invariants
1. **Saved Posts (`savedPosts/{postId}`)**:
   - Every Saved Post document must represent a single bookmarked article.
   - The user ID in the document must match the authenticated user's ID (`request.auth.uid`).
   - The fields `userId`, `newsId`, `title`, and `createdAt` are mandatory.
   - `createdAt` must match the server timestamp (`request.time`).

2. **Read Later Posts (`readLater/{postId}`)**:
   - Every Read Later document must represent a queued article.
   - The user ID in the document must match the authenticated user's ID (`request.auth.uid`).
   - The fields `userId`, `newsId`, `title`, and `createdAt` are mandatory.
   - `createdAt` must match the server timestamp (`request.time`).

3. **Cached Feeds (`cachedFeeds/{categoryId}`)**:
   - Every cached feed document holds the pre-fetched RSS articles for a specific category tab.
   - Readers can access cached feeds anonymously to ensure instant loading for all users.
   - Only authenticated users can overwrite or update the global cache (`request.auth != null`) to prevent unauthenticated write spam.
   - `updatedAt` field is mandatory and must be an ISO format string.

---

## Negative Tests (The "Dirty Dozen" Payloads)

These payloads must be rejected by the Security Rules to maintain database integrity:

1. **Saved Post with Spoofed User ID**:
   `{ "userId": "attacker_id", "newsId": "news_1", "title": "Attack Title", "createdAt": "request.time" }` -> **DENIED**

2. **Saved Post with missing required key**:
   `{ "userId": "user_123", "title": "Missing NewsId", "createdAt": "request.time" }` -> **DENIED**

3. **Saved Post with a non-string or oversized ID**:
   `{ "userId": "user_123", "newsId": "a".repeat(300), "title": "Excessive ID Size", "createdAt": "request.time" }` -> **DENIED**

4. **Saved Post with client-side fake timestamp**:
   `{ "userId": "user_123", "newsId": "news_1", "title": "Fake Time", "createdAt": "2020-01-01T00:00:00Z" }` -> **DENIED**

5. **Read Later Post with Spoofed User ID**:
   `{ "userId": "attacker_id", "newsId": "news_2", "title": "Attack Title", "createdAt": "request.time" }` -> **DENIED**

6. **Read Later Post with missing required fields**:
   `{ "userId": "user_123", "newsId": "news_2", "createdAt": "request.time" }` -> **DENIED**

7. **Read Later Post with client-side fake timestamp**:
   `{ "userId": "user_123", "newsId": "news_2", "title": "Fake Time", "createdAt": "2020-01-01T00:00:00Z" }` -> **DENIED**

8. **Read Later Update Attempt by owner (Immutable block)**:
   Any update request to `/readLater/{postId}` -> **DENIED**

9. **Cached Feed Write by Unauthenticated User**:
   Anonymous write request to `/cachedFeeds/top` -> **DENIED**

10. **Cached Feed Write with oversized Category ID**:
    `categoryId` with length > 128 characters or matching invalid characters -> **DENIED**

11. **Cached Feed Write with missing `updatedAt` or `items` array**:
    `{ "categoryId": "top", "items": [] }` without `updatedAt` -> **DENIED**

12. **Cross-User savedPosts list request**:
    Attacking user listing savedPosts belonging to another user ID -> **DENIED**
