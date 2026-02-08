import { getCurrentUser, getCurrentSession } from './auth-helpers';

type TelemetryEvent = {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    timestamp: number;
};
type ErrorContext = {
    context: string;
    [key: string]: any;
};

class Telemetry {
    private static instance: Telemetry;
    private enabled: boolean;
    private constructor() {
        this.enabled = process.env.NODE_ENV === 'production';
    }
    static getInstance(): Telemetry {
        if (!Telemetry.instance) {
            Telemetry.instance = new Telemetry();
        }
        return Telemetry.instance;
    }
    track(event: string, properties?: Record<string, any>) {
        const user = getCurrentUser();
        const session = getCurrentSession();

        const payload: TelemetryEvent = {
            event,
            properties,
            timestamp: Date.now()
        };
        if (!this.enabled) return;
        // Send to analytics service (PostHog, Mixpanel, etc.)
        if (typeof window !== 'undefined' && (window as any).analytics) {
            (window as any).analytics.track(event, {
                ...properties,
                userId: user?.id,
                timestamp: payload.timestamp
            });
        }
        // Send to your backend
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        fetch('/api/telemetry', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        }).catch(err => {
            // Silent fail - don't break app for telemetry
            console.error('Telemetry error:', err);
        });
    }
    trackError(error: Error, context?: ErrorContext) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            ...context
        });
        // Send to error tracking (Sentry)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                extra: context
            });
        }
    }
    startTimer(name: string) {
        const start = performance.now();
        return {
            end: (properties?: Record<string, any>) => {
                const duration = performance.now() - start;
                this.track(`${name}.duration`, {
                    duration_ms: Math.round(duration),
                    ...properties
                });
            }
        };
    }
}
export const telemetry = Telemetry.getInstance();