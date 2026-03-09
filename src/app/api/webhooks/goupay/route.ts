import { NextRequest, NextResponse } from "next/server";
import { POST as GouPayPOST } from "../../webhook/goupay/route";

/**
 * Mirror of the singular webhook route to handle plural 'webhooks' configuration
 */
export async function POST(request: NextRequest) {
    return GouPayPOST(request);
}

export async function GET() {
    return NextResponse.json({ message: "GouPay Webhooks endpoint is active. Please use POST for actual webhooks." });
}
