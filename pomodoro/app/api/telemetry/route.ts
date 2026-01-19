import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, properties, timestamp } = body;

        // Validate required fields
        if (!event || !timestamp) {
            return NextResponse.json(
                { error: 'Missing required fields: event, timestamp' },
                { status: 400 }
            );
        }

        // Get user from auth token (if present)
        let userId: string | null = null;
        const authHeader = request.headers.get('Authorization');

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);

            if (!authError && user) {
                userId = user.id;
            }
        }

        // Insert telemetry event
        const { data, error } = await supabase
            .from('telemetry_events')
            .insert({
                event,
                properties,
                user_id: userId,
                timestamp,
            })
            .select()
            .single();

        if (error) {
            console.error('Telemetry insert error:', error);
            return NextResponse.json(
                { error: 'Failed to store telemetry event' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, id: data.id }, { status: 201 });
    } catch (error) {
        console.error('Telemetry API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint for retrieving telemetry (admin only)
// GET endpoint for retrieving own telemetry
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const event = searchParams.get('event');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000); // Enforce max limit

        // Require authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only query events for the authenticated user
        let query = supabase
            .from('telemetry_events')
            .select('*')
            .eq('user_id', user.id) // 🔒 Force filter by user_id
            .order('created_at', { ascending: false })
            .limit(limit);

        if (event) {
            query = query.eq('event', event);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Telemetry query error:', error);
            return NextResponse.json(
                { error: 'Failed to retrieve telemetry events' },
                { status: 500 }
            );
        }

        return NextResponse.json({ events: data }, { status: 200 });
    } catch (error) {
        console.error('Telemetry GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
