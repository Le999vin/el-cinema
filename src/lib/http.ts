import { NextResponse } from "next/server";

export const jsonOk = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ data }, { status: 200, ...init });

export const jsonCreated = <T>(data: T) => NextResponse.json({ data }, { status: 201 });

export const jsonError = (message: string, status = 400, details?: unknown) =>
  NextResponse.json(
    {
      error: {
        message,
        details,
      },
    },
    { status },
  );

