# Error Suppression System

## Overview

This document describes the intelligent error suppression system implemented to reduce console noise from repetitive backend errors while maintaining system functionality and user experience.

## Components

### 1. RealTimeService Error Suppression (`realTimeService.js`)

**Purpose**: Suppress repetitive polling errors when the backend is down or experiencing issues.

**Features**:
- Tracks consecutive polling failures
- Suppresses logs after 3 consecutive errors
- Logs periodic summaries every 5 minutes
- Automatically recovers when connection is restored
- Maintains connection status for UI components

**Configuration**:
```javascript
suppressionThreshold: 3        // Suppress after 3 consecutive errors
suppressionInterval: 5 * 60 * 1000  // Log summary every 5 minutes
```

**Behavior**:
- First 3 errors: Log normally with full error details
- After 3 errors: Activate suppression and log warning
- During suppression: Log summary every 5 minutes
- On recovery: Log success message and reset counters

### 2. Dashboard API Error Suppression (`Dashboard.vue`)

**Purpose**: Suppress repetitive API errors during manual data refreshes and background updates.

**Features**:
- Tracks errors per API endpoint independently
- Suppresses 500 errors after 2 consecutive failures
- Logs periodic summaries every 2 minutes
- Resets tracking on successful API calls
- Reduces user notifications for known issues

**Configuration**:
```javascript
suppressionThreshold: 2        // Suppress after 2 consecutive 500 errors
suppressionInterval: 2 * 60 * 1000  // Log summary every 2 minutes
```

**Tracked Endpoints**:
- `resumen`: Sales summary data
- `usuarios`: User statistics
- `metodos`: Payment methods
- `ventasDia`: Daily sales data
- `topProducts`: Top selling products
- `recentActivities`: Recent activities

## User Experience Enhancements

### Connection Status Indicator

Shows real-time connection status in the dashboard header:
- **En Vivo** (Green): Real-time updates working
- **Actualizando...** (Orange): Currently updating data
- **Desactualizado** (Red): Data is stale
- **Desconectado** (Gray): No connection

### Connection Alert System

Displays a dismissible alert when:
- More than 5 consecutive backend errors occur
- Alert can be dismissed for 10 minutes
- Shows error count and severity level
- Automatically hides when connection recovers

### Smart Notifications

- Regular notifications for first few errors
- Suppressed notifications during known outages
- Recovery notifications when service resumes
- Different severity levels (info, warning, error)

## Technical Implementation

### Error Tracking Structure

```javascript
// RealTimeService
errorHistory: {
  polling: {
    consecutiveErrors: 0,
    lastErrorTime: null,
    lastErrorMessage: null,
    suppressionActive: false
  }
}

// Dashboard
apiErrorTracking: {
  endpoints: {
    [endpointKey]: {
      consecutiveErrors: 0,
      lastErrorTime: null,
      suppressionActive: false
    }
  },
  suppressionThreshold: 2,
  suppressionInterval: 2 * 60 * 1000,
  lastSummaryTime: {}
}
```

### Key Methods

**RealTimeService**:
- `handlePollingError()`: Process and potentially suppress polling errors
- `handlePollingRecovery()`: Reset tracking on successful connection
- `logSuppressedSummary()`: Log periodic summaries during suppression
- `resetErrorTracking()`: Clear error history

**Dashboard**:
- `shouldSuppressApiError()`: Determine if an API error should be suppressed
- `logApiErrorSummary()`: Log periodic API error summaries
- `resetApiErrorTracking()`: Clear error history for specific endpoints
- `handleSuppressedErrors()`: Show connection alerts for persistent issues

## Benefits

1. **Reduced Console Noise**: Eliminates repetitive error logs during backend outages
2. **Maintained Functionality**: System continues to work with empty states and graceful degradation
3. **User Awareness**: Clear indicators when there are connectivity issues
4. **Developer Debugging**: Still logs initial errors and periodic summaries for debugging
5. **Automatic Recovery**: System detects and announces when connectivity is restored

## Configuration

### Environment Variables

```env
# Real-time polling interval (milliseconds)
VITE_REALTIME_POLLING_INTERVAL=30000

# Error suppression thresholds
VITE_POLLING_ERROR_THRESHOLD=3
VITE_API_ERROR_THRESHOLD=2

# Summary intervals (milliseconds)
VITE_POLLING_SUMMARY_INTERVAL=300000  # 5 minutes
VITE_API_SUMMARY_INTERVAL=120000      # 2 minutes
```

### Adjusting Suppression Behavior

To modify suppression behavior:

1. **Change thresholds**: Modify `suppressionThreshold` values
2. **Adjust intervals**: Change `suppressionInterval` for summary frequency
3. **Add endpoints**: Extend tracking to new API endpoints
4. **Customize messages**: Update log messages and notifications

## Testing

### Simulating Backend Issues

1. Stop the backend server
2. Refresh the dashboard multiple times
3. Observe console logs being suppressed after threshold
4. Check for connection alerts in UI
5. Restart backend and verify recovery logging

### Expected Console Output

```
# Initial errors (logged normally)
❌ Error en polling: AxiosError {...}
⚠️ Error cargando ventasDia: Request failed with status code 500

# Suppression activation
⚠️ Polling: Suprimiendo logs de errores repetidos después de 3 errores consecutivos
⚠️ API: Suprimiendo logs de errores 500 para ventasDia después de 2 errores

# Periodic summaries (every 5/2 minutes)
📊 Polling: 15 errores consecutivos (último: Request failed with status code 500)
📊 API ventasDia: 8 errores 500 consecutivos

# Recovery
✅ Polling: Recuperado después de 15 errores
✅ API ventasDia: Recuperado de errores 500
```

## Best Practices

1. **Monitor Summaries**: Check periodic summary logs to understand backend health
2. **Adjust Thresholds**: Tune suppression thresholds based on your environment
3. **User Communication**: Use connection alerts to inform users of issues
4. **Graceful Degradation**: Ensure UI shows empty states instead of broken components
5. **Recovery Logging**: Always log when connectivity is restored for monitoring
