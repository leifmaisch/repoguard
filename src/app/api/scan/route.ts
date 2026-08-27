import { NextResponse } from "next/server"

import { runScan, scanRequestSchema } from "@/lib/scanner/run-scan"
import {
  getErrorStatusCode,
  getPublicErrorMessage,
  logScanError,
} from "@/lib/scanner/sanitize-error"

function createScanStream(body: unknown): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      try {
        const parsed = scanRequestSchema.safeParse(body)

        if (!parsed.success) {
          send({
            type: "error",
            error: parsed.error.issues[0]?.message ?? "Invalid request",
          })
          controller.close()
          return
        }

        const result = await runScan(parsed.data, (progress) => {
          send({ type: "progress", ...progress })
        })

        send({ type: "result", result })
      } catch (error) {
        logScanError("stream scan", error)
        send({
          type: "error",
          error: getPublicErrorMessage(error),
        })
      } finally {
        controller.close()
      }
    },
  })
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (body && typeof body === "object" && "stream" in body && body.stream) {
    return new Response(createScanStream(body), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  }

  try {
    const parsed = scanRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      )
    }

    const result = await runScan(parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    logScanError("scan", error)
    return NextResponse.json(
      { error: getPublicErrorMessage(error) },
      { status: getErrorStatusCode(error) }
    )
  }
}
