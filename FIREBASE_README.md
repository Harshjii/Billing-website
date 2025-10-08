# Firebase Firestore Integration

This project uses Firebase Firestore for real-time data storage and synchronization.

## Collections Structure

### 1. Players Collection (`players`)
Stores player profile information.

**Document Structure:**
```json
{
  "id": "auto-generated",
  "name": "string (required)",
  "phone": "string (required, unique)",
  "email": "string (optional)",
  "notes": "string (optional)",
  "createdAt": "timestamp",
  "lastActivity": "timestamp"
}
```

**Indexes:**
- None required (basic CRUD operations)

### 2. Sessions Collection (`sessions`)
Stores active snooker/pool sessions.

**Document Structure:**
```json
{
  "id": "auto-generated",
  "table": "string",
  "player": "string",
  "phoneNumber": "string (optional)",
  "startTime": "string",
  "startTimestamp": "timestamp (optional)",
  "duration": "string",
  "tableAmount": "number",
  "items": "array of items",
  "totalAmount": "number",
  "paidAmount": "number (optional)",
  "paymentStatus": "unpaid | partial | paid | overdue",
  "ratePerMinute": "number (optional)"
}
```

### 3. Ended Sessions Collection (`ended_sessions`)
Stores completed sessions.

**Document Structure:**
```json
{
  "id": "auto-generated",
  "table": "string",
  "player": "string",
  "phoneNumber": "string (optional)",
  "startTime": "string",
  "startTimestamp": "timestamp (optional)",
  "endTime": "string",
  "endTimestamp": "timestamp",
  "duration": "string",
  "tableAmount": "number",
  "items": "array of items",
  "totalAmount": "number",
  "paidAmount": "number (optional)",
  "pendingAmount": "number (optional)",
  "paymentStatus": "paid | partial",
  "ratePerMinute": "number (optional)"
}
```

### 4. Pending Payments Collection (`pending_payments`)
Stores sessions with outstanding payments.

**Document Structure:**
```json
{
  "id": "auto-generated",
  "table": "string",
  "player": "string",
  "phoneNumber": "string (optional)",
  "startTime": "string",
  "startTimestamp": "timestamp (optional)",
  "endTime": "string",
  "endTimestamp": "timestamp",
  "duration": "string",
  "tableAmount": "number",
  "items": "array of items",
  "totalAmount": "number",
  "paidAmount": "number",
  "pendingAmount": "number",
  "paymentStatus": "partial | overdue",
  "ratePerMinute": "number (optional)"
}
```

### 5. Transactions Collection (`transactions`)
Stores all payment transactions for audit and tracking.

**Document Structure:**
```json
{
  "id": "auto-generated",
  "playerId": "string",
  "playerName": "string",
  "amount": "number",
  "paymentMethod": "cash | card | upi | bank_transfer | other",
  "description": "string (optional)",
  "transactionType": "payment | refund",
  "relatedSessionId": "string (optional)",
  "timestamp": "timestamp",
  "createdBy": "string (optional)"
}
```

**Indexes:**
- `playerId` (ascending) + `timestamp` (descending)
- `timestamp` (descending)

## Real-time Features

All collections use Firestore's `onSnapshot` for real-time updates:

- **Players**: Real-time player list updates
- **Sessions**: Live session tracking
- **Transactions**: Instant payment updates
- **Pending Payments**: Real-time outstanding balance updates

## Offline Support

Firestore provides built-in offline persistence:

- Data is cached locally when offline
- Changes sync when connection is restored
- Conflict resolution is handled automatically

## Security Rules

Basic security rules are defined in `firestore.rules`:

- All operations are currently allowed for demo purposes
- In production, implement proper authentication and authorization

## Firebase Configuration

Located in `src/firebase.ts`:

- Firestore database connection
- Collection constants
- Network status management
- Offline/online toggle functions

## Usage in Components

### Real-time Data Hooks

```typescript
// Get all players with real-time updates
const { players, loading } = usePlayers();

// Get transactions for specific player
const { transactions } = useTransactions(playerId);

// Get all sessions
const { sessions } = useSessions();
```

### Adding Data

```typescript
// Add a new player
await addPlayer({
  name: "John Doe",
  phone: "+1234567890",
  email: "john@example.com"
});

// Record a payment
await addTransaction({
  playerId: "player123",
  playerName: "John Doe",
  amount: 500,
  paymentMethod: "cash",
  transactionType: "payment"
});
```

## Deployment

1. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. Update Firebase config in production with environment variables.

## Monitoring

Monitor Firestore usage in the Firebase Console:
- Query performance
- Storage usage
- Real-time connection count
- Error logs