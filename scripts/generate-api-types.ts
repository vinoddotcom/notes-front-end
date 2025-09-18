#!/usr/bin/env node

// Using TypeScript with CommonJS module for scripts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Define the OpenAPI URL and output file path
const OPENAPI_URL = 'https://api-notes.vinod.digital/openapi.json';
const LOCAL_SCHEMA = path.resolve(process.cwd(), './openapi.json');
const OUTPUT_FILE = path.resolve(process.cwd(), './src/types/generated/api.ts');
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  console.log(`Generating TypeScript definitions from ${OPENAPI_URL}...`);
  
  try {
    // Try to use the remote schema first
    const remoteCommand = `npx openapi-typescript ${OPENAPI_URL} --output ${OUTPUT_FILE}`;
    execSync(remoteCommand, { stdio: 'inherit' });
  } catch {
    // Fallback to local schema if remote fails
    console.log(`Failed to fetch remote schema, using local fallback...`);
    const fallbackCommand = `npx openapi-typescript ${LOCAL_SCHEMA} --output ${OUTPUT_FILE}`;
    execSync(fallbackCommand, { stdio: 'inherit' });
  }
  
  console.log(`TypeScript definitions generated successfully at ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating API types:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
