import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const APP_ID = "fukugyo";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "No session_id" }, { status: 400 });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Not paid" }, { status: 402 });
    }

    const email = session.customer_details?.email;
    const subId = session.subscription as string | null;
    let currentPeriodEnd: string | null = null;
    if (subId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripeSub = await stripe.subscriptions.retrieve(subId) as any;
      if (stripeSub?.current_period_end) {
        currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
      }
    }

    if (email) {
      const supabase = getSupabaseAdmin();
      await supabase.from("subscriptions").upsert(
        {
          email, app_id: APP_ID,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subId,
          stripe_session_id: sessionId,
          plan: "std", status: "active",
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_session_id" }
      );
    }

    const res = NextResponse.json({ ok: true });
    if (email) {
      res.cookies.set("user_email", email, {
        httpOnly: true, secure: true, sameSite: "lax",
        maxAge: 60 * 60 * 24 * 366, path: "/",
      });
    }
    res.cookies.set("stripe_premium", "1", {
      maxAge: 60 * 60 * 24 * 366, httpOnly: true, secure: true, sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false });
  }
}
