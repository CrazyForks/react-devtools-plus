/**
 * Open in Editor API Route
 * 
 * This handles the /__open-in-editor endpoint used by React DevTools
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file')
  
  if (!file) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 })
  }

  try {
    // Parse file:line:column format
    const parts = file.split(':')
    const fileName = parts.slice(0, -2).join(':') || parts[0]
    
    const launchEditor = require('launch-editor')
    launchEditor(file, 'code') // Default to VS Code
    
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[React DevTools] Failed to open editor:', e)
    return NextResponse.json({ error: 'Failed to open editor' }, { status: 500 })
  }
}

