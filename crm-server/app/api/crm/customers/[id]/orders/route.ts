import { NextRequest, NextResponse } from "next/server";
import { getMedusaCustomerOrders } from "@/lib/crm/medusa";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20");
  const data = await getMedusaCustomerOrders(params.id, page, pageSize);
  return NextResponse.json(data);
}
